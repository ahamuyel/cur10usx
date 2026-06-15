import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { takeSnapshot } from "@/lib/academic-health-history"

export async function POST() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const snapshot = await takeSnapshot(schoolId)

    return NextResponse.json({ success: true, snapshot })
  } catch (error) {
    console.error("[AcademicHealth Snapshot Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
