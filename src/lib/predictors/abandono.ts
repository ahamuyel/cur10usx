import { prisma } from "@/lib/prisma"
import type { Predictor, PredictionInput, PredictionResult } from "@/lib/predictors"
import { predictorRegistry } from "@/lib/predictors"

const AbandonoPredictor: Predictor = {
  type: "abandono",
  name: "Preditor de Abandono Escolar",
  description: "Identifica alunos em risco de abandono com base em faltas frequentes, queda de desempenho e ausência de submissões.",

  async predict(input: PredictionInput): Promise<PredictionResult | null> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const [recentAttendances, recentSubmissions, allResults, enrollment] = await Promise.all([
      prisma.attendance.findMany({
        where: {
          studentId: input.studentId,
          schoolId: input.schoolId,
          date: { gte: thirtyDaysAgo },
        },
        select: { status: true, date: true },
      }),
      prisma.assignmentSubmission.findMany({
        where: {
          studentId: input.studentId,
          schoolId: input.schoolId,
          assignment: input.academicYearId
            ? { academicYearId: input.academicYearId }
            : undefined,
        },
        select: { status: true, submittedAt: true },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.result.findMany({
        where: {
          studentId: input.studentId,
          schoolId: input.schoolId,
          academicYearId: input.academicYearId,
        },
        select: { score: true, date: true },
        orderBy: { date: "desc" },
      }),
      prisma.enrollment.findFirst({
        where: { studentId: input.studentId, academicYearId: input.academicYearId },
        select: { status: true },
      }),
    ])

    const factors: string[] = []
    let probability = 0

    // 1. Attendance pattern — consecutive absences indicate disengagement
    const totalRecent = recentAttendances.length
    const absences = recentAttendances.filter(a => a.status === "ausente").length
    const consecutiveAbsences = getConsecutiveAbsences(recentAttendances)

    if (totalRecent >= 5) {
      const absenceRate = absences / totalRecent
      if (absenceRate > 0.5) {
        probability += 0.4
        factors.push(`Faltou em ${Math.round(absenceRate * 100)}% dos dias recentes`)
      } else if (absenceRate > 0.3) {
        probability += 0.25
        factors.push(`Absentismo elevado (${Math.round(absenceRate * 100)}% de faltas)`)
      }

      if (consecutiveAbsences >= 5) {
        probability += 0.2
        factors.push(`${consecutiveAbsences} faltas consecutivas — possível desinteresse`)
      } else if (consecutiveAbsences >= 3) {
        probability += 0.1
        factors.push(`${consecutiveAbsences} faltas seguidas — monitorizar`)
      }
    }

    // 2. No recent submissions
    const recentSubmissionCount = recentSubmissions.filter(
      s => s.submittedAt && s.submittedAt >= thirtyDaysAgo
    ).length

    const hasSubmissions = recentSubmissions.length > 0
    const lastSubmissionAgo = hasSubmissions && recentSubmissions[0].submittedAt
      ? (Date.now() - recentSubmissions[0].submittedAt.getTime()) / (24 * 60 * 60 * 1000)
      : null

    if (hasSubmissions && lastSubmissionAgo !== null && lastSubmissionAgo > 21) {
      probability += 0.15
      factors.push(`Última submissão há ${Math.round(lastSubmissionAgo)} dias`)
    }

    if (!hasSubmissions && recentAttendances.length > 0) {
      probability += 0.1
      factors.push("Nenhuma tarefa submetida — possível desligamento")
    }

    // 3. Performance decline (no recent results vs previous)
    if (allResults.length >= 2) {
      const recent = allResults.slice(0, Math.ceil(allResults.length / 2))
      const older = allResults.slice(Math.ceil(allResults.length / 2))
      const recentAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length
      const olderAvg = older.reduce((s, r) => s + r.score, 0) / older.length

      if (olderAvg > 0 && recentAvg < olderAvg * 0.7) {
        probability += 0.15
        factors.push("Queda acentuada de desempenho — possível desmotivação")
      }
    }

    // 4. No recent results at all (no assessments taken)
    const lastResultDate = allResults.length > 0 ? allResults[0].date : null
    if (lastResultDate) {
      const daysSinceLastResult = (Date.now() - lastResultDate.getTime()) / (24 * 60 * 60 * 1000)
      if (daysSinceLastResult > 30) {
        probability += 0.1
        factors.push(`Sem avaliações há ${Math.round(daysSinceLastResult)} dias`)
      }
    }

    // 5. Enrollment status flags
    if (enrollment && enrollment.status === "transferida") return null
    if (enrollment && enrollment.status === "cancelada") {
      return {
        type: "abandono",
        studentId: input.studentId,
        probability: 1,
        severity: "critical",
        factors: ["Matrícula cancelada — abandono confirmado"],
        generatedAt: new Date(),
      }
    }

    if (factors.length === 0) return null

    const severity = probability >= 0.5 ? "high" : probability >= 0.25 ? "medium" : "low"

    return {
      type: "abandono",
      studentId: input.studentId,
      probability: Math.min(1, Math.round(probability * 100) / 100),
      severity: severity as PredictionResult["severity"],
      factors,
      generatedAt: new Date(),
    }
  },
}

function getConsecutiveAbsences(attendances: { status: string; date: Date }[]): number {
  const sorted = [...attendances].sort((a, b) => b.date.getTime() - a.date.getTime())
  let count = 0
  for (const a of sorted) {
    if (a.status === "ausente") count++
    else break
  }
  return count
}

predictorRegistry.register(AbandonoPredictor)
