import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/api-auth"
import { actorFromSession, rejectApplication, WorkflowError } from "@/lib/application-workflow"
import { sendApplicationRejected } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { requestSnapshot } from "@/lib/snapshot-queue"
import { rejectApplicationSchema } from "@/lib/validations/application"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin"],
      "canManageApplications",
      { requireSchool: true }
    )
    if (authError) return authError

    const { id } = await params
    const existing = await prisma.application.findUnique({
      where: { id },
      include: { school: { select: { name: true } } },
    })
    if (!existing || existing.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    const body = await req.json()
    const parsed = rejectApplicationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const result = await rejectApplication({
      applicationId: id,
      actor: actorFromSession(session!, req),
      reason: parsed.data.reason,
    })

    try {
      await sendApplicationRejected(existing.email, existing.name, parsed.data.reason)
    } catch (e) {
      console.error("Email error:", e)
    }

    await requestSnapshot(existing.schoolId)

    return NextResponse.json({ success: true, status: result.status })
  } catch (error) {
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Reject error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
