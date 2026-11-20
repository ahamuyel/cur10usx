import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student"], "canManageLessons", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const studentIdParam = searchParams.get("studentId") || ""

    let studentId: string

    if (role === "student") {
      const student = await prisma.student.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!student) {
        return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
      }
      studentId = student.id
    } else {
      if (!studentIdParam) {
        return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 })
      }
      studentId = studentIdParam
    }

    const studentXP = await prisma.studentXP.findUnique({
      where: { studentId },
    })

    const recentEvents = await prisma.xPEvent.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      totalXP: studentXP?.totalXP ?? 0,
      level: studentXP?.level ?? 1,
      recentEvents,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
