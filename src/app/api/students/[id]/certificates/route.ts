import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher", "student", "parent"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id: studentId } = await params
    const role = session!.user.role

    const studentRecord = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true, classId: true, userId: true },
    })

    if (!studentRecord || studentRecord.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    if (role === "student" && studentRecord.userId !== session!.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === studentId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        include: { teacherClasses: true },
      })
      const hasClass = teacher?.teacherClasses.some((tc) => tc.classId === studentRecord.classId)
      if (!teacher || !hasClass) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    const certificates = await prisma.cycleCertificate.findMany({
      where: { studentId, schoolId },
      include: {
        academicYear: { select: { id: true, name: true } },
        school: { select: { id: true, name: true } },
      },
      orderBy: { completionGrade: "asc" },
    })

    return NextResponse.json({ data: certificates })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
