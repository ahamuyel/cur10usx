import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { computeAcademicHealth } from "@/lib/academic-health"
import { getHistory, getTrends, ensureRecentSnapshot } from "@/lib/academic-health-history"
import { generateInsights } from "@/lib/academic-insights"
import { computeStudentRisk } from "@/lib/student-risk"
import { computeClassHealth } from "@/lib/class-health"
import { generateRecommendations } from "@/lib/academic-recommendations"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)

    await ensureRecentSnapshot(schoolId)

    const [
      health,
      { history },
      trends,
      { insights },
      studentRisk,
      classHealth,
      { recommendations },
    ] = await Promise.all([
      computeAcademicHealth(schoolId),
      (async () => {
        const history = await getHistory(schoolId, 30)
        return { history }
      })(),
      getTrends(schoolId),
      (async () => {
        const current = await computeAcademicHealth(schoolId)
        const history = await getHistory(schoolId, 5)
        const insights = await generateInsights(current, history, schoolId)
        return { insights }
      })(),
      computeStudentRisk(schoolId),
      computeClassHealth(schoolId),
      (async () => {
        const [health, classHealth, studentRisk, trends] = await Promise.all([
          computeAcademicHealth(schoolId),
          computeClassHealth(schoolId),
          computeStudentRisk(schoolId),
          getTrends(schoolId),
        ])
        const recommendations = generateRecommendations(health, classHealth, studentRisk, trends)
        return { recommendations }
      })(),
    ])

    return NextResponse.json({
      health,
      history,
      trends,
      insights,
      studentRisk,
      classHealth,
      recommendations,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[ExecutiveDashboard Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
