"use client"

import { useEffect, useState } from "react"
import { ListChecks, AlertTriangle, ArrowUpCircle, Circle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recommendation {
  priority: "urgent" | "high" | "medium" | "low"
  action: string
  reason: string
  category: "pedagogico" | "assiduidade" | "administrativo" | "geral"
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  urgent: {
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900",
    icon: AlertTriangle,
    label: "Urgente",
  },
  high: {
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
    icon: ArrowUpCircle,
    label: "Alta",
  },
  medium: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
    icon: Circle,
    label: "Média",
  },
  low: {
    color: "text-zinc-400",
    bg: "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
    icon: Circle,
    label: "Baixa",
  },
}

const CATEGORY_LABELS: Record<string, string> = {
  pedagogico: "Pedagógico",
  assiduidade: "Assiduidade",
  administrativo: "Administrativo",
  geral: "Geral",
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
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-44 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
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
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recomendações</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível gerar recomendações.</p>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
            <ListChecks size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recomendações</h3>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Nenhuma recomendação pendente. A escola está num bom estado.
        </p>
      </div>
    )
  }

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
          <ListChecks size={16} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Recomendações</h3>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, i) => {
          const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low
          const Icon = config.icon
          return (
            <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl border", config.bg)}>
              <div className="mt-0.5">
                <Icon size={14} className={config.color} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{rec.action}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0", config.bg.slice(0, -6), config.color)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{rec.reason}</p>
                <span className="text-[10px] text-zinc-400 font-medium">
                  {CATEGORY_LABELS[rec.category] || rec.category}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
