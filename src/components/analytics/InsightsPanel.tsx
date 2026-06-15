"use client"

import { useEffect, useState } from "react"
import { Lightbulb, TrendingUp, TrendingDown, Check, AlertTriangle, Info, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Insight {
  type: "positive" | "warning" | "critical"
  icon: string
  title: string
  message: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  check: Check,
  alert: AlertTriangle,
  info: Info,
}

const STYLE_MAP: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
  positive: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    text: "text-emerald-700 dark:text-emerald-300",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-900",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    iconBg: "bg-amber-100 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-900",
  },
  critical: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    text: "text-rose-700 dark:text-rose-300",
    iconBg: "bg-rose-100 dark:bg-rose-950/40",
    border: "border-rose-200 dark:border-rose-900",
  },
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/insights")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setInsights(json.insights)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-32 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Insights</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível gerar insights.</p>
      </div>
    )
  }

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Insights</h3>
      </div>

      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const Icon = ICON_MAP[insight.icon] || Info
          const style = STYLE_MAP[insight.type] || STYLE_MAP.warning
          return (
            <div
              key={i}
              className={cn("flex items-start gap-3 p-3 rounded-xl border", style.bg, style.border)}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", style.iconBg)}>
                <Icon size={14} className={style.text} />
              </div>
              <div className="min-w-0">
                <p className={cn("text-xs font-semibold", style.text)}>{insight.title}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
