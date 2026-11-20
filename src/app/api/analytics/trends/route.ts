import { NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { getHistory } from "@/lib/academic-health-history"
import { computeAcademicHealth } from "@/lib/academic-health"

export async function GET() {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const [history, current] = await Promise.all([
      getHistory(schoolId, 90),
      computeAcademicHealth(schoolId),
    ])

    const sorted = [...history].reverse()

    const getChange = (days: number): number | null => {
      if (sorted.length < 2) return null
      const latest = current.score
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
      const past = sorted.find(
        e => new Date(e.snapshotDate).getTime() >= cutoff && e.score !== latest
      )
      if (!past) return null
      return latest - past.score
    }

    const getComparison = (label: string, days: number) => ({
      label,
      days,
      change: getChange(days),
      direction: (getChange(days) ?? 0) >= 0 ? "up" : "down" as "up" | "down",
    })

    const comparisons = [
      getComparison("Últimos 7 dias", 7),
      getComparison("Últimos 30 dias", 30),
      getComparison("Último trimestre", 90),
      getComparison("Ano lectivo", 365),
    ]

    const breakdownChanges = (() => {
      if (sorted.length < 2) return null
      const latest = current.breakdown
      const past: typeof latest | null = (() => {
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
        const entry = sorted.find(e => new Date(e.snapshotDate).getTime() >= cutoff)
        return entry ? entry.breakdown : null
      })()
      if (!past) return null
      return {
        academicPerformance: latest.academicPerformance - past.academicPerformance,
        attendance: latest.attendance - past.attendance,
        schoolActivity: latest.schoolActivity - past.schoolActivity,
        administrativeEfficiency: latest.administrativeEfficiency - past.administrativeEfficiency,
      }
    })()

    return NextResponse.json({
      comparisons,
      breakdownChanges,
      history,
    })
  } catch (error) {
    console.error("[Trends Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
