import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["student", "parent", "teacher", "school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const role = session!.user.role
    const { id } = await params

    const justification = await prisma.justification.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } },
          },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            class: { select: { id: true, name: true } },
            lesson: { select: { id: true, subjectId: true, subject: { select: { name: true } } } },
          },
        },
      },
    })

    if (!justification || justification.schoolId !== schoolId) {
      return NextResponse.json({ error: "Justificação não encontrada" }, { status: 404 })
    }

    if (role === "student") {
      const student = await prisma.student.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!student || justification.studentId !== student.id) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      const linkedIds = parent?.students.map((s) => s.id) || []
      if (!linkedIds.includes(justification.studentId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    return NextResponse.json(justification)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
