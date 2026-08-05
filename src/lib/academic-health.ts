import { prisma } from "@/lib/prisma"
import { getCurrentAcademicYear } from "@/lib/academic-year"
import {
  getHealthStatus,
  calculateAcademicPerformance,
  calculateAttendancePercentage,
  calculateGlobalHealthScore,
} from "@/lib/score"

export { getHealthStatus }

export interface AcademicHealthBreakdown {
  academicPerformance: number
  attendance: number
  schoolActivity: number
  administrativeEfficiency: number
}

export interface AcademicHealthResult {
  score: number // Aproveitamento Global (40/30/20/10: Desempenho + Assiduidade + Actividade + Administrativo)
  status: string
  breakdown: AcademicHealthBreakdown
  operationalScore: number // Eficiência Operacional (Actividade + Administrativo)
}

export async function computeAcademicHealth(schoolId: string): Promise<AcademicHealthResult> {
  const academicYear = await getCurrentAcademicYear(schoolId)

  // Robust year filter for models with 'date' field (Attendance, Result)
  const robustYearFilter = academicYear
    ? {
        OR: [
          { academicYearId: academicYear.id },
          {
            academicYearId: null,
            date: {
              gte: academicYear.startDate,
              lte: academicYear.endDate,
            },
          },
        ],
      }
    : {}

  // Simple year filter for models with only 'academicYearId' (Lesson, Assignment, Exam)
  const simpleYearFilter = academicYear?.id ? { academicYearId: academicYear.id } : {}

  const [
    avgResult,
    attendanceCounts,
    submissionCounts,
    lessonCount,
    assignmentCount,
    examCount,
    pendingApplications,
    totalStudents,
  ] = await Promise.all([
    prisma.result.aggregate({
      where: { schoolId, ...robustYearFilter },
      _avg: { score: true },
    }),

    prisma.attendance.groupBy({
      by: ["status"],
      where: { schoolId, ...robustYearFilter },
      _count: true,
    }),

    prisma.assignmentSubmission.groupBy({
      by: ["status"],
      where: { schoolId },
      _count: true,
    }),

    prisma.lesson.count({
      where: { schoolId, ...simpleYearFilter },
    }),

    prisma.assignment.count({
      where: { schoolId, ...simpleYearFilter },
    }),

    prisma.exam.count({
      where: { schoolId, ...simpleYearFilter },
    }),

    prisma.application.count({
      where: { schoolId, status: "pendente" },
    }),

    prisma.student.count({ where: { schoolId } }),
  ])

  // 1. Aproveitamento Académico (40% do Score Global segundo spec)
  const averageGrade = avgResult._avg.score ?? 0
  const academicPerformance = calculateAcademicPerformance(averageGrade)

  // 2. Assiduidade (30% do Score Global segundo spec)
  const presente = attendanceCounts.find(a => a.status === "presente")?._count ?? 0
  const atrasado = attendanceCounts.find(a => a.status === "atrasado")?._count ?? 0
  const totalAttendance = attendanceCounts.reduce((sum, a) => sum + a._count, 0)
  const attendance = calculateAttendancePercentage(presente, atrasado, totalAttendance)

  // 3. Actividade Escolar (20% do Score Global segundo spec)
  const activityMetrics: number[] = []

  // Submission completion rate
  const submitted = submissionCounts
    .filter(s => s.status === "entregue" || s.status === "avaliada")
    .reduce((sum, s) => sum + s._count, 0)
  const totalSubmissions = submissionCounts.reduce((sum, s) => sum + s._count, 0)
  if (totalSubmissions > 0) {
    activityMetrics.push((submitted / totalSubmissions) * 100)
  }

  // Lessons as proportion of students (proxy for activity volume)
  if (totalStudents > 0 && lessonCount > 0) {
    activityMetrics.push(Math.min(100, (lessonCount / totalStudents) * 10))
  }

  const schoolActivity = activityMetrics.length > 0
    ? Math.round(activityMetrics.reduce((a, b) => a + b, 0) / activityMetrics.length)
    : 0

  // 4. Eficiência Administrativa (10% do Score Global segundo spec)
  const totalPending = pendingApplications
  const pendingRatio = totalStudents > 0 ? totalPending / totalStudents : 0
  const administrativeEfficiency = Math.round(Math.max(0, 100 - pendingRatio * 100))

  const breakdown: AcademicHealthBreakdown = {
    academicPerformance: Math.min(100, Math.max(0, academicPerformance)),
    attendance: Math.min(100, Math.max(0, attendance)),
    schoolActivity: Math.min(100, Math.max(0, schoolActivity)),
    administrativeEfficiency: Math.min(100, Math.max(0, administrativeEfficiency)),
  }

  // Score Global Alinhado com a Spec: 40/30/20/10
  const globalScore = calculateGlobalHealthScore(breakdown)

  // Score Operacional: 60% Actividade + 40% Administração
  const operationalScore = Math.round(
    schoolActivity * 0.60 +
    administrativeEfficiency * 0.40
  )

  return {
    score: globalScore,
    status: getHealthStatus(globalScore),
    operationalScore: Math.min(100, Math.max(0, operationalScore)),
    breakdown,
  }
}
