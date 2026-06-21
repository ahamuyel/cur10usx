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
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId")
    const providedAcademicYearId = searchParams.get("academicYearId")

    let targetTeacherId = teacherId
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { id: true },
      })
      if (!teacher) {
        return NextResponse.json({ error: "Perfil de professor não encontrado" }, { status: 404 })
      }
      targetTeacherId = teacher.id
    }

    if (!targetTeacherId) {
      return NextResponse.json({ error: "teacherId é obrigatório" }, { status: 400 })
    }

    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)
    const academicYearFilter = academicYearId ? { academicYearId } : {}

    const [school, teacher] = await Promise.all([
      prisma.school.findUnique({ where: { id: schoolId }, select: { name: true } }),
      prisma.teacher.findUnique({
        where: { id: targetTeacherId },
        include: {
          teacherClasses: { include: { class: { select: { id: true, name: true } } } },
          teacherSubjects: { include: { subject: { select: { id: true, name: true } } } },
        },
      }),
    ])

    if (!teacher) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    let academicYearName = ""
    if (academicYearId) {
      const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId }, select: { name: true } })
      academicYearName = ay?.name || ""
    }

    const classIds = teacher.teacherClasses.map((tc) => tc.classId)
    const subjectIds = teacher.teacherSubjects.map((ts) => ts.subjectId)

    // Teacher attendance
    const attendanceRecords = await prisma.teacherAttendance.findMany({
      where: { teacherId: targetTeacherId, schoolId, ...academicYearFilter },
    })

    const totalLessons = attendanceRecords.length
    const taughtCount = attendanceRecords.filter((a) => a.status === "leccionada").length
    const absentCount = attendanceRecords.filter((a) => a.status === "ausente").length
    const lateCount = attendanceRecords.filter((a) => a.status === "atrasada").length
    const cancelledCount = attendanceRecords.filter((a) => a.status === "cancelada").length
    const compliancePercentage = totalLessons > 0
      ? Math.round(((taughtCount + cancelledCount) / totalLessons) * 100)
      : 0

    // Class performance
    const students = await prisma.student.findMany({
      where: { classId: { in: classIds }, schoolId },
      select: { id: true, name: true, classId: true },
    })

    const results = await prisma.result.findMany({
      where: {
        schoolId,
        subjectId: { in: subjectIds },
        studentId: { in: students.map((s) => s.id) },
        ...academicYearFilter,
      },
      select: { studentId: true, subjectId: true, score: true, student: { select: { classId: true } } },
    })

    // Per-class averages
    const classAverages = teacher.teacherClasses.map((tc) => {
      const classStudentIds = students.filter((s) => s.classId === tc.class.id).map((s) => s.id)
      const classResults = results.filter((r) => classStudentIds.includes(r.studentId))
      const scores = classResults.map((r) => r.score)
      const avg = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0
      const passCount = scores.filter((s) => s >= 10).length
      const passRate = scores.length > 0 ? Math.round((passCount / scores.length) * 100) : 0
      return {
        className: tc.class.name,
        studentCount: classStudentIds.length,
        average: avg,
        passRate,
      }
    })

    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text("Relatório de Desempenho Docente", 14, 18)
    doc.setFontSize(10)
    doc.text(school?.name || "", 14, 25)
    doc.text(`Professor: ${teacher.name}`, 14, 32)
    doc.text(`Ano Lectivo: ${academicYearName || "em curso"}`, 14, 39)

    // Subjects & Classes
    const subjectNames = teacher.teacherSubjects.map((ts) => ts.subject.name).join(", ")
    const classNames = teacher.teacherClasses.map((tc) => tc.class.name).join(", ")

    doc.setFontSize(9)
    doc.text(`Disciplinas: ${subjectNames}`, 14, 47)
    doc.text(`Turmas: ${classNames}`, 14, 53)

    // Attendance table
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Assiduidade", 14, 63)
    doc.setFont("helvetica", "normal")

    autoTable(doc, {
      body: [
        ["Total de Aulas", totalLessons.toString()],
        ["Aulas Leccionadas", taughtCount.toString()],
        ["Faltas", absentCount.toString()],
        ["Atrasos", lateCount.toString()],
        ["% Cumprimento", `${compliancePercentage}%`],
      ],
      startY: 67,
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: "bold" },
        1: { cellWidth: 30, halign: "center" },
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tableEnd = (doc as any).lastAutoTable?.finalY || 120
    tableEnd += 8

    // Class performance
    if (classAverages.length > 0) {
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text("Desempenho das Turmas", 14, tableEnd)
      doc.setFont("helvetica", "normal")

      autoTable(doc, {
        head: [["Turma", "Alunos", "Média", "Taxa de Aprovação"]],
        body: classAverages.map((c) => [c.className, c.studentCount.toString(), c.average.toFixed(1), `${c.passRate}%`]),
        startY: tableEnd + 4,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [41, 65, 122], textColor: 255, fontSize: 9 },
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
        "Content-Disposition": `attachment; filename="relatorio_professor_${teacher.name.replace(/\s+/g, "_")}.pdf"`,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
