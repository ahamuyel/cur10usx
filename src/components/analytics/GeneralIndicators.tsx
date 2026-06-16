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
    key: "students" as const, 
    label: "Alunos", 
    icon: Users, 
    format: (v: number) => v,
    theme: "bg-blue-50/50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/20 text-blue-500 dark:text-blue-400"
  },
  { 
    key: "classes" as const, 
    label: "Turmas", 
    icon: Presentation, 
    format: (v: number) => v,
    theme: "bg-purple-50/50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/20 text-purple-500 dark:text-purple-400"
  },
  { 
    key: "averageGrade" as const, 
    label: "Média Geral", 
    icon: GraduationCap, 
    format: (v: number) => `${v}/20`,
    theme: "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20 text-emerald-500 dark:text-emerald-400"
  },
  { 
    key: "todayLessons" as const, 
    label: "Aulas Hoje", 
    icon: CalendarCheck, 
    format: (v: number) => v,
    theme: "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20 text-amber-500 dark:text-amber-400"
  },
]

export default function GeneralIndicators() {
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch("/api/school-stats")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        setStats(json)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  // Grid responsivo baseado em Container Queries (escala perfeitamente em qualquer layout)
  const gridLayoutClass = "grid grid-cols-1 @[240px]:grid-cols-2 @[580px]:grid-cols-4 gap-3 w-full"

  if (loading) {
    return (
      <div className="@container w-full">
        <div className={gridLayoutClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-3 flex items-center gap-3 shadow-3xs animate-pulse"
            >
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3 w-12 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-4 flex items-center gap-2.5">
        <AlertCircle size={16} className="text-rose-500 shrink-0" />
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Não foi possível carregar as métricas rápidas.
        </p>
      </div>
    )
  }

  if (!stats || stats.students === undefined) return null

  return (
    <div className="@container w-full">
      <div className={gridLayoutClass}>
        {INDICATORS_CONFIG.map((ind, i) => {
          const value = stats[ind.key]
          return (
            <div
              key={ind.key}
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-300 border shadow-3xs min-w-0",
                "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/80 hover:border-zinc-200 dark:hover:border-zinc-700/60",
                "focus-within:ring-2 focus-within:ring-indigo-500/20"
              )}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(4px)",
                transitionDelay: `${i * 30}ms`,
              }}
            >
              {/* Icon Container com tamanho calibrado para não quebrar em micro-ecrãs */}
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs", ind.theme)}>
                <ind.icon size={15} strokeWidth={2.2} />
              </div>
              
              {/* Textos com proteção robusta contra quebras de linha e truncagem limpa */}
              <div className="min-w-0 flex-1">
                <p className="text-[10px] @[280px]:text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 leading-tight tracking-tight truncate uppercase">
                  {ind.label}
                </p>
                <p className="text-sm @[280px]:text-base font-bold text-zinc-800 dark:text-zinc-50 leading-tight tabular-nums mt-0.5 truncate">
                  {ind.format(value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}