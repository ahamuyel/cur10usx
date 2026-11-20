import { NextResponse } from "next/server"
import { requirePermission } from "@/lib/api-auth"
import {
  actorFromSession,
  resendApplicationInvite,
  WorkflowError,
} from "@/lib/application-workflow"
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
    const existing = await prisma.application.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== session!.user.schoolId) {
      return NextResponse.json({ error: "Solicitação não encontrada" }, { status: 404 })
    }

    const result = await resendApplicationInvite({
      applicationId: id,
      actor: actorFromSession(session!, req),
    })

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
    console.error("Resend invite error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
