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

    const [masteryScores, studentXP, streak, recentAnswers] = await Promise.all([
      prisma.masteryScore.groupBy({
        by: ["topicTitle"],
        where: { studentId, student: { schoolId } },
        _avg: { score: true },
        _count: { id: true },
        orderBy: { topicTitle: "asc" },
      }),
      prisma.studentXP.findUnique({ where: { studentId } }),
      prisma.studentStreak.findUnique({ where: { studentId } }),
      prisma.answer.findMany({
        where: { studentId },
        orderBy: { answeredAt: "desc" },
        take: 10,
        include: {
          exercise: {
            select: { question: true, type: true },
          },
        },
      }),
    ])

    const topics = masteryScores.map((s) => ({
      topicTitle: s.topicTitle,
      averageScore: s._avg.score ?? 0,
      totalExercises: s._count.id,
    }))

    const overallAverage =
      topics.length > 0
        ? topics.reduce((sum, t) => sum + t.averageScore, 0) / topics.length
        : 0

    const recentActivity = recentAnswers.map((a) => ({
      type: a.exercise.type,
      description: a.exercise.question,
      date: a.answeredAt,
      score: a.isCorrect ? a.pointsEarned : 0,
    }))

    return NextResponse.json({
      mastery: { topics, overallAverage },
      xp: { totalXP: studentXP?.totalXP ?? 0, level: studentXP?.level ?? 1 },
      streak: { currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0 },
      recentActivity,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
