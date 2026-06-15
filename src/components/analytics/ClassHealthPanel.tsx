"use client"

import { useEffect, useState } from "react"
import { Presentation, AlertTriangle, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassHealth {
  classId: string
  className: string
  grade: number
  studentCount: number
  score: number
  status: string
  riskLevel: string
  breakdown: {
    academicPerformance: number
    attendance: number
    schoolActivity: number
  }
}

interface ClassHealthData {
  classes: ClassHealth[]
  criticalCount: number
  atRiskCount: number
}

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Excelente: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
  Boa: { color: "text-cyan-600 dark:text-cyan-400", bg: "bg-cyan-50 dark:bg-cyan-950/30" },
  Atenção: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
  Crítica: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30" },
  "Sem dados": { color: "text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800" },
}

export default function ClassHealthPanel() {
  const [data, setData] = useState<ClassHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/class-health")
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
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
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
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Turmas</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar dados das turmas.</p>
      </div>
    )
  }

  const criticalClasses = data.classes.filter(c => c.score < 60)

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            data.criticalCount > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <Presentation size={16} className={data.criticalCount > 0 ? "text-rose-500" : "text-emerald-500"} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Saúde das Turmas</h3>
            {data.atRiskCount > 0 && (
              <p className="text-[10px] text-zinc-400">{data.atRiskCount} turma(s) com risco elevado ou crítico</p>
            )}
          </div>
        </div>
        {data.criticalCount > 0 && (
          <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{data.criticalCount}</span>
        )}
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {data.classes.slice(0, expanded ? undefined : 5).map(c => {
          const style = STATUS_STYLE[c.status] || STATUS_STYLE["Sem dados"]
          const barColor = c.score >= 75 ? "bg-emerald-500" : c.score >= 60 ? "bg-amber-500" : "bg-rose-500"
          return (
            <div key={c.classId} className="flex items-center gap-3 py-1.5">
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-24 truncate shrink-0">
                {c.className}
              </span>
              <div className="flex-1 h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor)}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <span className={cn("text-[11px] font-semibold w-12 text-right", style.color)}>
                {c.score > 0 ? c.score : "—"}
              </span>
            </div>
          )
        })}
      </div>

      {data.classes.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center w-full mt-2 py-1.5 text-[11px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
        >
          {expanded ? "Mostrar menos" : `Mostrar todas (${data.classes.length})`}
          {expanded ? <ChevronUp size={12} className="ml-1" /> : <ChevronDown size={12} className="ml-1" />}
        </button>
      )}

      {criticalClasses.length > 0 && (
        <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900">
          <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300">
            <AlertTriangle size={12} className="inline mr-1" />
            {criticalClasses.slice(0, 3).map(c => `${c.className} (${c.score})`).join(", ")}
            {criticalClasses.length > 3 && ` +${criticalClasses.length - 3} turma(s)`} — necessitam de intervenção.
          </p>
        </div>
      )}
    </div>
  )
}
