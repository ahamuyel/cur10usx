import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageResults",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const providedAcademicYearId = searchParams.get("academicYearId")

    if (!classId) {
      return NextResponse.json({ error: "classId é obrigatório" }, { status: 400 })
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    const [school, classInfo, students] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, logo: true } }),
      prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true, grade: true, courseId: true },
      }),
      prisma.student.findMany({
        where: { classId, schoolId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ])

    if (!classInfo) {
      return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    // Get subjects
    let subjects: { id: string; name: string }[] = []
    if (classInfo.courseId) {
      const courseSubjects = await prisma.courseSubject.findMany({
        where: { courseId: classInfo.courseId },
        include: { subject: { select: { id: true, name: true } } },
      })
      subjects = courseSubjects.map((cs) => cs.subject)
    }

    if (subjects.length === 0) {
      const resultsWithSubjects = await prisma.result.findMany({
        where: {
          schoolId,
          studentId: { in: students.map((s) => s.id) },
          ...(academicYearId ? { academicYearId } : {}),
        },
        select: { subjectId: true, subject: { select: { id: true, name: true } } },
        distinct: ["subjectId"],
      })
      subjects = resultsWithSubjects.map((r) => r.subject)
    }

    subjects.sort((a, b) => a.name.localeCompare(b.name, "pt"))

    // Fetch results
    const results = await prisma.result.findMany({
      where: {
        schoolId,
        studentId: { in: students.map((s) => s.id) },
        subjectId: { in: subjects.map((s) => s.id) },
        ...(academicYearId ? { academicYearId } : {}),
      },
      select: { studentId: true, subjectId: true, score: true },
    })

    // Attendance stats
    const attendances = await prisma.attendance.findMany({
      where: {
        schoolId,
        classId,
        studentId: { in: students.map((s) => s.id) },
        ...(academicYearId ? { academicYearId } : {}),
      },
      select: { studentId: true, status: true },
    })

    // Per-student results
    const studentResults = new Map<string, Map<string, number[]>>()
    for (const r of results) {
      if (!studentResults.has(r.studentId)) studentResults.set(r.studentId, new Map())
      const subj = studentResults.get(r.studentId)!
      if (!subj.has(r.subjectId)) subj.set(r.subjectId, [])
      subj.get(r.subjectId)!.push(r.score)
    }

    const avg = (arr: number[] | undefined) => {
      if (!arr || arr.length === 0) return null
      return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
    }

    // Attendance per student
    const studentAtt = new Map<string, { presente: number; ausente: number; atrasado: number }>()
    for (const a of attendances) {
      if (!studentAtt.has(a.studentId)) {
        studentAtt.set(a.studentId, { presente: 0, ausente: 0, atrasado: 0 })
      }
      const s = studentAtt.get(a.studentId)!
      s[a.status as keyof typeof s]++
    }

    const doc = new jsPDF("landscape")

    // Header
    doc.setFontSize(16)
    doc.text("Relatório de Turma", 14, 18)
    doc.setFontSize(10)
    doc.text(school?.name || "", 14, 25)
    doc.text(`${classInfo.name} (${classInfo.grade}ª Classe)${academicYearName ? ` — ${academicYearName}` : ""}`, 14, 31)

    // Student performance table
    const head = ["N.º", "Aluno", ...subjects.map((s) => s.name), "Média", "Faltas", "Assid."]
    const body = students.map((student, idx) => {
      const sResults = studentResults.get(student.id)
      const sAtt = studentAtt.get(student.id) || { presente: 0, ausente: 0, atrasado: 0 }
      const subjectAvgs = subjects.map((subj) => {
        const scores = sResults?.get(subj.id)
        const a = avg(scores)
        return a !== null ? a.toFixed(1) : "—"
      })

      const allAvgs = subjectAvgs
        .map((v) => parseFloat(v))
        .filter((v) => !isNaN(v))

      const finalAvg = allAvgs.length > 0
        ? (allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(1)
        : "—"

      const totalAtt = sAtt.presente + sAtt.ausente + sAtt.atrasado
      const attPct = totalAtt > 0
        ? Math.round(((sAtt.presente + sAtt.atrasado) / totalAtt) * 100)
        : 0

      return [
        idx + 1,
        student.name,
        ...subjectAvgs,
        finalAvg,
        sAtt.ausente,
        `${attPct}%`,
      ]
    })

    // Pass/fail summary
    const passedCount = body.filter((row) => {
      const final = parseFloat(row[row.length - 3] as string)
      return !isNaN(final) && final >= 10
    }).length

    const failedCount = body.filter((row) => {
      const final = parseFloat(row[row.length - 3] as string)
      return !isNaN(final) && final < 10
    }).length

    const passRate = body.length > 0
      ? Math.round((passedCount / body.length) * 100)
      : 0

    autoTable(doc, {
      head: [head],
      body,
      startY: 38,
      styles: { fontSize: 7, cellPadding: 1.5 },
      headStyles: { fillColor: [41, 65, 122], textColor: 255, fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 40 },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || 150

    // Summary
    const allAvgsNum = body
      .map((row) => parseFloat(row[row.length - 3] as string))
      .filter((v) => !isNaN(v))
    const classAverage = allAvgsNum.length > 0
      ? Math.round((allAvgsNum.reduce((a, b) => a + b, 0) / allAvgsNum.length) * 10) / 10
      : 0

    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Resumo da Turma", 14, finalY + 12)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Total de Alunos: ${students.length}`, 14, finalY + 20)
    doc.text(`Média Geral: ${classAverage.toFixed(1)} valores`, 14, finalY + 26)
    doc.text(`Aprovados: ${passedCount} (${passRate}%)`, 14, finalY + 32)
    doc.text(`Reprovados: ${failedCount} (${100 - passRate}%)`, 14, finalY + 38)
    doc.text(`Taxa de Aprovação: ${passRate}%`, 14, finalY + 44)

    // Ranking (top 5)
    const ranked = body
      .map((row, idx) => ({
        name: row[1] as string,
        avg: parseFloat(row[row.length - 3] as string),
      }))
      .filter((r) => !isNaN(r.avg))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5)

    if (ranked.length > 0) {
      doc.setFont("helvetica", "bold")
      doc.text("Ranking Académico (Top 5)", 110, finalY + 12)
      doc.setFont("helvetica", "normal")
      ranked.forEach((r, i) => {
        doc.text(`${i + 1}. ${r.name} — ${r.avg.toFixed(1)}`, 110, finalY + 20 + i * 6)
      })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const ph = doc.internal.pageSize.getHeight()
      doc.setFontSize(7)
      doc.setTextColor(120)
      doc.text(`Gerado por cur10usx — ${new Date().toLocaleDateString("pt-PT")}`, 14, ph - 8)
      doc.text(`Página ${i}`, doc.internal.pageSize.getWidth() - 30, ph - 8)
    }

    const buffer = Buffer.from(doc.output("arraybuffer"))
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio_turma_${classInfo.name.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
