import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin", "teacher"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params
    const body = await _req.json()
    const { note } = body

    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return NextResponse.json({ error: "A nota da convocatória é obrigatória" }, { status: 400 })
    }

    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        parents: { select: { userId: true } },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    const recipientUserIds: string[] = []
    if (student.userId) recipientUserIds.push(student.userId)
    for (const p of student.parents) {
      if (p.userId) recipientUserIds.push(p.userId)
    }

    if (recipientUserIds.length === 0) {
      return NextResponse.json({ error: "Aluno e encarregados não possuem contas de utilizador associadas" }, { status: 400 })
    }

    await prisma.notification.createMany({
      data: recipientUserIds.map((uId) => ({
        userId: uId,
        title: "Convocatória",
        message: note.trim(),
        type: "convocation",
        schoolId,
        link: `/dashboard/${student.id}`,
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Convocation Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
