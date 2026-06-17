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
  const totalStudents = studentRisk.totalStudents || 1

  // 1. Alunos em Risco (Baseado em %)
  const riskPercentage = (studentRisk.totalAtRisk / totalStudents) * 100
  if (studentRisk.totalAtRisk > 0) {
    recommendations.push({
      priority: riskPercentage > 15 ? "urgent" : riskPercentage > 5 ? "high" : "medium",
      action: `Convocar reunião com encarregados dos ${studentRisk.totalAtRisk} alunos em risco.`,
      reason: `${studentRisk.totalAtRisk} alunos (${riskPercentage.toFixed(1)}%) apresentam risco elevado ou crítico.`,
      category: "pedagogico",
    })
  }

  // 2. Turmas Críticas (Baseado em %)
  const totalClasses = classHealth.classes.length || 1
  const criticalClassesPercentage = (classHealth.criticalCount / totalClasses) * 100
  if (classHealth.criticalCount > 0) {
    recommendations.push({
      priority: criticalClassesPercentage > 20 ? "urgent" : "high",
      action: `Reforçar acompanhamento pedagógico das ${classHealth.criticalCount} turmas críticas.`,
      reason: `${classHealth.criticalCount} turma(s) (${criticalClassesPercentage.toFixed(1)}%) têm aproveitamento inferior a 60%.`,
      category: "pedagogico",
    })
  }

  // 3. Assiduidade (Threshold Pedagógico)
  if (health.breakdown.attendance < 80) {
    recommendations.push({
      priority: health.breakdown.attendance < 70 ? "urgent" : "high",
      action: "Implementar plano de redução de faltas e absentismo.",
      reason: `Assiduidade global em ${health.breakdown.attendance}%, abaixo da meta mínima de 80%.`,
      category: "assiduidade",
    })
  }

  // 4. Queda de Performance (Tendência)
  if (trends.change7d !== null && trends.change7d < -3) {
    recommendations.push({
      priority: "high",
      action: "Analisar causas da queda no aproveitamento semanal.",
      reason: `O aproveitamento global caiu ${Math.abs(trends.change7d)} pontos nos últimos 7 dias.`,
      category: "geral",
    })
  }

  // 5. Eficiência Operacional
  if (health.breakdown.administrativeEfficiency < 75) {
    recommendations.push({
      priority: "medium",
      action: "Regularizar processos administrativos e candidaturas pendentes.",
      reason: `Eficiência administrativa em ${health.breakdown.administrativeEfficiency}%.`,
      category: "administrativo",
    })
  }

  // 6. Aproveitamento Académico Crítico
  if (health.breakdown.academicPerformance < 50) {
    recommendations.push({
      priority: "urgent",
      action: "Intervenção pedagógica de emergência por baixo rendimento.",
      reason: `Aproveitamento académico global crítico (${health.breakdown.academicPerformance}%).`,
      category: "pedagogico",
    })
  }

  recommendations.sort((a, b) => {
    const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })

  return recommendations
}
