"use client"

import { useEffect, useState, useRef } from "react"
import { ArrowRight, TrendingUp, TrendingDown, Minus, HeartPulse, Sparkles } from "lucide-react"
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

// UI UPGRADE: Cores atualizadas com bordas e efeitos específicos para o modo escuro
const STATUS_GRADIENT: Record<string, { ring: string; text: string; label: string; iconBg: string; badgeBg: string; glow: string }> = {
  Excelente: { ring: "#10B981", text: "text-emerald-600 dark:text-emerald-400", label: "Excelente", iconBg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/50 dark:border-emerald-800/30", badgeBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60", glow: "from-emerald-50/20 via-transparent to-transparent dark:from-emerald-950/5" },
  Boa: { ring: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", label: "Boa", iconBg: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/50 dark:border-cyan-800/30", badgeBg: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/60", glow: "from-cyan-50/20 via-transparent to-transparent dark:from-cyan-950/5" },
  Atenção: { ring: "#F59E0B", text: "text-amber-600 dark:text-amber-400", label: "Atenção", iconBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200/50 dark:border-amber-800/30", badgeBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60", glow: "from-amber-50/20 via-transparent to-transparent dark:from-amber-950/5" },
  Crítica: { ring: "#F43F5E", text: "text-rose-600 dark:text-rose-400", label: "Crítica", iconBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200/50 dark:border-rose-800/30", badgeBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60", glow: "from-rose-50/20 via-transparent to-transparent dark:from-rose-950/5" },
}

const BREAKDOWN_LABELS: Record<keyof Breakdown, string> = {
  academicPerformance: "Desempenho Académico",
  attendance: "Assiduidade",
  schoolActivity: "Actividade Escolar",
  administrativeEfficiency: "Eficiência Administrativa",
}

function ScoreRing({ score, status }: { score: number; status: string; animate?: boolean }) {
  const colors = STATUS_GRADIENT[status] || STATUS_GRADIENT.Crítica
  const radius = 70 // Pequeno ajuste de tamanho para dar respiro à borda
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        {/* Background track com degradê suave opaco */}
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-zinc-100 dark:text-zinc-800/80"
        />
        <circle
          cx="80" cy="80" r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
          style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl sm:text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums">
          {score}
        </span>
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase mt-0.5">
          Score Geral
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
  const w = 36
  const h = 16
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(max - min, 1)
  const points = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(((max - v) / range) * h).toFixed(1)}`)
    .join(" ")
  const trend = getTrend(data)
  const stroke = trend === "up" ? "#10B981" : trend === "down" ? "#F43F5E" : "#71717a"

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={2}
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
    // UI UPGRADE: Card interno muito sutil para cada métrica com hover discreto
    <div className="group space-y-2 p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800/50 border">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200 transition-colors📋">
          {label}
        </span>
        <div className="flex items-center gap-2.5">
          {sparklineData && <TrendSparkline data={sparklineData} />}
          {trend && trend !== "flat" && (
            trend === "up"
              ? <span className="flex items-center text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1 rounded"><TrendingUp size={12} /></span>
              : <span className="flex items-center text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-1 rounded"><TrendingDown size={12} /></span>
          )}
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tabular-nums min-w-[32px] text-right">
            {value}%
          </span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out bg-primary group-hover:opacity-90"
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
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {BREAKDOWN_LABELS[best[0]]} está em {best[1] >= 80 ? "boa condição" : "nível moderado"} ({best[1]}). Todos os indicadores alinhados.
      </p>
    )
  }

  return (
    // UI UPGRADE: Layout interno do bloco de IA reformulado
    <div className="flex items-start gap-2.5">
      {/* <div className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5 text-zinc-500">
        <Sparkles size={12} />
      </div> */}
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        Análise Automatizada: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{BREAKDOWN_LABELS[best[0]]}</span> destaca-se positivamente com {best[1]}% 
        {bestTrend === "up" ? " em crescimento contínuo" : bestTrend === "down" ? " mas demonstra desaceleração" : ""}. 
        Em contrapartida, <span className="font-semibold text-zinc-800 dark:text-zinc-200">{BREAKDOWN_LABELS[worst[0]]}</span> acende um sinal de alerta com {worst[1]}% 
        {worstTrend === "up" ? " apesar de indicar recuperação recente" : worstTrend === "down" ? " com forte tendência de queda" : ""}.
      </p>
    </div>
  )
}

function useCounter(target: number, enabled: boolean): number {
  const [count, setCount] = useState(0)

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
      fetch("/api/analytics/academic-health").then(r => { if (!r.ok) throw new Error(); return r.json() }),
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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-40 h-40 rounded-full bg-zinc-100 dark:bg-zinc-800/60 animate-pulse shrink-0" />
          <div className="flex-1 w-full space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800/40 animate-pulse" />
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
          <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500">
            <HeartPulse size={16} />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Saúde Académica</h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Não foi possível calcular o índice de saúde académica neste momento.</p>
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
    // UI UPGRADE: Adicionado overflow-hidden e um gradiente radial (colors.glow) de fundo muito discreto que muda de acordo com o status
    <div className={cn(
      "bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-sm p-6 sm:p-8 relative overflow-hidden bg-gradient-to-tr", 
      colors.glow
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border", colors.iconBg)}>
            <HeartPulse size={15} className={colors.text} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Saúde Académica Global
            </h2>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Índice Geral em tempo real</p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 shadow-sm">
          Relatório completo
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 relative z-10">
        
        {/* Left Area: Anel de Score + Status em Destaque */}
        <div className="flex flex-col items-center gap-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100/70 dark:border-zinc-800/30 p-4 rounded-2xl min-w-[190px]">
          <ScoreRing score={visible ? displayScore : 0} status={data.status} />
          
          <div className="flex flex-col items-center gap-1.5 w-full text-center">
            {/* Tag de Status de alta fidelidade */}
            <span className={cn("text-xs font-bold px-3 py-1 rounded-full border shadow-2xs tracking-wide w-full max-w-[130px]", colors.badgeBg)}>
              Status: {colors.label}
            </span>
            
            {evolution !== null && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md",
                evolution > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : evolution < 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-zinc-400"
              )}>
                {evolution > 0 ? <TrendingUp size={11} /> : evolution < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                {evolution > 0 ? `+${evolution}` : evolution} este mês
              </span>
            )}
          </div>
        </div>

        {/* Right Area: Listas de Critérios (Breakdowns) e Caixa de Insight AI */}
        <div className="flex-1 w-full space-y-5 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-4 lg:gap-1 bor">
            {breakdowns.map((b, i) => (
              <div
                key={b.key}
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(10px)",
                  transitionDelay: `${(i + 1) * 60}ms`,
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

          {/* AI Insight Box com Design de Alerta moderno */}
          {sparklines && (
            <div
              className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/80 transition-all duration-700 shadow-2xs"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transitionDelay: "320ms",
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