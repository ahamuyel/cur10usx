import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateAnnouncementSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
        _count: { select: { reads: true } },
        reads: { where: { userId }, select: { id: true } },
      },
    })

    if (!announcement || announcement.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }

    const role = session!.user.role

    if (role === "student" || role === "parent") {
      const now = new Date()
      const isPublished = (announcement.publishedAt && announcement.publishedAt <= now) ||
        (!announcement.publishedAt && (!announcement.scheduledAt || announcement.scheduledAt <= now))

      if (!isPublished) {
        return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
      }

      if (role === "student") {
        const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { classId: true, class: { select: { courseId: true } } } })
        const isGlobal = !announcement.classId && !announcement.courseId && !announcement.targetUserId
        const isTargetedToClass = Boolean(student?.classId && announcement.classId === student.classId)
        const isTargetedToCourse = Boolean(student?.class?.courseId && announcement.courseId === student.class.courseId)
        const isTargetedToUser = announcement.targetUserId === userId

        if (!isGlobal && !isTargetedToClass && !isTargetedToCourse && !isTargetedToUser) {
          return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
        }
      } else if (role === "parent") {
        const parent = await prisma.parent.findFirst({
          where: { userId, schoolId },
          select: {
            students: {
              select: {
                userId: true,
                classId: true,
                class: { select: { courseId: true } },
              },
            },
          },
        })
        const childrenClassIds = parent?.students.map((s) => s.classId).filter(Boolean) as string[] ?? []
        const childrenCourseIds = parent?.students.map((s) => s.class?.courseId).filter(Boolean) as string[] ?? []
        const childrenUserIds = parent?.students.map((s) => s.userId).filter(Boolean) as string[] ?? []

        const isGlobal = !announcement.classId && !announcement.courseId && !announcement.targetUserId
        const isTargetedToClass = Boolean(announcement.classId && childrenClassIds.includes(announcement.classId))
        const isTargetedToCourse = Boolean(announcement.courseId && childrenCourseIds.includes(announcement.courseId))
        const isTargetedToUser = Boolean(announcement.targetUserId && (childrenUserIds.includes(announcement.targetUserId) || announcement.targetUserId === userId))

        if (!isGlobal && !isTargetedToClass && !isTargetedToCourse && !isTargetedToUser) {
          return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
        }
      }
    }

    return NextResponse.json({
      ...announcement,
      readCount: announcement._count.reads,
      isRead: announcement.reads.length > 0,
      _count: undefined,
      reads: undefined,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAnnouncements", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateAnnouncementSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { scheduledAt, ...rest } = parsed.data

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        ...rest,
        ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAnnouncements", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.announcement.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aviso não encontrado" }, { status: 404 })
    }

    await prisma.announcement.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
