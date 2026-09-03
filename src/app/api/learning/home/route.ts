import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getLearningPath } from "@/lib/learning/learningService"

export async function GET() {
  try {
    const { error: authError, session } = await requirePermission(["student"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id

    const student = await prisma.student.findFirst({
      where: { userId, schoolId },
      select: { id: true },
    })
    if (!student) {
      return NextResponse.json({ error: "Estudante não encontrado" }, { status: 404 })
    }

    const courses = await prisma.curriculumCourse.findMany({
      where: { subject: { schoolId } },
      select: { id: true, name: true, grade: true, subjectId: true },
    })

    const paths = []
    for (const course of courses) {
      const detail = await getLearningPath(prisma, student.id, course.id)
      if (detail) {
        paths.push({
          id: detail.id,
          name: detail.name,
          grade: detail.grade,
          subjectId: detail.subjectId,
          subjectName: detail.subjectName,
          progress: detail.progress,
          completedLessons: detail.completedLessons,
          totalLessons: detail.totalLessons,
          continueLessonId: detail.continueLessonId,
        })
      }
    }

    const [xp, streak] = await Promise.all([
      prisma.studentXP.findUnique({ where: { studentId: student.id } }),
      prisma.studentStreak.findUnique({ where: { studentId: student.id } }),
    ])

    // First incomplete lesson across all paths (drives "Continue")
    let continueLessonId: string | null = null
    let continuePathId: string | null = null
    for (const p of paths) {
      if (p.continueLessonId) {
        continueLessonId = p.continueLessonId
        continuePathId = p.id
        break
      }
    }

    const recentAnswers = await prisma.answer.findMany({
      where: { studentId: student.id },
      orderBy: { answeredAt: "desc" },
      take: 10,
      include: {
        exercise: { select: { question: true, type: true, lesson: { select: { title: true } } } },
      },
    })

    return NextResponse.json({
      paths,
      continueLessonId,
      continuePathId,
      xp: { totalXP: xp?.totalXP ?? 0, level: xp?.level ?? 1 },
      streak: { currentStreak: streak?.currentStreak ?? 0, longestStreak: streak?.longestStreak ?? 0 },
      recentActivity: recentAnswers.map((a) => ({
        question: a.exercise.question,
        type: a.exercise.type,
        lessonTitle: a.exercise.lesson.title,
        isCorrect: a.isCorrect,
        answeredAt: a.answeredAt,
      })),
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
