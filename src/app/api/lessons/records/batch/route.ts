import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { z } from "zod"

const batchSchema = z.object({
  recordIds: z.array(z.string()).min(1, "Selecione pelo menos um registo"),
  status: z.enum(["REALIZADA", "REJEITADA", "FALTOU"]),
  adminNotes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requireRole(["school_admin"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id

    const body = await req.json()
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { recordIds, status, adminNotes } = parsed.data

    const records = await prisma.lessonRecord.findMany({
      where: { id: { in: recordIds } },
      include: { scheduleSlot: { select: { schoolId: true } } },
    })

    if (records.length !== recordIds.length) {
      return NextResponse.json({ error: "Alguns registos não foram encontrados" }, { status: 404 })
    }

    for (const record of records) {
      if (record.scheduleSlot.schoolId !== schoolId) {
        return NextResponse.json({ error: "Registo não pertence a esta escola" }, { status: 403 })
      }
      if (record.status !== "PENDING") {
        return NextResponse.json({ error: `O registo ${record.id} não está pendente` }, { status: 400 })
      }
    }

    const updated = await prisma.lessonRecord.updateMany({
      where: { id: { in: recordIds } },
      data: {
        status,
        adminNotes: adminNotes || null,
        validatedBy: userId,
        validatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: `${updated.count} registo(s) atualizado(s) com sucesso`,
      count: updated.count,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
