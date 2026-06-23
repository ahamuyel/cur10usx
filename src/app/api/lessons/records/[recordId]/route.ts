import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { z } from "zod"

const updateRecordSchema = z.object({
  status: z.enum(["REALIZADA", "FALTOU", "SUBSTITUIDA"]),
  adminNotes: z.string().optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { error: authError, session } = await requireRole(["school_admin"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { recordId } = await params

    const body = await req.json()
    const parsed = updateRecordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Fetch the lesson record and make sure it belongs to the school
    const record = await prisma.lessonRecord.findUnique({
      where: { id: recordId },
      include: {
        lesson: true,
      },
    })

    if (!record || record.lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Registo de aula não encontrado" }, { status: 404 })
    }

    if (record.status !== "PENDING") {
      return NextResponse.json({ error: "Apenas registos com estado PENDENTE podem ser atualizados" }, { status: 400 })
    }

    const updated = await prisma.lessonRecord.update({
      where: { id: recordId },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes || null,
        validatedBy: session!.user.id,
        validatedAt: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
