import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "teacher", "student", "parent"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userRole = session!.user.role
    const userId = session!.user.id
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, grade: true, period: true } },
        school: { select: { id: true, name: true, city: true, logo: true } },
      },
    })

    // Multi-tenant security: hide cross-tenant existence
    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    // Role-based access: school_admin always, teacher if teaches student's class, student if self, parent if linked
    if (userRole === "student" && student.userId !== userId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (userRole === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === id)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }
    if (userRole === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId, schoolId },
        select: { teacherClasses: { select: { classId: true } } },
      })
      const teacherClassIds = teacher?.teacherClasses.map((tc) => tc.classId) || []
      if (!student.classId || !teacherClassIds.includes(student.classId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    // Fetch results and attendance
    const [results, attendances] = await Promise.all([
      prisma.result.findMany({
        where: { studentId: id, schoolId: student.schoolId },
        include: { subject: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.findMany({
        where: { studentId: id, schoolId: student.schoolId },
      }),
    ])

    // Group results by subject for averages
    const subjectMap: Record<string, { name: string; scores: number[] }> = {}
    for (const r of results) {
      if (!subjectMap[r.subjectId]) {
        subjectMap[r.subjectId] = { name: r.subject.name, scores: [] }
      }
      subjectMap[r.subjectId].scores.push(r.score)
    }
    const averages = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      average: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      count: data.scores.length,
    }))

    // Attendance summary
    const presente = attendances.filter((a) => a.status === "presente").length
    const ausente = attendances.filter((a) => a.status === "ausente").length
    const atrasado = attendances.filter((a) => a.status === "atrasado").length
    const total = attendances.length
    const attendancePercent = total > 0 ? Math.round(((presente + atrasado) / total) * 100) : 0

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        foto: student.foto,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        documentType: student.documentType,
        documentNumber: student.documentNumber,
        class: student.class,
        school: student.school,
      },
      results: results.map((r) => ({
        id: r.id,
        subjectName: r.subject.name,
        score: r.score,
        type: r.type,
        date: r.date,
      })),
      attendance: { total, presente, ausente, atrasado, percent: attendancePercent },
      averages,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
