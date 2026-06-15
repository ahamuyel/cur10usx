import type { AcademicHealthResult } from "@/lib/academic-health"
import type { ClassHealthSummary } from "@/lib/class-health"
import type { StudentRiskSummary } from "@/lib/student-risk"
import type { TrendData } from "@/lib/academic-health-history"

export type Priority = "urgent" | "high" | "medium" | "low"

export interface Recommendation {
  priority: Priority
  action: string
  reason: string
  category: "pedagogico" | "assiduidade" | "administrativo" | "geral"
}

export function generateRecommendations(
  health: AcademicHealthResult,
  classHealth: ClassHealthSummary,
  studentRisk: StudentRiskSummary,
  trends: TrendData
): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (studentRisk.totalAtRisk > 0) {
    recommendations.push({
      priority: studentRisk.totalAtRisk > 10 ? "urgent" : "high",
      action: `Convocar reunião com encarregados dos ${studentRisk.totalAtRisk} alunos em risco académico.`,
      reason: `${studentRisk.totalAtRisk} alunos apresentam risco elevado ou crítico.`,
      category: "pedagogico",
    })
  }

  if (classHealth.criticalCount > 0) {
    recommendations.push({
      priority: classHealth.criticalCount > 3 ? "urgent" : "high",
      action: `Reforçar acompanhamento pedagógico das ${classHealth.criticalCount} turmas com score crítico.`,
      reason: `${classHealth.criticalCount} turma(s) apresentam score inferior a 60.`,
      category: "pedagogico",
    })
  }

  if (health.breakdown.attendance < 75) {
    recommendations.push({
      priority: "high",
      action: "Implementar medidas para redução do absentismo escolar.",
      reason: `Assiduidade em ${health.breakdown.attendance}%, abaixo do mínimo recomendado de 75%.`,
      category: "assiduidade",
    })
  }

  if (trends.change7d !== null && trends.change7d < -3) {
    recommendations.push({
      priority: "high",
      action: "Investigar causa da queda repentina no Academic Health Score.",
      reason: `Score caiu ${Math.abs(trends.change7d)} pontos nos últimos 7 dias.`,
      category: "geral",
    })
  }

  if (health.breakdown.administrativeEfficiency < 70) {
    recommendations.push({
      priority: "medium",
      action: "Regularizar solicitações e processos administrativos pendentes.",
      reason: `Eficiência administrativa em ${health.breakdown.administrativeEfficiency}%.`,
      category: "administrativo",
    })
  }

  if (health.breakdown.academicPerformance < 60) {
    recommendations.push({
      priority: "urgent",
      action: "Realizar intervenção pedagógica urgente para elevar o desempenho académico.",
      reason: `Desempenho académico crítico (${health.breakdown.academicPerformance}%).`,
      category: "pedagogico",
    })
  }

  if (health.breakdown.schoolActivity < 50) {
    recommendations.push({
      priority: "medium",
      action: "Garantir que professores registam actividades e tarefas regularmente.",
      reason: `Baixo índice de actividade escolar (${health.breakdown.schoolActivity}%).`,
      category: "pedagogico",
    })
  }

  if (classHealth.classes.length > 0) {
    const worst = classHealth.classes[0]
    if (worst && worst.score < 60) {
      recommendations.push({
        priority: "high",
        action: `Intervir na turma ${worst.className} (score: ${worst.score}).`,
        reason: `Pior turma da escola. Desempenho: ${worst.breakdown.academicPerformance}, Assiduidade: ${worst.breakdown.attendance}.`,
        category: "pedagogico",
      })
    }
  }

  recommendations.sort((a, b) => {
    const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })

  return recommendations
}
