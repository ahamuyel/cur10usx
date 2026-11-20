import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const providedAcademicYearId = searchParams.get("academicYearId")
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)
    const academicYearFilter = academicYearId ? { academicYearId } : {}

    const [school, students, teachers, classes, employees] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true, nif: true, address: true, city: true, provincia: true, phone: true, email: true } }),
      prisma.student.findMany({ where: { schoolId }, select: { id: true, classId: true, class: { select: { name: true, grade: true } } } }),
      prisma.teacher.findMany({ where: { schoolId }, select: { id: true } }),
      prisma.class.findMany({ where: { schoolId }, select: { id: true, name: true, grade: true, _count: { select: { students: true } } }, orderBy: { grade: "asc" } }),
      prisma.employee.findMany({ where: { schoolId }, select: { id: true, role: true, isActive: true } }),
    ])

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    // Distribution by grade
    const gradeDistribution = new Map<number, number>()
    for (const s of students) {
      const grade = s.class?.grade || 0
      gradeDistribution.set(grade, (gradeDistribution.get(grade) || 0) + 1)
    }

    // Attendance stats
    const attendanceRecords = await prisma.attendance.findMany({
      where: { schoolId, ...academicYearFilter },
      select: { status: true },
    })
    const attStats: Record<AttendanceStatus, number> = {
      presente: 0,
      ausente: 0,
      atrasado: 0,
      falta_justificada: 0,
      falta_injustificada: 0,
      dispensa: 0,
    }
    for (const a of attendanceRecords) {
      attStats[a.status]++
    }
    const presencas = attStats.presente + attStats.dispensa
    const faltas = attStats.ausente + attStats.falta_justificada + attStats.falta_injustificada
    const atrasos = attStats.atrasado
    const totalAtt = presencas + faltas + atrasos
    const overallAttendance = totalAtt > 0
      ? Math.round(((presencas + atrasos) / totalAtt) * 100)
      : 0

    // Results stats
    const results = await prisma.result.findMany({
      where: { schoolId, ...academicYearFilter },
      select: { score: true },
    })
    const scores = results.map((r) => r.score)
    const avgScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0
    const passCount = scores.filter((s) => s >= 10).length
    const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0

    // Employee distribution
    const employeeByRole = new Map<string, number>()
    for (const e of employees) {
      employeeByRole.set(e.role, (employeeByRole.get(e.role) || 0) + 1)
    }

    const doc = new jsPDF()

    // Header
    doc.setFontSize(18)
    doc.text("Relatório Institucional", 14, 18)
    doc.setFontSize(11)
    doc.text(school?.name || "", 14, 25)
    if (school?.nif) doc.text(`NIF: ${school.nif}`, 14, 32)
    if (school?.address) doc.text(`Endereço: ${school.address}`, 14, 39)
    if (school?.city || school?.provincia) doc.text(`Localização: ${school.city || ""}${school.provincia ? ` — ${school.provincia}` : ""}`, 14, 46)
    doc.text(`Ano Lectivo: ${academicYearName || "em curso"}`, 14, 53)
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-PT")}`, 14, 60)

    // Main stats
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Dados Gerais", 14, 72)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    autoTable(doc, {
      body: [
        ["Total de Alunos", students.length.toString()],
        ["Total de Professores", teachers.length.toString()],
        ["Total de Turmas", classes.length.toString()],
        ["Total de Funcionários", employees.length.toString()],
        ["Média Geral de Notas", avgScore.toFixed(1)],
        ["Taxa de Aprovação", `${passRate}%`],
        ["Assiduidade Geral", `${overallAttendance}%`],
        ["Total de Presenças", presencas.toString()],
        ["Total de Faltas", faltas.toString()],
      ],
      startY: 76,
      styles: { fontSize: 9, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold" },
        1: { halign: "center", cellWidth: 30 },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tableEnd = (doc as any).lastAutoTable?.finalY || 150
    tableEnd += 8

    // Distribution by grade
    if (gradeDistribution.size > 0) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Distribuição por Classes", 14, tableEnd)
      doc.setFont("helvetica", "normal")

      const gradeRows = Array.from(gradeDistribution.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([grade, count]) => [`${grade}ª Classe`, count.toString()])

      autoTable(doc, {
        body: gradeRows,
        startY: tableEnd + 4,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 40, fontStyle: "bold" },
          1: { halign: "center", cellWidth: 20 },
        },
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tableEnd = (doc as any).lastAutoTable?.finalY || (tableEnd + 30)
      tableEnd += 8
    }

    // Employee distribution
    if (employeeByRole.size > 0) {
      const roleLabels: Record<string, string> = {
        secretaria: "Secretaria",
        tesouraria: "Tesouraria",
        biblioteca: "Biblioteca",
        recursos_humanos: "Recursos Humanos",
        coordenacao: "Coordenação",
        direcao: "Direção",
        outros: "Outros",
      }

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Distribuição de Funcionários", 14, tableEnd)
      doc.setFont("helvetica", "normal")

      autoTable(doc, {
        body: Array.from(employeeByRole.entries()).map(([role, count]) => [roleLabels[role] || role, count.toString()]),
        startY: tableEnd + 4,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "bold" },
          1: { halign: "center", cellWidth: 20 },
        },
      })
    }

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
        "Content-Disposition": `attachment; filename="relatorio_institucional_${school?.name?.replace(/\s+/g, "_") || "escola"}.pdf"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
