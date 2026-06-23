import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { LessonRecordStatus } from "@prisma/client"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requireRole(["school_admin", "teacher"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id

    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId") || ""
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const status = searchParams.get("status") || ""

    // Build filter criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      lesson: {
        schoolId,
      },
    }

    if (status) {
      where.status = status as LessonRecordStatus
    }

    if (role === "teacher") {
      // Teachers can only see their own records
      const teacher = await prisma.teacher.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!teacher) {
        return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
      }
      where.lesson.teacherId = teacher.id
    } else if (teacherId) {
      // Admins can filter by specific teacherId
      where.lesson.teacherId = teacherId
    }

    if (from || to) {
      where.date = {}
      if (from) {
        where.date.gte = new Date(from)
      }
      if (to) {
        where.date.lte = new Date(to)
      }
    }

    const records = await prisma.lessonRecord.findMany({
      where,
      include: {
        lesson: {
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
            teacher: {
              select: {
                id: true,
                name: true,
                foto: true,
                user: { select: { image: true } },
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
