import { NextRequest, NextResponse } from "next/server"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { predictorRegistry } from "@/lib/predictors"
import { getCurrentAcademicYear } from "@/lib/academic-year"
import { prisma } from "@/lib/prisma"

import "@/lib/predictors/absenteism"
import "@/lib/predictors/performance-drop"
import "@/lib/predictors/reprovacao"
import "@/lib/predictors/abandono"

export async function GET(request: NextRequest) {
  try {
    const { error: authError, session } = await requireRole(
      ["school_admin", "super_admin"],
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50))
    const skip = (page - 1) * limit

    const academicYear = await getCurrentAcademicYear(schoolId)
    const academicYearId = academicYear?.id

    const totalStudents = studentId
      ? await prisma.student.count({ where: { id: studentId, schoolId } })
      : await prisma.student.count({ where: { schoolId } })

    const students = studentId
      ? await prisma.student.findMany({ where: { id: studentId, schoolId }, select: { id: true } })
      : await prisma.student.findMany({
          where: { schoolId },
          select: { id: true },
          skip,
          take: limit,
        })

    const studentPredictions = await Promise.all(
      students.map((student) =>
        predictorRegistry.predictAll({
          studentId: student.id,
          schoolId,
          academicYearId,
        })
      )
    )

    const results = studentPredictions.flat()

    const summary = {
      total: results.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      highRisk: results.filter(r => r.severity === "high" || r.severity === "critical").length,
    }

    for (const r of results) {
      summary.byType[r.type] = (summary.byType[r.type] || 0) + 1
      summary.bySeverity[r.severity] = (summary.bySeverity[r.severity] || 0) + 1
    }

    return NextResponse.json({
      predictions: results,
      summary,
      pagination: {
        page,
        limit,
        totalStudents,
        totalPages: Math.ceil(totalStudents / limit),
      },
    })
  } catch (error) {
    console.error("[Predict Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
