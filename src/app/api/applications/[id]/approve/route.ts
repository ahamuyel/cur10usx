import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/api-auth"
import { actorFromSession, approveApplication, WorkflowError } from "@/lib/application-workflow"
import { sendApplicationApproved } from "@/lib/email"
import { prisma } from "@/lib/prisma"
import { requestSnapshot } from "@/lib/snapshot-queue"
import { broadcastToUser } from "@/lib/ws-broadcast"

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

    const result = await approveApplication({ applicationId: id, actor: actorFromSession(session!, req) })

    try {
      await sendApplicationApproved(existing.email, existing.name, existing.school.name)
    } catch (e) {
      console.error("Email error:", e)
    }

    if (result.userId) {
      try {
        broadcastToUser(result.userId, "session-update", {})
      } catch {
        // WebSocket server may not be available
      }
    }
    await requestSnapshot(existing.schoolId)

    return NextResponse.json({ success: true, status: result.status })
  } catch (error) {
    if (error instanceof WorkflowError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Approve error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
