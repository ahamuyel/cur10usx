import { prisma } from "@/lib/prisma"
import { computeAcademicHealth } from "@/lib/academic-health"
import { getCurrentAcademicYear } from "@/lib/academic-year"
import type { AcademicHealthSnapshot } from "@prisma/client"

export interface HistoryEntry {
  id: string
  score: number
  status: string
  breakdown: {
    academicPerformance: number
    attendance: number
    schoolActivity: number
    administrativeEfficiency: number
  }
  snapshotDate: string
  periodStart: string
  periodEnd: string
}

export interface TrendData {
  change7d: number | null
  change30d: number | null
  history: HistoryEntry[]
}

export async function takeSnapshot(schoolId: string): Promise<AcademicHealthSnapshot> {
  const result = await computeAcademicHealth(schoolId)
  const academicYear = await getCurrentAcademicYear(schoolId)
  const now = new Date()

  const periodStart = new Date(now)
  periodStart.setDate(periodStart.getDate() - 7)

  return prisma.academicHealthSnapshot.create({
    data: {
      schoolId,
      score: result.score,
      status: result.status,
      academicPerformance: result.breakdown.academicPerformance,
      attendance: result.breakdown.attendance,
      schoolActivity: result.breakdown.schoolActivity,
      administrativeEfficiency: result.breakdown.administrativeEfficiency,
      periodStart,
      periodEnd: now,
      academicYearId: academicYear?.id ?? null,
    },
  })
}

export async function getHistory(schoolId: string, limit = 30): Promise<HistoryEntry[]> {
  const snapshots = await prisma.academicHealthSnapshot.findMany({
    where: { schoolId },
    orderBy: { snapshotDate: "desc" },
    take: limit,
  })

  return snapshots.map(s => ({
    id: s.id,
    score: s.score,
    status: s.status,
    breakdown: {
      academicPerformance: s.academicPerformance,
      attendance: s.attendance,
      schoolActivity: s.schoolActivity,
      administrativeEfficiency: s.administrativeEfficiency,
    },
    snapshotDate: s.snapshotDate.toISOString(),
    periodStart: s.periodStart.toISOString(),
    periodEnd: s.periodEnd.toISOString(),
  }))
}

export async function getTrends(schoolId: string): Promise<TrendData> {
  const history = await getHistory(schoolId, 30)
  const sorted = [...history].reverse()

  let change7d: number | null = null
  let change30d: number | null = null

  if (sorted.length >= 2) {
    const latest = sorted[sorted.length - 1].score
    const sevenDaysAgo = sorted.find(
      e => Date.now() - new Date(e.snapshotDate).getTime() <= 7 * 24 * 60 * 60 * 1000 && e.score !== latest
    )
    if (sevenDaysAgo) change7d = latest - sevenDaysAgo.score
    const thirtyDaysAgo = sorted.find(
      e => Date.now() - new Date(e.snapshotDate).getTime() <= 30 * 24 * 60 * 60 * 1000 && e.score !== latest
    )
    if (thirtyDaysAgo) change30d = latest - thirtyDaysAgo.score
  }

  return { change7d, change30d, history }
}

export async function ensureRecentSnapshot(schoolId: string): Promise<void> {
  const latest = await prisma.academicHealthSnapshot.findFirst({
    where: { schoolId },
    orderBy: { snapshotDate: "desc" },
  })

  if (!latest || Date.now() - latest.snapshotDate.getTime() > 24 * 60 * 60 * 1000) {
    await takeSnapshot(schoolId)
  }
}

export async function getLatestSnapshot(schoolId: string) {
  return prisma.academicHealthSnapshot.findFirst({
    where: { schoolId },
    orderBy: { snapshotDate: "desc" },
  })
}
