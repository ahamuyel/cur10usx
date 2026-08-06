import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createMessageSchema } from "@/lib/validations/academic"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageMessages", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where = {
      schoolId,
      OR: [
        { fromId: session!.user.id },
        { toId: session!.user.id },
        { toAll: true },
      ],
    }

    const [data, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          from: { select: { id: true, name: true } },
          to: { select: { id: true, name: true } },
        },
      }),
      prisma.message.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageMessages", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { toId, toAll, subject, body: msgBody } = parsed.data
    const role = session!.user.role

    if (toAll && role !== "school_admin" && role !== "teacher") {
      return NextResponse.json({ error: "Apenas administradores ou professores podem enviar mensagens gerais" }, { status: 403 })
    }

    if (toId) {
      const recipient = await prisma.user.findFirst({
        where: { id: toId, schoolId },
      })
      if (!recipient) {
        return NextResponse.json({ error: "Destinatário não encontrado nesta escola" }, { status: 404 })
      }
    }

    const created = await prisma.message.create({
      data: {
        subject,
        body: msgBody,
        fromId: session!.user.id,
        toId: toId || null,
        toAll: toAll || false,
        schoolId,
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
