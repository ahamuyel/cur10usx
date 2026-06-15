import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { computeAcademicHealth } from "@/lib/academic-health"
import { getHistory } from "@/lib/academic-health-history"
import { generateInsights } from "@/lib/academic-insights"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const [current, history] = await Promise.all([
      computeAcademicHealth(schoolId),
      getHistory(schoolId, 5),
    ])

    const insights = await generateInsights(current, history, schoolId)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("[Insights Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
