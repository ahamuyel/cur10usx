import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { buildOrderBy } from "@/lib/query-helpers"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const teacherId = searchParams.get("teacherId") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    const where: Record<string, unknown> = {
      schoolId,
      ...(status ? { status } : {}),
    }

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { id: true },
      })
      if (teacher) where.teacherId = teacher.id
    } else if (teacherId) {
      where.teacherId = teacherId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate)
    }

    const orderBy = buildOrderBy(searchParams, ["date", "status"], { date: "desc" })

    const [data, total] = await Promise.all([
      prisma.teacherAttendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          teacher: { select: { id: true, name: true } },
        },
      }),
      prisma.teacherAttendance.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { teacherId, date, status, aulasPrevistas } = body

    if (!teacherId || !date || !status) {
      return NextResponse.json({ error: "Professor, data e estado são obrigatórios" }, { status: 400 })
    }

    const validStatuses = ["leccionada", "cancelada", "atrasada", "ausente"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, schoolId: true, name: true },
    })
    if (!teacher || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    const recordDate = new Date(date)
    recordDate.setHours(0, 0, 0, 0)

    const attendance = await prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: { teacherId, date: recordDate },
      },
      update: {
        status,
        ...(aulasPrevistas !== undefined ? { aulasPrevistas } : {}),
      },
      create: {
        teacherId,
        date: recordDate,
        status,
        aulasPrevistas: aulasPrevistas || 1,
        schoolId,
      },
    })

    logAudit({
      ...auditUser(session!),
      action: "CREATE",
      entity: "TeacherAttendance",
      entityId: attendance.id,
      schoolId,
      description: `Presença do professor ${teacher.name} em ${date}: ${status}`,
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
