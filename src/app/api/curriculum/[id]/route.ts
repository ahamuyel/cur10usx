import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { updateCurriculumSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin", "teacher"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const curriculum = await prisma.curriculum.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            _count: { select: { units: true } },
          },
        },
      },
    })

    if (!curriculum) {
      return NextResponse.json({ error: "Currículo não encontrado" }, { status: 404 })
    }

    return NextResponse.json(curriculum)
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

    const existing = await prisma.curriculum.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Currículo não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateCurriculumSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.curriculum.update({
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

    const existing = await prisma.curriculum.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Currículo não encontrado" }, { status: 404 })
    }

    await prisma.curriculum.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
