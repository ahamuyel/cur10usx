"use client"

import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentInsightsProps {
  subjectAverages: { subjectName: string; average: number }[]
  attendancePercent: number
  pendingSubmissions: number
  generalAverage: number
  trimesterEvolution: { label: string; generalAverage: number }[]
}

export default function StudentInsights({
  subjectAverages,
  attendancePercent,
  pendingSubmissions,
  generalAverage,
  trimesterEvolution,
}: StudentInsightsProps) {
  const insights: { type: "warning" | "success" | "info"; message: string }[] = []

  const worst = [...subjectAverages].sort((a, b) => a.average - b.average)[0]
  const best = [...subjectAverages].sort((a, b) => b.average - a.average)[0]

  if (worst && worst.average < 10) {
    insights.push({ type: "warning", message: `${worst.subjectName} abaixo da média — precisas de melhorar` })
  }

  if (pendingSubmissions > 0) {
    insights.push({
      type: "warning",
      message: `Tens ${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""} por entregar`,
    })
  }

  if (attendancePercent < 75) {
    insights.push({ type: "warning", message: `Assiduidade em ${attendancePercent}% — risco de reprovação por faltas` })
  } else if (attendancePercent < 90) {
    insights.push({ type: "info", message: `Assiduidade em ${attendancePercent}% — podes melhorar a presença` })
  }

  if (generalAverage >= 16) {
    insights.push({ type: "success", message: `Média geral excelente! Continua assim 🎯` })
  } else if (generalAverage >= 14) {
    insights.push({ type: "success", message: `Bom desempenho! Estás no caminho certo ✅` })
  }

  if (best && best.average >= 16) {
    insights.push({ type: "success", message: `Melhor disciplina: ${best.subjectName} — ${best.average}/20` })
  }

  if (trimesterEvolution.length >= 2) {
    const first = trimesterEvolution[0]
    const last = trimesterEvolution[trimesterEvolution.length - 1]
    const diff = last.generalAverage - first.generalAverage
    if (diff > 0.5) {
      insights.push({ type: "success", message: `Média subiu ${diff.toFixed(1)} pontos — progresso consistente 📈` })
    } else if (diff < -0.5) {
      insights.push({ type: "warning", message: `Média caiu ${Math.abs(diff).toFixed(1)} pontos — atenção à tendência 📉` })
    }
  }

  if (attendancePercent >= 95) {
    insights.push({ type: "success", message: `Presença exemplar! 100% de assiduidade esta semana 🎯` })
  }

  if (insights.length === 0) {
    insights.push({ type: "info", message: "Sem dados suficientes para gerar insights" })
  }

  const icons = {
    warning: AlertTriangle,
    success: CheckCircle,
    info: Info,
  }
  const colors = {
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-300",
    success: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300",
    info: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-300",
  }

  return (
    <div className="bg-card rounded-card border border-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Insights</h3>
      <div className="space-y-2">
        {insights.slice(0, 4).map((insight, i) => {
          const Icon = icons[insight.type]
          return (
            <div
              key={i}
              className={cn("flex items-start gap-2.5 px-3 py-2.5 rounded-xl border text-xs font-medium", colors[insight.type])}
            >
              <Icon size={15} className="shrink-0 mt-0.5" />
              <span>{insight.message}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
