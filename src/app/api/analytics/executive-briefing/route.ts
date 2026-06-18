import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { computeAcademicHealth } from "@/lib/academic-health"
import { computeStudentRisk } from "@/lib/student-risk"
import { computeClassHealth } from "@/lib/class-health"
import { getCurrentAcademicYear } from "@/lib/academic-year"
import { prisma } from "@/lib/prisma"
import { getLatestSnapshot } from "@/lib/academic-health-history"
import { getLastActivityInfo } from "@/lib/snapshot-queue"

// Main GET handler for executive briefing
export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)

    const [health, risk, classHealth, pendingApplications, academicYear, lastSnapshot, activityInfo] = await Promise.all([
      computeAcademicHealth(schoolId),
      computeStudentRisk(schoolId),
      computeClassHealth(schoolId),
      prisma.application.count({ where: { schoolId, status: "pendente" } }),
      getCurrentAcademicYear(schoolId),
      getLatestSnapshot(schoolId),
      getLastActivityInfo(schoolId),
    ])

    const evolution = lastSnapshot ? health.score - lastSnapshot.score : 0

    return NextResponse.json({
      schoolInfo: {
        academicYear: academicYear?.name ?? "Ano Lectivo não definido",
        schoolName: session?.user?.name ?? "Escola",
      },
      academic: {
        aproveitamento: health.score,
        assiduidade: health.breakdown.attendance,
        status: health.status,
        evolution,
      },
      risk: {
        totalAtRisk: risk.totalAtRisk,
        riskPercentage: risk.riskPercentage,
        summary: risk.summary,
      },
      classes: {
        totalUnderMonitoring: classHealth.atRiskCount + classHealth.criticalCount,
        criticalCount: classHealth.criticalCount,
        atRiskCount: classHealth.atRiskCount,
      },
      operational: {
        score: health.operationalScore,
        pendingApplications,
      },
      lastActivity: activityInfo,
    })
  } catch (error) {
    console.error("[Executive Briefing API Error]", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
