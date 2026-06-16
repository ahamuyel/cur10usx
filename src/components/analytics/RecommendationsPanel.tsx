"use client"

import { useEffect, useState } from "react"
import { ListChecks, AlertTriangle, AlertCircle, ArrowUpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recommendation {
  priority: "urgent" | "high" | "medium" | "low"
  action: string
  reason: string
  category: "pedagogico" | "assiduidade" | "administrativo" | "geral"
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; dot: string; icon: React.ElementType; label: string }> = {
  urgent: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    dot: "bg-rose-500",
    icon: AlertTriangle,
    label: "Urgente",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    dot: "bg-orange-500",
    icon: ArrowUpCircle,
    label: "Alta",
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    dot: "bg-amber-500",
    icon: AlertCircle,
    label: "Média",
  },
  low: {
    color: "text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-950",
    dot: "bg-zinc-300 dark:bg-zinc-600",
    icon: AlertCircle,
    label: "Baixa",
  },
}

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/recommendations")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setRecommendations(json.recommendations)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recomendações</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível gerar recomendações.</p>
      </div>
    )
  }

  const topRecs = recommendations.slice(0, 4)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
          <ListChecks size={15} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recomendações
        </h3>
      </div>

      {topRecs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <p className="text-xs font-medium text-zinc-500">Nenhuma recomendação pendente</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">A escola está num bom estado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topRecs.map((rec, i) => {
            const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low
            const Icon = config.icon
            return (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50"
              >
                <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", config.dot)} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                    {rec.action}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{rec.reason}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
