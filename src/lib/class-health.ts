import { prisma } from "@/lib/prisma"
import { getCurrentAcademicYear } from "@/lib/academic-year"
import { getHealthStatus } from "@/lib/academic-health"

export type ClassRiskLevel = "Baixo Risco" | "Moderado" | "Alto Risco" | "Crítico" | "Sem dados"

export interface ClassHealthBreakdown {
  academicPerformance: number
  attendance: number
  schoolActivity: number
}

export interface ClassHealthResult {
  classId: string
  className: string
  grade: number
  studentCount: number
  score: number
  status: string
  riskLevel: ClassRiskLevel
  motivoPrincipal: string
  breakdown: ClassHealthBreakdown
}

export interface ClassHealthSummary {
  classes: ClassHealthResult[]
  criticalCount: number
  atRiskCount: number
  totalUnderMonitoring: number
}

function getClassRiskLevel(score: number, status: string): ClassRiskLevel {
  if (status === "Sem dados") return "Sem dados"
  if (score < 45) return "Crítico"
  if (score < 60) return "Alto Risco"
  if (score < 75) return "Moderado"
  return "Baixo Risco"
}

export async function computeClassHealth(schoolId: string): Promise<ClassHealthSummary> {
  const academicYear = await getCurrentAcademicYear(schoolId)
  const yearFilter = academicYear?.id ? { academicYearId: academicYear.id } : {}

  const classes = await prisma.class.findMany({
    where: { schoolId },
    select: { id: true, name: true, grade: true },
  })

  const results: ClassHealthResult[] = []

  for (const cls of classes) {
    const students = await prisma.student.findMany({
      where: { classId: cls.id },
      select: { id: true },
    })
    const studentIds = students.map(s => s.id)
    const studentCount = studentIds.length

    if (studentCount === 0) {
      results.push({
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        studentCount: 0,
        score: 0,
        status: "Sem dados",
        riskLevel: "Sem dados",
        motivoPrincipal: "Sem alunos matriculados",
        breakdown: { academicPerformance: 0, attendance: 0, schoolActivity: 0 },
      })
      continue
    }

    const [avgResult, attendanceCounts, submissionData] = await Promise.all([
      prisma.result.aggregate({
        where: { schoolId, studentId: { in: studentIds }, ...yearFilter },
        _avg: { score: true },
      }),
      prisma.attendance.groupBy({
        by: ["status"],
        where: { schoolId, studentId: { in: studentIds }, ...yearFilter },
        _count: true,
      }),
      prisma.assignmentSubmission.groupBy({
        by: ["status"],
        where: { schoolId, studentId: { in: studentIds } },
        _count: true,
      }),
    ])

    const averageGrade = avgResult._avg.score ?? 0
    const academicPerformance = averageGrade > 0
      ? Math.round((averageGrade / 20) * 100)
      : 0

    const presente = attendanceCounts.find(a => a.status === "presente")?._count ?? 0
    const totalAttendance = attendanceCounts.reduce((s, a) => s + a._count, 0)
    const attendance = totalAttendance > 0
      ? Math.round((presente / totalAttendance) * 100)
      : 0

    const submitted = submissionData
      .filter(s => s.status === "entregue" || s.status === "avaliada")
      .reduce((s, a) => s + a._count, 0)
    const totalSubmissions = submissionData.reduce((s, a) => s + a._count, 0)
    const submissionRate = totalSubmissions > 0
      ? Math.round((submitted / totalSubmissions) * 100)
      : 0

    const score = Math.round(
      academicPerformance * 0.40 +
      attendance * 0.40 +
      submissionRate * 0.20
    )

    // Determinar motivo principal de monitorização
    let motivoPrincipal = "Estável"
    if (score < 75) {
      const issues = [
        { label: "Baixo desempenho académico", value: 100 - academicPerformance },
        { label: "Elevado absentismo", value: 100 - attendance },
        { label: "Baixa entrega de trabalhos", value: 100 - submissionRate },
      ]
      issues.sort((a, b) => b.value - a.value)
      motivoPrincipal = issues[0].label
    }

    const finalScore = Math.min(100, Math.max(0, score))
    const status = studentCount > 0 ? getHealthStatus(finalScore) : "Sem dados"

    results.push({
      classId: cls.id,
      className: cls.name,
      grade: cls.grade,
      studentCount,
      score: finalScore,
      status,
      riskLevel: getClassRiskLevel(finalScore, status),
      motivoPrincipal,
      breakdown: {
        academicPerformance: Math.min(100, academicPerformance),
        attendance: Math.min(100, attendance),
        schoolActivity: Math.min(100, submissionRate),
      },
    })
  }

  results.sort((a, b) => a.score - b.score)
  
  // Métricas de sumário (Não sobrepostas)
  const criticalCount = results.filter(r => r.score < 45 && r.studentCount > 0).length
  const atRiskCount = results.filter(r => r.score >= 45 && r.score < 60 && r.studentCount > 0).length
  const totalUnderMonitoring = results.filter(r => r.score < 75 && r.studentCount > 0).length

  return { classes: results, criticalCount, atRiskCount, totalUnderMonitoring }
}
