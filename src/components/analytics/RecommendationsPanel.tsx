"use client"

import { useEffect, useState } from "react"
import { ListChecks, AlertTriangle, AlertCircle, ArrowUpCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface Recommendation {
  priority: "urgent" | "high" | "medium" | "low"
  action: string
  reason: string
  category: "pedagogico" | "assiduidade" | "administrativo" | "geral"
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; dot: string; icon: React.ElementType; label: string }> = {
  urgent: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30", dot: "bg-rose-500", icon: AlertTriangle, label: "Urgente" },
  high: { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50/60 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30", dot: "bg-orange-500", icon: ArrowUpCircle, label: "Alta" },
  medium: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30", dot: "bg-amber-500", icon: AlertCircle, label: "Média" },
  low: { color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-700/30", dot: "bg-zinc-400 dark:bg-zinc-500", icon: AlertCircle, label: "Baixa" },
}

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Estado de expansão

  useEffect(() => {
    fetch("/api/analytics/recommendations")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setRecommendations(json.recommendations)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Recomendações</h3>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Não foi possível processar as recomendações.</p>
      </div>
    )
  }

  const displayRecs = isExpanded ? recommendations.slice(0, 10) : recommendations.slice(0, 3)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/20 flex items-center justify-center">
              <ListChecks size={15} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Ações Recomendadas</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Sugestões do ecossistema de análise</p>
            </div>
          </div>
          {recommendations.length > 0 && (
            <span className="inline-flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30 tabular-nums">
              {recommendations.length}
            </span>
          )}
        </div>

        {/* Content */}
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nenhuma recomendação pendente</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayRecs.map((rec, i) => {
              const config = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-2xl transition-all duration-300 bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/30 border border-zinc-100/50 dark:border-zinc-800/20"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${i * 30}ms`,
                  }}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-2xs", config.dot)} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-snug">{rec.action}</p>
                      <span className="text-[9px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/50 px-1.5 py-0.2 rounded border border-zinc-200/30 dark:border-zinc-700/30">
                        {rec.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium leading-relaxed">{rec.reason}</p>
                  </div>
                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 tracking-wide", config.bg, config.color)}>
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {recommendations.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>Ver menos <ChevronUp size={14} /></>
          ) : (
            <>Ver mais ({recommendations.length - 3}) <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}