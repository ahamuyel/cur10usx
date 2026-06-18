import { prisma } from "@/lib/prisma"
import { takeSnapshot } from "@/lib/academic-health-history"

const DEBOUNCE_MS = 5 * 60 * 1000

export async function requestSnapshot(schoolId: string): Promise<void> {
  const latest = await prisma.academicHealthSnapshot.findFirst({
    where: { schoolId },
    orderBy: { snapshotDate: "desc" },
    select: { snapshotDate: true },
  })

  if (latest && Date.now() - latest.snapshotDate.getTime() < DEBOUNCE_MS) {
    return
  }

  await takeSnapshot(schoolId)
}

export async function getLastActivityInfo(schoolId: string) {
  const latest = await prisma.academicHealthSnapshot.findFirst({
    where: { schoolId },
    orderBy: { snapshotDate: "desc" },
    select: { snapshotDate: true, score: true, status: true },
  })

  if (!latest) {
    return { lastUpdate: null, label: "Sem dados" }
  }

  const diffMs = Date.now() - latest.snapshotDate.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  let label: string
  if (diffMinutes < 1) label = "Actualizado há menos de 1 minuto"
  else if (diffMinutes < 60) label = `Actualizado há ${diffMinutes} minutos`
  else if (diffMinutes < 1440) label = `Actualizado há ${Math.floor(diffMinutes / 60)} horas`
  else label = `Actualizado há ${Math.floor(diffMinutes / 1440)} dias`

  return {
    lastUpdate: latest.snapshotDate.toISOString(),
    label,
    score: latest.score,
    status: latest.status,
  }
}
