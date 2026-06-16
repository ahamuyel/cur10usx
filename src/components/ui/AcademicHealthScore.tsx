"use client"

import { useEffect, useState } from "react"
import { ArrowRight, TrendingUp, TrendingDown, Minus, HeartPulse } from "lucide-react"
import { cn } from "@/lib/utils"

interface Breakdown {
  academicPerformance: number
  attendance: number
  schoolActivity: number
  administrativeEfficiency: number
}

interface HealthData {
  score: number
  status: string
  breakdown: Breakdown
}

const STATUS_CONFIG: Record<string, { ring: string; text: string; bar: string; label: string; iconBg: string; badgeBg: string }> = {
  Excelente: { ring: "#10B981", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", label: "Excelente", iconBg: "bg-emerald-100 dark:bg-emerald-950/30", badgeBg: "bg-emerald-50 dark:bg-emerald-950/20" },
  Boa: { ring: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500", label: "Boa", iconBg: "bg-cyan-100 dark:bg-cyan-950/30", badgeBg: "bg-cyan-50 dark:bg-cyan-950/20" },
  Atenção: { ring: "#F59E0B", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", label: "Atenção", iconBg: "bg-amber-100 dark:bg-amber-950/30", badgeBg: "bg-amber-50 dark:bg-amber-950/20" },
  Crítica: { ring: "#F43F5E", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", label: "Crítica", iconBg: "bg-rose-100 dark:bg-rose-950/30", badgeBg: "bg-rose-50 dark:bg-rose-950/20" },
}

const BREAKDOWN_LABELS: Record<keyof Breakdown, string> = {
  academicPerformance: "Desempenho Académico",
  attendance: "Assiduidade",
  schoolActivity: "Actividade Escolar",
  administrativeEfficiency: "Eficiência Administrativa",
}

function ScoreRing({ score, status, size = "lg" }: { score: number; status: string; size?: "sm" | "lg" }) {
  const colors = STATUS_CONFIG[status] || STATUS_CONFIG.Crítica
  const isLg = size === "lg"
  const radius = isLg ? 72 : 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const viewBox = isLg ? 160 : 120
  const cxcy = viewBox / 2
  const strokeWidth = isLg ? 10 : 8

  return (
    <div className={cn("relative flex items-center justify-center shrink-0", isLg ? "w-40 h-40" : "w-32 h-32")}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
        <circle
          cx={cxcy} cy={cxcy} r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx={cxcy} cy={cxcy} r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold text-zinc-900 dark:text-zinc-100 tracking-tight", isLg ? "text-5xl" : "text-3xl")}>
          {score}
        </span>
        <span className={cn("font-medium text-zinc-400 dark:text-zinc-500", isLg ? "text-xs" : "text-[10px]")}>
          / 100
        </span>
      </div>
    </div>
  )
}

function BreakdownBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", color)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

export default function AcademicHealthScore() {
  const [data, setData] = useState<HealthData | null>(null)
  const [evolution, setEvolution] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/academic-health").then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      }),
      fetch("/api/analytics/executive-briefing").then(r => r.json()).catch(() => ({ health: { evolution: null } })),
    ])
      .then(([health, briefing]) => {
        if (health.error) throw new Error()
        setData(health)
        setEvolution(briefing.health?.evolution ?? null)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="flex-1 w-full space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Academic Health Score</h2>
        </div>
        <p className="text-sm text-zinc-400">Não foi possível calcular o score de saúde académica.</p>
      </div>
    )
  }

  const colors = STATUS_CONFIG[data.status] || STATUS_CONFIG.Crítica
  const breakdowns: { key: keyof Breakdown; value: number }[] = [
    { key: "academicPerformance", value: data.breakdown.academicPerformance },
    { key: "attendance", value: data.breakdown.attendance },
    { key: "schoolActivity", value: data.breakdown.schoolActivity },
    { key: "administrativeEfficiency", value: data.breakdown.administrativeEfficiency },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center", colors.iconBg)}>
            <HeartPulse size={16} className={colors.text} />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Academic Health Score
          </h2>
        </div>
        <button className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
          Ver relatório
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
        {/* Left: Score Ring */}
        <div className="flex flex-col items-center gap-3">
          <ScoreRing score={data.score} status={data.status} size="lg" />
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-semibold px-2.5 py-0.5 rounded-full", colors.badgeBg, colors.text)}>
              {colors.label}
            </span>
            {evolution !== null && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
                evolution > 0
                  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
                  : evolution < 0
                    ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20"
                    : "text-zinc-400 bg-zinc-50 dark:bg-zinc-800"
              )}>
                {evolution > 0 ? <TrendingUp size={10} /> : evolution < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
                {evolution > 0 ? "+" : ""}{evolution} este mês
              </span>
            )}
          </div>
        </div>

        {/* Right: Breakdown */}
        <div className="flex-1 w-full space-y-3 min-w-0 pt-1">
          <div className="space-y-3">
            {breakdowns.map(b => (
              <BreakdownBar
                key={b.key}
                label={BREAKDOWN_LABELS[b.key]}
                value={b.value}
                color={colors.bar}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
