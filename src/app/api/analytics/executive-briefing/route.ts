import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { computeAcademicHealth } from "@/lib/academic-health"
import { computeStudentRisk } from "@/lib/student-risk"
import { prisma } from "@/lib/prisma"
import { getLatestSnapshot } from "@/lib/academic-health-history"

// Main GET handler for executive briefing
export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)

    const currentDay = new Date().getDay()
    const dayValue = (currentDay === 0 ? 7 : currentDay).toString()

    const [health, risk, pendingApplications, todayLessons, lastSnapshot] = await Promise.all([
      computeAcademicHealth(schoolId),
      computeStudentRisk(schoolId),
      prisma.application.count({ where: { schoolId, status: "pendente" } }),
      prisma.lesson.count({
        where: {
          schoolId,
          day: dayValue,
        }
      }),
      getLatestSnapshot(schoolId),
    ])

    const evolution = lastSnapshot ? health.score - lastSnapshot.score : 0

    return NextResponse.json({
      health: {
        score: health.score,
        status: health.status,
        evolution,
      },
      attention: {
        criticalStudents: risk.summary["Crítico"] || 0,
        highRiskStudents: risk.summary["Alto Risco"] || 0,
        pendingApplications,
      },
      today: {
        lessons: todayLessons,
      }
    })
  } catch (error) {
    console.error("[Executive Briefing API Error]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
