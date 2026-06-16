"use client"

import { useEffect, useState, useRef } from "react"
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

interface HistoryEntry {
  breakdown: Breakdown
  snapshotDate: string
}

const STATUS_GRADIENT: Record<string, { ring: string; text: string; label: string; iconBg: string; badgeBg: string }> = {
  Excelente: { ring: "#10B981", text: "text-emerald-600 dark:text-emerald-400", label: "Excelente", iconBg: "bg-emerald-100 dark:bg-emerald-950/30", badgeBg: "bg-emerald-50 dark:bg-emerald-950/20" },
  Boa: { ring: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", label: "Boa", iconBg: "bg-cyan-100 dark:bg-cyan-950/30", badgeBg: "bg-cyan-50 dark:bg-cyan-950/20" },
  Atenção: { ring: "#F59E0B", text: "text-amber-600 dark:text-amber-400", label: "Atenção", iconBg: "bg-amber-100 dark:bg-amber-950/30", badgeBg: "bg-amber-50 dark:bg-amber-950/20" },
  Crítica: { ring: "#F43F5E", text: "text-rose-600 dark:text-rose-400", label: "Crítica", iconBg: "bg-rose-100 dark:bg-rose-950/30", badgeBg: "bg-rose-50 dark:bg-rose-950/20" },
}

const BREAKDOWN_LABELS: Record<keyof Breakdown, string> = {
  academicPerformance: "Desempenho Académico",
  attendance: "Assiduidade",
  schoolActivity: "Actividade Escolar",
  administrativeEfficiency: "Eficiência Administrativa",
}

function ScoreRing({ score, status, animate = false }: { score: number; status: string; animate?: boolean }) {
  const colors = STATUS_GRADIENT[status] || STATUS_GRADIENT.Crítica
  const radius = 72
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-44 h-44 shrink-0">
      {/* Ring */}
      <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 160 160">
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>

      {/* Score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight tabular-nums">
          {score}
        </span>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tracking-wider">
          / 100
        </span>
      </div>
    </div>
  )
}

function getTrend(data: number[]): "up" | "down" | "flat" {
  if (data.length < 2) return "flat"
  const diff = data[data.length - 1] - data[0]
  if (diff > 1) return "up"
  if (diff < -1) return "down"
  return "flat"
}

function TrendSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const w = 32
  const h = 14
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(max - min, 1)
  const points = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(((max - v) / range) * h).toFixed(1)}`)
    .join(" ")
  const trend = getTrend(data)
  const stroke = trend === "up" ? "#10B981" : trend === "down" ? "#F43F5E" : "#a1a1aa"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function BreakdownBar({
  label,
  value,
  sparklineData,
}: {
  label: string
  value: number
  sparklineData?: number[]
}) {
  const [barWidth, setBarWidth] = useState(0)
  const trend = sparklineData ? getTrend(sparklineData) : null

  return (
    <div className="group space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {sparklineData && <TrendSparkline data={sparklineData} />}
          {trend && trend !== "flat" && (
            trend === "up"
              ? <TrendingUp size={10} className="text-emerald-500" />
              : <TrendingDown size={10} className="text-rose-500" />
          )}
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums text-right">
            {value}%
          </span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out group-hover:opacity-80 bg-primary"
          style={{ width: `${barWidth}%` }}
          ref={el => {
            if (el && barWidth === 0) {
              requestAnimationFrame(() => setBarWidth(Math.min(100, Math.max(0, value))))
            }
          }}
        />
      </div>
    </div>
  )
}

function InsightText({ breakdown, sparklines }: { breakdown: Breakdown; sparklines: Record<string, number[]> | null }) {
  const entries = Object.entries(breakdown) as [keyof Breakdown, number][]
  entries.sort((a, b) => b[1] - a[1])
  const best = entries[0]
  const worst = entries[entries.length - 1]

  const worstTrend = sparklines?.[worst[0]] ? getTrend(sparklines[worst[0]]) : null
  const bestTrend = sparklines?.[best[0]] ? getTrend(sparklines[best[0]]) : null

  if (best[0] === worst[0]) {
    return (
      <p className="text-xs text-zinc-400 leading-relaxed">
        {BREAKDOWN_LABELS[best[0]]} está em {best[1] >= 80 ? "boa condição" : "nível moderado"} ({best[1]}). Todos os indicadores alinhados.
      </p>
    )
  }

  return (
    <p className="text-xs text-zinc-400 leading-relaxed">
      <span className="font-medium text-zinc-500 dark:text-zinc-300">{BREAKDOWN_LABELS[best[0]]}</span> lidera ({best[1]})
      {bestTrend === "up" ? " e a subir" : bestTrend === "down" ? " mas a descer" : ""}.
      {" "}
      <span className="font-medium text-zinc-500 dark:text-zinc-300">{BREAKDOWN_LABELS[worst[0]]}</span> precisa de atenção ({worst[1]})
      {worstTrend === "up" ? " mas a recuperar" : worstTrend === "down" ? " e a piorar" : ""}.
    </p>
  )
}

function useCounter(target: number, enabled: boolean): number {
  const [count, setCount] = useState(0)
  const ref = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) {
      setCount(target)
      return
    }
    const duration = 1000
    const steps = 40
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(interval)
      } else {
        setCount(Math.round(current))
      }
    }, duration / steps)
    ref.current = interval
    return () => clearInterval(interval)
  }, [target, enabled])

  return count
}

export default function AcademicHealthScore() {
  const [data, setData] = useState<HealthData | null>(null)
  const [evolution, setEvolution] = useState<number | null>(null)
  const [sparklines, setSparklines] = useState<Record<string, number[]> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics/academic-health").then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      }),
      fetch("/api/analytics/executive-briefing").then(r => r.json()).catch(() => ({ health: { evolution: null } })),
      fetch("/api/analytics/academic-health/history").then(r => r.json()).catch(() => null),
    ])
      .then(([health, briefing, historyData]) => {
        if (health.error) throw new Error()
        setData(health)
        setEvolution(briefing.health?.evolution ?? null)

        if (historyData?.history?.length > 1) {
          const recent = [...historyData.history].reverse().slice(-7)
          setSparklines({
            academicPerformance: recent.map((e: HistoryEntry) => e.breakdown.academicPerformance),
            attendance: recent.map((e: HistoryEntry) => e.breakdown.attendance),
            schoolActivity: recent.map((e: HistoryEntry) => e.breakdown.schoolActivity),
            administrativeEfficiency: recent.map((e: HistoryEntry) => e.breakdown.administrativeEfficiency),
          })
        }
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false)
        requestAnimationFrame(() => setVisible(true))
      })
  }, [])

  const displayScore = useCounter(data?.score ?? 0, visible && !!data)

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-44 h-44 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
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

  const colors = STATUS_GRADIENT[data.status] || STATUS_GRADIENT.Crítica
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
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
        {/* Left: Score Ring + Badges */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <ScoreRing score={visible ? displayScore : 0} status={data.status} />
          <div className="flex flex-wrap items-center justify-center gap-2">
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
            {breakdowns.map((b, i) => (
              <div
                key={b.key}
                className="transition-all duration-500"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(8px)",
                  transitionDelay: `${(i + 1) * 80}ms`,
                }}
              >
                <BreakdownBar
                  label={BREAKDOWN_LABELS[b.key]}
                  value={b.value}
                  sparklineData={sparklines?.[b.key]}
                />
              </div>
            ))}
          </div>

          {/* Insight */}
          {sparklines && (
            <div
              className="pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transitionDelay: "400ms",
              }}
            >
              <InsightText breakdown={data.breakdown} sparklines={sparklines} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
