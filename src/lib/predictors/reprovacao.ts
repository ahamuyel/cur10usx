import { prisma } from "@/lib/prisma"
import { resolveGradingConfig } from "@/lib/evaluation-engine"
import type { Predictor, PredictionInput, PredictionResult } from "@/lib/predictors"
import { predictorRegistry } from "@/lib/predictors"

const ReprovacaoPredictor: Predictor = {
  type: "reprovacao",
  name: "Preditor de Reprovação",
  description: "Identifica alunos com risco de reprovação com base nas notas actuais, disciplinas em recuperação e histórico anterior.",

  async predict(input: PredictionInput): Promise<PredictionResult | null> {
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: input.studentId, academicYearId: input.academicYearId, schoolId: input.schoolId },
      include: {
        class: { select: { grade: true, courseId: true } },
        student: { select: { classId: true } },
      },
    })

    if (!enrollment) return null

    const { grade, courseId } = enrollment.class
    const config = await resolveGradingConfig(
      input.schoolId,
      input.academicYearId!,
      grade,
      courseId
    )

    const results = await prisma.result.findMany({
      where: {
        studentId: input.studentId,
        schoolId: input.schoolId,
        academicYearId: input.academicYearId,
      },
      select: { score: true, trimester: true, subjectId: true },
    })

    if (results.length < 3) return null

    const bySubject: Record<string, number[]> = {}
    for (const r of results) {
      if (!bySubject[r.subjectId]) bySubject[r.subjectId] = []
      bySubject[r.subjectId].push(r.score)
    }

    let failingSubjects = 0
    let borderlineSubjects = 0
    const factors: string[] = []

    for (const [, scores] of Object.entries(bySubject)) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      if (avg < config.passingGrade) {
        failingSubjects++
      }
      if (avg >= config.passingGrade && avg < config.passingGrade + 2) {
        borderlineSubjects++
      }
    }

    if (failingSubjects === 0 && borderlineSubjects === 0) return null

    if (failingSubjects > 0) {
      factors.push(`${failingSubjects} disciplina(s) abaixo da nota de passagem (${config.passingGrade})`)
    }
    if (borderlineSubjects > 0) {
      factors.push(`${borderlineSubjects} disciplina(s) na nota mínima — risco de recuperação`)
    }

    const totalSubjects = Object.keys(bySubject).length
    const failRatio = totalSubjects > 0 ? failingSubjects / totalSubjects : 0

    let probability = 0
    if (failRatio >= 0.5) {
      probability = 0.9
      if (failingSubjects > config.maxFailedSubjects) {
        factors.push(`Excede o limite de ${config.maxFailedSubjects} disciplinas para recurso — reprovação directa`)
      }
    } else if (failRatio >= 0.3) {
      probability = 0.6
      factors.push("Múltiplas disciplinas críticas — probabilidade elevada de reprovação")
    } else if (failingSubjects > 0) {
      probability = 0.3 + (borderlineSubjects * 0.05)
      factors.push("Disciplinas em risco — intervenção precoce pode evitar reprovação")
    }

    if (enrollment.status === "em_recurso") {
      probability = Math.min(1, probability + 0.3)
      factors.push("Aluno já em regime de recurso")
    }

    const historicalFailures = await prisma.academicHistory.count({
      where: { studentId: input.studentId, status: "reprovada" },
    })
    if (historicalFailures > 0) {
      probability = Math.min(1, probability + 0.1)
      factors.push(`Reprovou ${historicalFailures} vez(es) anteriormente`)
    }

    const severity = probability >= 0.7 ? "high" : probability >= 0.4 ? "medium" : "low"

    return {
      type: "reprovacao",
      studentId: input.studentId,
      probability: Math.round(probability * 100) / 100,
      severity: severity as PredictionResult["severity"],
      factors,
      generatedAt: new Date(),
    }
  },
}

predictorRegistry.register(ReprovacaoPredictor)
