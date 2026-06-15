"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, Loader2, AlertCircle, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Comparison {
  label: string
  days: number
  change: number | null
  direction: "up" | "down"
}

interface BreakdownChanges {
  academicPerformance: number
  attendance: number
  schoolActivity: number
  administrativeEfficiency: number
}

interface TrendsData {
  comparisons: Comparison[]
  breakdownChanges: BreakdownChanges | null
}

const LABELS: Record<string, string> = {
  academicPerformance: "Desempenho",
  attendance: "Assiduidade",
  schoolActivity: "Actividade",
  administrativeEfficiency: "Administração",
}

export default function TrendsComparison() {
  const [data, setData] = useState<TrendsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/trends")
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
          <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tendências</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar tendências.</p>
      </div>
    )
  }

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
          <BarChart3 size={16} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tendências</h3>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {data.comparisons.map((c, i) => {
          const isUp = c.direction === "up"
          const isNeutral = c.change === null || c.change === 0
          return (
            <div
              key={i}
              className={cn(
                "p-3 rounded-xl border",
                isNeutral
                  ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  : isUp
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900"
                    : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900"
              )}
            >
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{c.label}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {isNeutral ? (
                  <Minus size={14} className="text-zinc-400" />
                ) : isUp ? (
                  <TrendingUp size={14} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-rose-600 dark:text-rose-400" />
                )}
                <span className={cn(
                  "text-sm font-bold",
                  isNeutral ? "text-zinc-500" : isUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {isNeutral ? "—" : `${c.change! > 0 ? "+" : ""}${c.change}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {data.breakdownChanges && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[10px] font-medium text-zinc-400 mb-2">Variação (30 dias):</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(data.breakdownChanges).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">{LABELS[key] || key}</span>
                <span className={cn(
                  "text-[11px] font-semibold",
                  value > 0 ? "text-emerald-600" : value < 0 ? "text-rose-600" : "text-zinc-400"
                )}>
                  {value > 0 ? "+" : ""}{value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
