import { prisma } from "@/lib/prisma"
import type { Predictor, PredictionInput, PredictionResult } from "@/lib/predictors"
import { predictorRegistry } from "@/lib/predictors"

const AbsenteismPredictor: Predictor = {
  type: "absentismo",
  name: "Preditor de Absentismo",
  description: "Identifica alunos com risco de absentismo com base no histórico de presenças dos últimos 30 dias.",

  async predict(input: PredictionInput): Promise<PredictionResult | null> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAttendances = await prisma.attendance.findMany({
      where: {
        studentId: input.studentId,
        schoolId: input.schoolId,
        date: { gte: thirtyDaysAgo },
      },
      select: { status: true },
    })

    if (recentAttendances.length < 5) return null

    const total = recentAttendances.length
    const absences = recentAttendances.filter(a => a.status === "ausente").length
    const lateCount = recentAttendances.filter(a => a.status === "atrasado").length

    const absenceRate = absences / total
    const lateRate = lateCount / total

    let probability = 0
    const factors: string[] = []

    if (absenceRate > 0.3) {
      probability += 0.5
      factors.push(`Taxa de ausência elevada (${Math.round(absenceRate * 100)}%)`)
    }

    if (absenceRate > 0.15 && absenceRate <= 0.3) {
      probability += 0.25
      factors.push(`Ausências recorrentes (${Math.round(absenceRate * 100)}%)`)
    }

    if (lateRate > 0.3) {
      probability += 0.15
      factors.push(`Atrasos frequentes (${Math.round(lateRate * 100)}%)`)
    }

    if (factors.length === 0) return null

    const severity = probability >= 0.5 ? "high" : probability >= 0.25 ? "medium" : "low"

    return {
      type: "absentismo",
      studentId: input.studentId,
      probability: Math.min(1, Math.round(probability * 100) / 100),
      severity: severity as PredictionResult["severity"],
      factors,
      generatedAt: new Date(),
    }
  },
}

predictorRegistry.register(AbsenteismPredictor)
