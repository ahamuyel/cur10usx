import { prisma } from "@/lib/prisma"
import { getCurrentAcademicYear } from "@/lib/academic-year"

export interface AcademicHealthBreakdown {
  academicPerformance: number
  attendance: number
  schoolActivity: number
  administrativeEfficiency: number
}

export interface AcademicHealthResult {
  score: number
  status: string
  breakdown: AcademicHealthBreakdown
}

export function getHealthStatus(score: number): string {
  if (score >= 90) return "Excelente"
  if (score >= 75) return "Boa"
  if (score >= 60) return "Atenção"
  return "Crítica"
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

  // 1. Desempenho Académico (40%) - 0-100 scale
  const averageGrade = avgResult._avg.score ?? 0
  const academicPerformance = averageGrade > 0
    ? Math.round((averageGrade / 20) * 100)
    : 0

  // 2. Assiduidade (30%) - percentage of presence (presente + atrasado)
  const presente = attendanceCounts.find(a => a.status === "presente")?._count ?? 0
  const atrasado = attendanceCounts.find(a => a.status === "atrasado")?._count ?? 0
  const totalAttendance = attendanceCounts.reduce((sum, a) => sum + a._count, 0)
  const attendance = totalAttendance > 0
    ? Math.round(((presente + atrasado) / totalAttendance) * 100)
    : 0


  // 3. Actividade Escolar (20%) - adapta aos dados disponíveis
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

  // Assignments per student
  if (totalStudents > 0 && assignmentCount > 0) {
    activityMetrics.push(Math.min(100, (assignmentCount / totalStudents) * 20))
  }

  // Exams per student
  if (totalStudents > 0 && examCount > 0) {
    activityMetrics.push(Math.min(100, (examCount / totalStudents) * 10))
  }

  const schoolActivity = activityMetrics.length > 0
    ? Math.round(activityMetrics.reduce((a, b) => a + b, 0) / activityMetrics.length)
    : 0

  // 4. Eficiência Administrativa (10%) - fewer pending items = higher score
  const totalPending = pendingApplications
  const pendingRatio = totalStudents > 0 ? totalPending / totalStudents : 0
  const administrativeEfficiency = Math.round(Math.max(0, 100 - pendingRatio * 100))

  // Weighted final score
  const score = Math.round(
    academicPerformance * 0.40 +
    attendance * 0.30 +
    schoolActivity * 0.20 +
    administrativeEfficiency * 0.10
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    status: getHealthStatus(score),
    breakdown: {
      academicPerformance: Math.min(100, Math.max(0, academicPerformance)),
      attendance: Math.min(100, Math.max(0, attendance)),
      schoolActivity: Math.min(100, Math.max(0, schoolActivity)),
      administrativeEfficiency: Math.min(100, Math.max(0, administrativeEfficiency)),
    },
  }
}
