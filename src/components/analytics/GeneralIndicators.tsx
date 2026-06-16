"use client"

import { useEffect, useState } from "react"
import { Users, Presentation, GraduationCap, CalendarCheck } from "lucide-react"

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

const indicators = [
  { key: "students" as const, label: "Alunos", icon: Users, format: (v: number) => v },
  { key: "classes" as const, label: "Turmas", icon: Presentation, format: (v: number) => v },
  { key: "averageGrade" as const, label: "Média Geral", icon: GraduationCap, format: (v: number) => `${v}/20` },
  { key: "todayLessons" as const, label: "Aulas Hoje", icon: CalendarCheck, format: (v: number) => v },
]

export default function GeneralIndicators() {
  const [stats, setStats] = useState<SchoolStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/school-stats")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!stats || stats.students === undefined) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {indicators.map(ind => {
        const value = stats[ind.key]
        return (
          <div
            key={ind.key}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
              <ind.icon size={15} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-tight">{ind.label}</p>
              <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200 leading-tight tabular-nums">
                {ind.format(value)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
