import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { id: true, name: true, schoolId: true, userId: true },
    })

    if (!teacher || teacher.schoolId !== schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    if (session!.user.role === "teacher" && teacher.userId !== session!.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const year = searchParams.get("year") || ""
    const month = searchParams.get("month") || ""

    let dateFilter: Record<string, Date | { gte: Date; lte: Date }> = {}

    if (startDate && endDate) {
      dateFilter = { gte: new Date(startDate), lte: new Date(endDate) }
    } else if (year && month) {
      const yearNum = parseInt(year)
      const monthNum = parseInt(month) - 1
      const start = new Date(yearNum, monthNum, 1)
      const end = new Date(yearNum, monthNum + 1, 0, 23, 59, 59, 999)
      dateFilter = { gte: start, lte: end }
    } else if (year) {
      const yearNum = parseInt(year)
      const start = new Date(yearNum, 0, 1)
      const end = new Date(yearNum, 11, 31, 23, 59, 59, 999)
      dateFilter = { gte: start, lte: end }
    }

    const where: Record<string, unknown> = {
      teacherId: id,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
    }

    const attendanceRecords = await prisma.teacherAttendance.findMany({
      where,
      orderBy: { date: "desc" },
    })

    const totalLessons = attendanceRecords.length
    const taughtCount = attendanceRecords.filter((a) => a.status === "leccionada").length
    const cancelledCount = attendanceRecords.filter((a) => a.status === "cancelada").length
    const lateCount = attendanceRecords.filter((a) => a.status === "atrasada").length
    const absentCount = attendanceRecords.filter((a) => a.status === "ausente").length
    const compliancePercentage = totalLessons > 0
      ? Math.round(((taughtCount + cancelledCount) / totalLessons) * 100)
      : 0

    return NextResponse.json({
      records: attendanceRecords,
      summary: {
        totalLessons,
        taughtCount,
        cancelledCount,
        lateCount,
        absentCount,
        compliancePercentage,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
