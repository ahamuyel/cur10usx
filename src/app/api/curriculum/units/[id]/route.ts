import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/api-auth"
import { updateCurriculumUnitSchema } from "@/lib/validations/academic"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError } = await requirePermission(["school_admin", "teacher"], "canManageSubjects")
    if (authError) return authError

    const { id } = await params

    const unit = await prisma.curriculumUnit.findUnique({
      where: { id },
      include: {
        curriculumCourse: { select: { id: true, name: true } },
        topics: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })
    }

    return NextResponse.json(unit)
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

    const existing = await prisma.curriculumUnit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = updateCurriculumUnitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.curriculumUnit.update({
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

    const existing = await prisma.curriculumUnit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Unidade não encontrada" }, { status: 404 })
    }

    await prisma.curriculumUnit.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
