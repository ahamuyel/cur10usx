import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") || ""
    const period = searchParams.get("period") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { schoolId }

    if (studentId) where.studentId = studentId

    if (period) {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case "month": {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        }
        case "quarter": {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
          break
        }
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      where.createdAt = { gte: startDate }
    }

    const [byStatus, total] = await Promise.all([
      prisma.justification.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      }),
      prisma.justification.count({ where }),
    ])

    const counts: Record<string, number> = {
      pendente: 0,
      em_analise: 0,
      aprovada: 0,
      rejeitada: 0,
      informacao_adicional: 0,
    }

    for (const row of byStatus) {
      counts[row.status] = row._count.id
    }

    if (period) {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "quarter": {
          const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3
          startDate = new Date(now.getFullYear(), quarterStartMonth, 1)
          break
        }
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      const monthlyStats = await prisma.justification.findMany({
        where: {
          ...where,
          createdAt: { gte: startDate },
        },
        select: {
          createdAt: true,
          status: true,
        },
        orderBy: { createdAt: "asc" },
      })

      const byMonth: Record<string, Record<string, number>> = {}
      for (const j of monthlyStats) {
        const key = `${j.createdAt.getFullYear()}-${String(j.createdAt.getMonth() + 1).padStart(2, "0")}`
        if (!byMonth[key]) {
          byMonth[key] = { total: 0, pendente: 0, em_analise: 0, aprovada: 0, rejeitada: 0, informacao_adicional: 0 }
        }
        byMonth[key].total++
        byMonth[key][j.status]++
      }

      return NextResponse.json({
        total,
        counts,
        byMonth,
        period,
      })
    }

    return NextResponse.json({
      total,
      counts,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
