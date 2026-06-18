import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requestSnapshot } from "@/lib/snapshot-queue"

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      where: { status: "ativa" },
      select: { id: true, name: true },
    })

    const results = await Promise.allSettled(
      schools.map(s => requestSnapshot(s.id))
    )

    const successCount = results.filter(r => r.status === "fulfilled").length
    const failCount = results.filter(r => r.status === "rejected").length

    // Retention: keep daily snapshots for 1 year, remove older than 365 days
    const retentionCutoff = new Date()
    retentionCutoff.setDate(retentionCutoff.getDate() - 365)
    const deleted = await prisma.academicHealthSnapshot.deleteMany({
      where: { snapshotDate: { lt: retentionCutoff } },
    })

    return NextResponse.json({
      success: true,
      totalSchools: schools.length,
      snapshotsCreated: successCount,
      failures: failCount,
      oldSnapshotsRemoved: deleted.count,
      note: "Cada escola respeita o debounce de 5 min entre snapshots",
    })
  } catch (error) {
    console.error("[Cron Snapshot Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
