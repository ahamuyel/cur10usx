import { prisma } from "@/lib/prisma"
import type { Predictor, PredictionInput, PredictionResult } from "@/lib/predictors"
import { predictorRegistry } from "@/lib/predictors"

const PerformanceDropPredictor: Predictor = {
  type: "queda_desempenho",
  name: "Preditor de Queda de Desempenho",
  description: "Detecta alunos cujo desempenho académico está em declínio comparando trimestres consecutivos.",

  async predict(input: PredictionInput): Promise<PredictionResult | null> {
    const results = await prisma.result.findMany({
      where: {
        studentId: input.studentId,
        schoolId: input.schoolId,
        academicYearId: input.academicYearId,
      },
      select: { score: true, trimester: true },
      orderBy: { trimester: "asc" },
    })

    if (results.length < 5) return null

    const byTrimester: Record<string, number[]> = {}
    for (const r of results) {
      if (r.trimester) {
        if (!byTrimester[r.trimester]) byTrimester[r.trimester] = []
        byTrimester[r.trimester].push(r.score)
      }
    }

    const trimesterAverages: { trimester: string; avg: number }[] = []
    for (const [t, scores] of Object.entries(byTrimester)) {
      trimesterAverages.push({
        trimester: t,
        avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      })
    }

    if (trimesterAverages.length < 2) return null

    trimesterAverages.sort((a, b) => a.trimester.localeCompare(b.trimester))

    const recent = trimesterAverages[trimesterAverages.length - 1].avg
    const previous = trimesterAverages[trimesterAverages.length - 2].avg
    const drop = previous - recent

    if (drop <= 0) return null

    const dropPercent = (drop / previous) * 100
    const factors: string[] = [
      `Queda de ${Math.round(drop * 10) / 10} valores no ${trimesterAverages[trimesterAverages.length - 1].trimester}`,
    ]

    let probability = dropPercent / 100
    if (drop >= 3) {
      probability = 0.8
      factors.push("Queda superior a 3 valores — crítico")
    } else if (drop >= 2) {
      probability = 0.6
      factors.push("Queda entre 2 e 3 valores — preocupante")
    } else {
      probability = 0.3
    }

    const severity = probability >= 0.6 ? "high" : probability >= 0.3 ? "medium" : "low"

    return {
      type: "queda_desempenho",
      studentId: input.studentId,
      probability: Math.min(1, Math.round(probability * 100) / 100),
      severity: severity as PredictionResult["severity"],
      factors,
      generatedAt: new Date(),
    }
  },
}

predictorRegistry.register(PerformanceDropPredictor)
