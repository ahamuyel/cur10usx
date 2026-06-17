"use client"

import { useEffect, useState } from "react"
import { Users, Presentation, GraduationCap, CalendarCheck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type SchoolStats = {
  students: number
  teachers: number
  parents: number
  classes: number
  maleStudents: number
  femaleStudents: number
  averageGrade: number
  pendingAssignments: number
  todayLessons: number
  pendingApplications: number
  recentAnnouncements: number
}

const INDICATORS_CONFIG = [
  { 
    key: "aproveitamento" as const, 
    label: "Taxa de Aproveitamento", 
    icon: GraduationCap, 
    format: (v: number) => `${v}%`,
    theme: "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20 text-emerald-500 dark:text-emerald-400"
  },
  { 
    key: "assiduidade" as const, 
    label: "Assiduidade Global", 
    icon: Users, 
    format: (v: number) => `${v}%`,
    theme: "bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/20 text-blue-500 dark:text-blue-400"
  },
  { 
    key: "alunosEmRisco" as const, 
    label: "Alunos em Risco", 
    icon: AlertCircle, 
    format: (v: number) => v,
    theme: "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20 text-rose-500 dark:text-rose-400"
  },
  { 
    key: "turmasMonitorizacao" as const, 
    label: "Turmas sob Monitorização", 
    icon: Presentation, 
    format: (v: number) => v,
    theme: "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20 text-amber-500 dark:text-amber-400"
  },
]

export default function GeneralIndicators({ briefing }: { briefing?: any }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (briefing && !briefing.error && briefing.academic) {
      setStats({
        aproveitamento: briefing.academic.aproveitamento,
        assiduidade: briefing.academic.assiduidade,
        alunosEmRisco: briefing.risk?.totalAtRisk || 0,
        turmasMonitorizacao: briefing.classes?.totalUnderMonitoring || 0,
      })
      setLoading(false)
      requestAnimationFrame(() => setVisible(true))
      return
    }

    if (briefing?.error) {
      setError(true)
      setLoading(false)
      return
    }

    fetch("/api/school-stats")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        // Fallback or old data mapping if briefing not provided
        setStats(json)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [briefing])

  const gridLayoutClass = "grid grid-cols-1 @[240px]:grid-cols-2 @[580px]:grid-cols-4 gap-4 w-full"

  if (loading) {
    return (
      <div className="@container w-full">
        <div className={gridLayoutClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="h-[106px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-4 flex flex-col justify-between shadow-xs animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 w-full">
                <div className="h-2.5 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-5 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-4 flex items-center gap-2.5">
        <AlertCircle size={16} className="text-rose-500 shrink-0" />
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Não foi possível carregar as métricas rápidas.
        </p>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="@container w-full">
      <div className={gridLayoutClass}>
        {INDICATORS_CONFIG.map((ind, i) => {
          const value = stats[ind.key]
          return (
            <div
              key={ind.key}
              className={cn(
                "flex flex-col justify-between items-start p-4 rounded-2xl transition-all duration-300 border shadow-xs min-w-0 min-h-[102px]",
                "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700/60 hover:shadow-2xs"
              )}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(4px)",
                transitionDelay: `${i * 35}ms`,
              }}
            >
              {/* Icon Container mais equilibrado (36x36px) */}
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-3xs mb-2.5", ind.theme)}>
                <ind.icon size={16} strokeWidth={2.2} />
              </div>
              
              {/* Bloco de Textos Otimizado */}
              <div className="min-w-0 w-full space-y-0.5">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 leading-tight tracking-wider uppercase truncate">
                  {ind.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums truncate">
                    {ind.format(value)}
                  </p>
                  {ind.key === "aproveitamento" && briefing?.academic?.evolution !== undefined && (
                    <span className={cn(
                      "text-[10px] font-bold",
                      briefing.academic.evolution > 0 ? "text-emerald-500" : briefing.academic.evolution < 0 ? "text-rose-500" : "text-zinc-400"
                    )}>
                      {briefing.academic.evolution > 0 ? "+" : ""}{briefing.academic.evolution}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}