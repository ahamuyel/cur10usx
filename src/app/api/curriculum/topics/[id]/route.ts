import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { updateCurriculumTopicSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin", "teacher"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const topic = await prisma.curriculumTopic.findUnique({
      where: { id },
      include: {
        curriculumUnit: { select: { id: true, title: true } },
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!topic) {
      return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 })
    }

    return NextResponse.json(topic)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const existing = await prisma.curriculumTopic.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateCurriculumTopicSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.curriculumTopic.update({
      where: { id },
      data: parsed.data,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const existing = await prisma.curriculumTopic.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Tópico não encontrado" }, { status: 404 })
    }

    await prisma.curriculumTopic.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
