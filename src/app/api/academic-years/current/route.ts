import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)

    const current = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
      select: { id: true, name: true, status: true },
    })

    if (!current) {
      return NextResponse.json({ exists: false, year: null })
    }

    return NextResponse.json({ exists: true, year: current })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
