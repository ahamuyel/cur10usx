import { prisma } from "@/lib/prisma"
import { getCurrentAcademicYear } from "@/lib/academic-year"

export type RiskLevel = "Baixo Risco" | "Médio Risco" | "Alto Risco" | "Crítico"

export interface SubjectWeakness {
  subjectId: string
  subjectName: string
  average: number
}

export interface StudentRiskBreakdown {
  academicPerformance: number
  attendance: number
  submissions: number
}

export interface StudentRiskResult {
  studentId: string
  studentName: string
  classId: string
  className: string
  riskScore: number
  riskLevel: RiskLevel
  breakdown: StudentRiskBreakdown
  weakSubjects: SubjectWeakness[]
}

export interface StudentRiskSummary {
  totalAtRisk: number
  totalStudents: number
  riskPercentage: number
  students: StudentRiskResult[]
  summary: Record<string, number>
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return "Crítico"
  if (score >= 50) return "Alto Risco"
  if (score >= 25) return "Médio Risco"
  return "Baixo Risco"
}

export async function computeStudentRisk(schoolId: string): Promise<StudentRiskSummary> {
  const academicYear = await getCurrentAcademicYear(schoolId)
  const yearFilter = academicYear?.id ? { academicYearId: academicYear.id } : {}

  const [students, totalStudents] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId },
      include: {
        class: { select: { id: true, name: true } },
        results: {
          where: { ...yearFilter },
          select: { score: true, subjectId: true, subject: { select: { name: true } } },
        },
        attendances: {
          where: { ...yearFilter },
          select: { status: true },
        },
        submissions: {
          select: { status: true },
        },
      },
    }),
    prisma.student.count({ where: { schoolId } }),
  ])

  const results: StudentRiskResult[] = []

  for (const student of students) {
    const avgScore = student.results.length > 0
      ? student.results.reduce((s, r) => s + r.score, 0) / student.results.length
      : 0

    const academicPerformance = avgScore > 0
      ? Math.round((avgScore / 20) * 100)
      : 0

    const totalAttendance = student.attendances.length
    const presente = student.attendances.filter(a => a.status === "presente").length
    const attendance = totalAttendance > 0
      ? Math.round((presente / totalAttendance) * 100)
      : 0

    const submitted = student.submissions.filter(
      s => s.status === "entregue" || s.status === "avaliada"
    ).length
    const totalSubmissions = student.submissions.length
    const submissionRate = totalSubmissions > 0
      ? Math.round((submitted / totalSubmissions) * 100)
      : 0

    const riskFromAcademic = 100 - academicPerformance
    const riskFromAttendance = 100 - attendance
    const riskFromSubmissions = 100 - submissionRate

    const riskScore = Math.round(
      riskFromAcademic * 0.40 +
      riskFromAttendance * 0.30 +
      riskFromSubmissions * 0.30
    )

    // Calcular disciplinas mais fracas (média < 10)
    const subjectMap = new Map<string, { name: string; scores: number[] }>()
    for (const r of student.results) {
      if (!subjectMap.has(r.subjectId)) {
        subjectMap.set(r.subjectId, { name: r.subject.name, scores: [] })
      }
      subjectMap.get(r.subjectId)!.scores.push(r.score)
    }

    const weakSubjects: SubjectWeakness[] = []
    for (const [subjectId, data] of subjectMap) {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      if (avg < 10) {
        weakSubjects.push({
          subjectId,
          subjectName: data.name,
          average: Math.round(avg * 10) / 10,
        })
      }
    }
    weakSubjects.sort((a, b) => a.average - b.average)

    results.push({
      studentId: student.id,
      studentName: student.name,
      classId: student.class?.id ?? "",
      className: student.class?.name ?? "Sem turma",
      riskScore: Math.min(100, Math.max(0, riskScore)),
      riskLevel: getRiskLevel(riskScore),
      breakdown: {
        academicPerformance,
        attendance,
        submissions: submissionRate,
      },
      weakSubjects: weakSubjects.slice(0, 3),
    })
  }

  results.sort((a, b) => b.riskScore - a.riskScore)

  const summary: Record<string, number> = {
    "Baixo Risco": 0,
    "Médio Risco": 0,
    "Alto Risco": 0,
    Crítico: 0,
  }
  for (const r of results) {
    summary[r.riskLevel] = (summary[r.riskLevel] || 0) + 1
  }

  const totalAtRisk = (summary["Alto Risco"] || 0) + (summary["Crítico"] || 0)

  return {
    totalAtRisk,
    totalStudents,
    riskPercentage: totalStudents > 0 ? Math.round((totalAtRisk / totalStudents) * 100) : 0,
    students: results,
    summary,
  }
}
