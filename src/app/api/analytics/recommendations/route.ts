import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { computeAcademicHealth } from "@/lib/academic-health"
import { computeClassHealth } from "@/lib/class-health"
import { computeStudentRisk } from "@/lib/student-risk"
import { getTrends } from "@/lib/academic-health-history"
import { generateRecommendations } from "@/lib/academic-recommendations"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const [health, classHealth, studentRisk, trends] = await Promise.all([
      computeAcademicHealth(schoolId),
      computeClassHealth(schoolId),
      computeStudentRisk(schoolId),
      getTrends(schoolId),
    ])

    const recommendations = generateRecommendations(health, classHealth, studentRisk, trends)

    return NextResponse.json({ recommendations })
  } catch (error) {
    console.error("[Recommendations Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
