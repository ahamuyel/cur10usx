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

    // MasteryScore has no `topicTitle` column: group by topicId and resolve the
    // title through the relation, keeping the original response shape.
    const scores = await prisma.masteryScore.findMany({
      where,
      select: {
        topicId: true,
        subjectId: true,
        score: true,
        topic: { select: { title: true } },
      },
    })

    const grouped = new Map<string, { topicTitle: string; subjectId: string; total: number; sum: number }>()
    for (const s of scores) {
      if (!s.topic) continue
      const key = `${s.topicId}|${s.subjectId}`
      const entry = grouped.get(key) ?? { topicTitle: s.topic.title, subjectId: s.subjectId, total: 0, sum: 0 }
      entry.total += 1
      entry.sum += s.score
      grouped.set(key, entry)
    }

    const data = Array.from(grouped.values())
      .sort((a, b) => a.topicTitle.localeCompare(b.topicTitle))
      .slice(0, limit)
      .map((g) => ({
        topicTitle: g.topicTitle,
        averageScore: g.total > 0 ? g.sum / g.total : 0,
        totalExercises: g.total,
        subjectId: g.subjectId,
      }))

    return NextResponse.json(data)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
