import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { takeSnapshot } from "@/lib/academic-health-history"

export async function GET() {
  try {
    const schools = await prisma.school.findMany({
      where: { status: "ativa" },
      select: { id: true, name: true },
    })

    const results = await Promise.allSettled(
      schools.map(s => takeSnapshot(s.id))
    )

    const successCount = results.filter(r => r.status === "fulfilled").length
    const failCount = results.filter(r => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      totalSchools: schools.length,
      snapshotsCreated: successCount,
      failures: failCount,
    })
  } catch (error) {
    console.error("[Cron Snapshot Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
