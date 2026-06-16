"use client"

import { useEffect, useState } from "react"
import { Presentation, AlertCircle } from "lucide-react"
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

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Crítica: { label: "Crítico", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/20", dot: "bg-rose-500" },
  Atenção: { label: "Atenção", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/20", dot: "bg-amber-500" },
  Boa: { label: "Estável", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20", dot: "bg-emerald-500" },
  Excelente: { label: "Excelente", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20", dot: "bg-emerald-500" },
}

export default function ClassHealthPanel() {
  const [data, setData] = useState<ClassHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

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
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Turmas</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar dados.</p>
      </div>
    )
  }

  const relevantClasses = data.classes
    .filter(c => c.status === "Crítica" || c.status === "Atenção")
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-7 h-7 rounded-xl flex items-center justify-center",
            relevantClasses.length > 0 ? "bg-rose-50 dark:bg-rose-950/20" : "bg-emerald-50 dark:bg-emerald-950/20"
          )}>
            <Presentation size={15} className={relevantClasses.length > 0 ? "text-rose-500" : "text-emerald-500"} />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Turmas que Precisam Atenção
          </h3>
        </div>
        {relevantClasses.length > 0 && (
          <span className="text-lg font-bold text-rose-500">{relevantClasses.length}</span>
        )}
      </div>

      {relevantClasses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <p className="text-xs font-medium text-zinc-500">Todas as turmas estáveis</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {relevantClasses.map(c => {
            const status = STATUS_MAP[c.status] || STATUS_MAP.Boa
            return (
              <div
                key={c.classId}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className={cn("w-2 h-2 rounded-full", status.dot)} />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{c.className}</span>
                  <span className="text-xs text-zinc-400">— Média {c.score}</span>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-md", status.bg, status.color)}>
                  {status.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
