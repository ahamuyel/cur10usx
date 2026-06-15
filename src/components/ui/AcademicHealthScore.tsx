"use client"

import { useEffect, useState } from "react"
import { AlertCircle, HeartPulse } from "lucide-react"
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

const STATUS_COLORS: Record<string, { ring: string; text: string; bar: string; bg: string }> = {
  Excelente: { ring: "#10B981", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  Boa: { ring: "#06B6D4", text: "text-cyan-600 dark:text-cyan-400", bar: "bg-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  Atenção: { ring: "#F59E0B", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  Crítica: { ring: "#F43F5E", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
}

const BREAKDOWN_LABELS: Record<keyof Breakdown, string> = {
  academicPerformance: "Desempenho Académico",
  attendance: "Assiduidade",
  schoolActivity: "Actividade Escolar",
  administrativeEfficiency: "Eficiência Administrativa",
}

function ScoreRing({ score, status }: { score: number; status: string }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Crítica
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-zinc-100 dark:text-zinc-800"
        />
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={colors.ring}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {score}
        </span>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
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
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </span>
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/academic-health")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setData(json)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center">
            <AlertCircle size={16} className="text-rose-500" />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Academic Health Score
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          Não foi possível calcular o score de saúde académica.
        </p>
      </div>
    )
  }

  if (!data) return null

  const colors = STATUS_COLORS[data.status] || STATUS_COLORS.Crítica
  const breakdowns: { key: keyof Breakdown; value: number }[] = [
    { key: "academicPerformance", value: data.breakdown.academicPerformance },
    { key: "attendance", value: data.breakdown.attendance },
    { key: "schoolActivity", value: data.breakdown.schoolActivity },
    { key: "administrativeEfficiency", value: data.breakdown.administrativeEfficiency },
  ]

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", colors.bg)}>
          <HeartPulse size={16} className={colors.text} />
        </div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Academic Health Score
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <ScoreRing score={data.score} status={data.status} />

        <div className="flex-1 w-full space-y-3 min-w-0">
          <div className="text-center sm:text-left">
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg", colors.bg, colors.text)}>
              Saúde Académica {data.status}
            </span>
          </div>

          <div className="space-y-2.5">
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
