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
    const subjectId = searchParams.get("subjectId") || ""
    const limit = parseInt(searchParams.get("limit") || "50")

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      studentId,
      student: { schoolId },
      ...(subjectId ? { subjectId } : {}),
    }

    const scores = await prisma.masteryScore.groupBy({
      by: ["topicTitle", "subjectId"],
      where,
      _avg: { score: true },
      _count: { id: true },
      orderBy: { topicTitle: "asc" },
      take: limit,
    })

    const data = scores.map((s) => ({
      topicTitle: s.topicTitle,
      averageScore: s._avg.score ?? 0,
      totalExercises: s._count.id,
      subjectId: s.subjectId,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
