import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { getHistory, getTrends } from "@/lib/academic-health-history"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const [history, trends] = await Promise.all([
      getHistory(schoolId),
      getTrends(schoolId),
    ])

    return NextResponse.json({ history, trends })
  } catch (error) {
    console.error("[AcademicHealth History Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
