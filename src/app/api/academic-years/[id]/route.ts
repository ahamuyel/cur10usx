import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createAcademicYearSchema, updateAcademicYearSchema } from "@/lib/validations/catalog"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const year = await prisma.academicYear.findFirst({
      where: { id, schoolId },
      include: {
        _count: { select: { enrollments: true, classes: true, results: true } },
      },
    })
    if (!year) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })

    return NextResponse.json(year)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.academicYear.findFirst({ where: { id, schoolId } })
    if (!existing) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })

    if (existing.status === "encerrado") {
      return NextResponse.json({ error: "Não é possível editar um ano letivo encerrado" }, { status: 400 })
    }

    // Merge with existing for validation
    const merged = {
      name: body.name ?? existing.name,
      startDate: body.startDate ?? existing.startDate,
      endDate: body.endDate ?? existing.endDate,
    }

    const parsed = createAcademicYearSchema.safeParse(merged)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Check for duplicate name (excluding self)
    if (body.name && body.name !== existing.name) {
      const duplicateName = await prisma.academicYear.findFirst({
        where: { name: body.name, schoolId, id: { not: id } },
      })
      if (duplicateName) {
        return NextResponse.json({ error: "Ano letivo com este nome já existe" }, { status: 409 })
      }
    }

    // Check for overlapping dates (excluding self)
    const overlap = await prisma.academicYear.findFirst({
      where: {
        schoolId,
        id: { not: id },
        OR: [
          {
            startDate: { lte: parsed.data.endDate },
            endDate: { gte: parsed.data.startDate },
          },
        ],
      },
    })
    if (overlap) {
      return NextResponse.json(
        { error: `As datas sobrepõem-se ao ano letivo ${overlap.name}` },
        { status: 409 }
      )
    }

    const year = await prisma.academicYear.update({
      where: { id },
      data: {
        name: parsed.data.name,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
      },
    })

    return NextResponse.json(year)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.academicYear.findFirst({ where: { id, schoolId } })
    if (!existing) return NextResponse.json({ error: "Ano letivo não encontrado" }, { status: 404 })

    const hasData = await prisma.enrollment.count({ where: { academicYearId: id } })
    if (hasData > 0) {
      return NextResponse.json({ error: "Não é possível eliminar: existem matrículas associadas" }, { status: 409 })
    }

    await prisma.academicYear.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
