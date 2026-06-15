import type { AcademicHealthResult } from "@/lib/academic-health"
import type { HistoryEntry } from "@/lib/academic-health-history"
import { prisma } from "@/lib/prisma"
import { getCurrentAcademicYear } from "@/lib/academic-year"

export interface Insight {
  type: "positive" | "warning" | "critical"
  icon: "trending-up" | "trending-down" | "check" | "alert" | "info"
  title: string
  message: string
}

function findEntryBefore(
  history: HistoryEntry[],
  daysAgo: number
): HistoryEntry | undefined {
  const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000
  const sorted = [...history].sort(
    (a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime()
  )
  return sorted.find(e => new Date(e.snapshotDate).getTime() >= cutoff)
}

export async function generateInsights(
  current: AcademicHealthResult,
  history: HistoryEntry[],
  schoolId: string
): Promise<Insight[]> {
  const insights: Insight[] = []
  const b = current.breakdown

  // ── Assiduidade ──────────────────────────────────────────────
  if (b.attendance >= 90) {
    insights.push({
      type: "positive",
      icon: "check",
      title: "Assiduidade Exemplar",
      message: `Assiduidade acima da meta (${b.attendance}%). Os alunos estão a comparecer regularmente às aulas.`,
    })
  } else if (b.attendance < 75) {
    insights.push({
      type: "warning",
      icon: "alert",
      title: "Assiduidade Preocupante",
      message: `Assiduidade em ${b.attendance}%. Abaixo do recomendado. A ausência frequente impacta directamente o rendimento.`,
    })
  } else {
    insights.push({
      type: "positive",
      icon: "info",
      title: "Assiduidade Regular",
      message: `Assiduidade em ${b.attendance}%. Dentro do esperado.`,
    })
  }

  // ── Desempenho Académico ─────────────────────────────────────
  if (b.academicPerformance >= 75) {
    insights.push({
      type: "positive",
      icon: "trending-up",
      title: "Desempenho Académico Sólido",
      message: `Média geral de ${b.academicPerformance}%. O desempenho académico está num bom nível.`,
    })
  } else if (b.academicPerformance < 60) {
    insights.push({
      type: "critical",
      icon: "trending-down",
      title: "Desempenho Crítico",
      message: `Média geral de ${b.academicPerformance}%. Necessita de intervenção pedagógica urgente.`,
    })
  } else {
    insights.push({
      type: "warning",
      icon: "info",
      title: "Desempenho Requer Atenção",
      message: `Média geral de ${b.academicPerformance}%. Monitorizar evolução nas próximas semanas.`,
    })
  }

  // ── Actividade Escolar ───────────────────────────────────────
  if (b.schoolActivity >= 75) {
    insights.push({
      type: "positive",
      icon: "check",
      title: "Boa Actividade Lectiva",
      message: `Actividade escolar em ${b.schoolActivity}%. As tarefas e aulas estão a decorrer conforme planeado.`,
    })
  } else if (b.schoolActivity < 50) {
    insights.push({
      type: "warning",
      icon: "alert",
      title: "Baixa Actividade Escolar",
      message: `Actividade escolar em ${b.schoolActivity}%. Poucas tarefas e actividades registadas.`,
    })
  }

  // ── Eficiência Administrativa ─────────────────────────────────
  if (b.administrativeEfficiency < 80) {
    insights.push({
      type: "warning",
      icon: "alert",
      title: "Pendências Administrativas",
      message: `Eficiência administrativa em ${b.administrativeEfficiency}%. Existem solicitações por resolver.`,
    })
  } else {
    insights.push({
      type: "positive",
      icon: "check",
      title: "Gestão Eficiente",
      message: "Processos administrativos em dia. Sem pendências significativas.",
    })
  }

  // ── Tendência do Score ───────────────────────────────────────
  if (history.length >= 2) {
    const sorted = [...history].reverse()
    const latest = sorted[sorted.length - 1].score
    const previous = sorted[sorted.length - 2].score
    const diff = latest - previous

    if (diff > 0) {
      insights.push({
        type: "positive",
        icon: "trending-up",
        title: "Tendência Positiva",
        message: `O Academic Health Score subiu ${diff} ponto(s) desde o último registo.`,
      })
    } else if (diff < 0) {
      insights.push({
        type: "warning",
        icon: "trending-down",
        title: "Tendência Negativa",
        message: `O Academic Health Score caiu ${Math.abs(diff)} ponto(s) desde o último registo.`,
      })
    }
  }

  // ── Detecção de Tendências Dinâmicas (7 dias) ────────────────
  const weekAgo = findEntryBefore(history, 7)
  if (weekAgo) {
    const attDiff = b.attendance - weekAgo.breakdown.attendance
    if (attDiff <= -5) {
      insights.push({
        type: "warning",
        icon: "trending-down",
        title: "Crescimento de Faltas",
        message: `A assiduidade caiu ${Math.abs(attDiff)} pontos nos últimos 7 dias. Necessita de monitorização.`,
      })
    }

    const perfDiff = b.academicPerformance - weekAgo.breakdown.academicPerformance
    if (perfDiff <= -5) {
      insights.push({
        type: "critical",
        icon: "trending-down",
        title: "Queda no Desempenho",
        message: `O desempenho académico caiu ${Math.abs(perfDiff)} pontos em 7 dias. Pode indicar problemas emergentes.`,
      })
    }

    const actDiff = b.schoolActivity - weekAgo.breakdown.schoolActivity
    if (actDiff <= -10) {
      insights.push({
        type: "warning",
        icon: "trending-down",
        title: "Queda nas Submissões",
        message: `A actividade escolar reduziu ${Math.abs(actDiff)} pontos. Menos tarefas a serem entregues.`,
      })
    }
  }

  // ── Consultas dinâmicas a dados recentes ─────────────────────
  const academicYear = await getCurrentAcademicYear(schoolId)
  const yearFilter = academicYear?.id ? { academicYearId: academicYear.id } : {}

  const [pendingApps, subjectAverages, recentAbsences] = await Promise.all([
    prisma.application.count({
      where: { schoolId, status: "pendente" },
    }),
    prisma.result.groupBy({
      by: ["subjectId"],
      where: { schoolId, ...yearFilter },
      _avg: { score: true },
      orderBy: { _avg: { score: "asc" } },
      take: 3,
    }),
    prisma.attendance.count({
      where: {
        schoolId,
        status: "ausente",
        date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  // Solicitações pendentes
  if (pendingApps > 5) {
    insights.push({
      type: "warning",
      icon: "alert",
      title: "Solicitações Acumuladas",
      message: `${pendingApps} candidatura(s) aguardam análise. O tempo de resposta pode afectar a imagem da escola.`,
    })
  }

  // Disciplinas mais críticas (piores médias)
  if (subjectAverages.length > 0) {
    const topSubjects = await Promise.all(
      subjectAverages.map(async s => {
        const subject = await prisma.subject.findUnique({
          where: { id: s.subjectId },
          select: { name: true },
        })
        return { name: subject?.name ?? "Desconhecida", avg: s._avg.score ?? 0 }
      })
    )

    const worstSubjects = topSubjects
      .filter(s => s.avg < 10)
      .map(s => `${s.name} (${s.avg.toFixed(1)})`)

    if (worstSubjects.length === 1) {
      insights.push({
        type: "warning",
        icon: "alert",
        title: "Disciplina Crítica",
        message: `${worstSubjects[0]} — média abaixo de 10 valores. Reforço pedagógico recomendado.`,
      })
    } else if (worstSubjects.length >= 2) {
      insights.push({
        type: "critical",
        icon: "trending-down",
        title: "Múltiplas Disciplinas Críticas",
        message: `${worstSubjects.join(", ")} — requerem intervenção pedagógica urgente.`,
      })
    }
  }

  // Pico de faltas recentes
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const totalAbsencesLast30 = await prisma.attendance.count({
    where: { schoolId, status: "ausente", date: { gte: thirtyDaysAgo } },
  })
  if (totalAbsencesLast30 > 0 && recentAbsences > totalAbsencesLast30 * 0.4) {
    insights.push({
      type: "warning",
      icon: "trending-down",
      title: "Pico de Absentismo",
      message: `${recentAbsences} falta(s) apenas na última semana — mais de 40% do total dos últimos 30 dias.`,
    })
  }

  return insights
}
