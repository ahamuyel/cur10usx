import { NextResponse } from "next/server"
import { requireRole } from "@/lib/api-auth"
import { broadcastToUser, broadcastToAll } from "@/lib/ws-broadcast"

export async function POST(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { userId, event, payload } = await req.json()
    if (!userId || typeof userId !== "string" || !event || !payload) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    broadcastToUser(userId, event, payload)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { error: authError } = await requireRole(["super_admin"])
    if (authError) return authError

    const { event, payload } = await req.json()
    if (!event || !payload) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })

    broadcastToAll(event, payload)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
