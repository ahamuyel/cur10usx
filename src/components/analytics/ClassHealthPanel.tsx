"use client"

import { useEffect, useState } from "react"
import { Presentation, AlertCircle, CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClassHealth {
  classId: string
  className: string
  grade: number
  studentCount: number
  score: number
  status: string
  riskLevel: string
  motivoPrincipal: string
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
  Crítica: { label: "Crítico", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30", dot: "bg-rose-500" },
  Atenção: { label: "Atenção", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30", dot: "bg-amber-500" },
  Boa: { label: "Estável", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500" },
  Excelente: { label: "Excelente", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500" },
}

export default function ClassHealthPanel() {
  const [data, setData] = useState<ClassHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/class-health")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setData(json)
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
          <div className="h-4 w-44 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Turmas</h3>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Não foi possível carregar os dados.</p>
      </div>
    )
  }

  const filteredClasses = data.classes.filter(c => c.status === "Crítica" || c.status === "Atenção" || c.riskLevel === "Moderado")
  const displayClasses = isExpanded ? filteredClasses.slice(0, 10) : filteredClasses.slice(0, 3)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border",
              filteredClasses.length > 0 ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20" : "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20"
            )}>
              <Presentation size={15} className={filteredClasses.length > 0 ? "text-rose-500" : "text-emerald-500"} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Turmas sob Monitorização</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Intervenção pedagógica recomendada</p>
            </div>
          </div>
          {filteredClasses.length > 0 && (
            <span className="inline-flex items-center justify-center bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-md text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 tabular-nums">
              {filteredClasses.length}
            </span>
          )}
        </div>

        {/* Content */}
        {filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Todas as turmas estáveis</p>
          </div>
        ) : (
          <div className="space-y-2 transition-all duration-300">
            {displayClasses.map((c, i) => {
              const status = STATUS_MAP[c.status] || STATUS_MAP.Boa
              return (
                <div
                  key={c.classId}
                  className="flex flex-col gap-1 p-3 rounded-xl transition-all duration-300 group cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 border border-zinc-100/50 dark:border-zinc-800/20"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${i * 30}ms`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", status.dot)} />
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50">{c.className}</span>
                    </div>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border tracking-wide whitespace-nowrap", status.bg, status.color)}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium italic">
                      Motivo: {c.motivoPrincipal}
                    </p>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold tabular-nums">{c.score}% Aproveitamento</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {filteredClasses.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>Ver menos <ChevronUp size={14} /></>
          ) : (
            <>Ver mais ({filteredClasses.length - 3}) <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}