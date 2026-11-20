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
      // `topicTitle` is not a MasteryScore column: aggregate by topicId and map
      // the title from the related topic below.
      prisma.masteryScore.findMany({
        where: { studentId, student: { schoolId } },
        select: {
          topicId: true,
          score: true,
          topic: { select: { title: true } },
        },
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

    const groupedTopics = new Map<string, { topicTitle: string; total: number; sum: number }>()
    for (const s of masteryScores) {
      if (!s.topic || !s.topicId) continue
      const key = s.topicId
      const entry = groupedTopics.get(key) ?? { topicTitle: s.topic.title, total: 0, sum: 0 }
      entry.total += 1
      entry.sum += s.score
      groupedTopics.set(key, entry)
    }

    const topics = Array.from(groupedTopics.values())
      .sort((a, b) => a.topicTitle.localeCompare(b.topicTitle))
      .map((g) => ({
        topicTitle: g.topicTitle,
        averageScore: g.total > 0 ? g.sum / g.total : 0,
        totalExercises: g.total,
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
