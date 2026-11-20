import { NextResponse } from "next/server"
import { acceptAccountInvite, InviteError } from "@/lib/account-invite"
import { withCsrf } from "@/lib/csrf"
import { acceptInviteSchema } from "@/lib/validations/auth"

async function handleAcceptInvite(req: Request) {
  try {
    const body = await req.json()
    const parsed = acceptInviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    await acceptAccountInvite(parsed.data)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof InviteError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error("Accept invite error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return withCsrf(handleAcceptInvite)(req, {})
}
