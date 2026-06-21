import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      "canManageAttendance",
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id } = await params

    const body = await req.json()
    const { status, reviewNotes } = body

    const validStatuses = ["aprovada", "rejeitada", "informacao_adicional"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status inválido. Valores: aprovada, rejeitada, informacao_adicional" },
        { status: 400 }
      )
    }

    const existing = await prisma.justification.findUnique({
      where: { id },
      include: { attendances: { select: { id: true } } },
    })

    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Justificação não encontrada" }, { status: 404 })
    }

    if (existing.status === "aprovada" || existing.status === "rejeitada") {
      return NextResponse.json(
        { error: "Justificação já foi revisada e não pode ser alterada" },
        { status: 400 }
      )
    }

    const justification = await prisma.justification.update({
      where: { id },
      data: {
        status,
        reviewedById: userId,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null,
      },
    })

    if (status === "aprovada" && existing.attendances.length > 0) {
      await prisma.attendance.updateMany({
        where: { justificationId: id },
        data: { status: "falta_justificada" },
      })
    }

    const updated = await prisma.justification.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } },
          },
        },
        reviewedBy: {
          select: { id: true, name: true },
        },
        attendances: {
          include: {
            class: { select: { id: true, name: true } },
            lesson: { select: { id: true, subjectId: true, subject: { select: { name: true } } } },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
