"use client"

import { cn } from "@/lib/utils"

interface SubjectData {
  subjectName: string
  average: number
  count: number
}

interface StudentSubjectPerformanceProps {
  subjects: SubjectData[]
}

function barColor(score: number): string {
  if (score >= 14) return "bg-emerald-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

function textColor(score: number): string {
  if (score >= 14) return "text-emerald-700 dark:text-emerald-400"
  if (score >= 10) return "text-amber-700 dark:text-amber-400"
  return "text-rose-700 dark:text-rose-400"
}

export default function StudentSubjectPerformance({ subjects }: StudentSubjectPerformanceProps) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Desempenho por Disciplina</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Sem dados de notas disponíveis</p>
      </div>
    )
  }

  const sorted = [...subjects].sort((a, b) => b.average - a.average)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Desempenho por Disciplina</h3>
        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Melhor: {best.subjectName}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Crítica: {worst.subjectName}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {sorted.map((s) => {
          const percent = (s.average / 20) * 100
          return (
            <div key={s.subjectName} className="flex items-center gap-3">
              <span className="w-24 sm:w-28 text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate shrink-0">
                {s.subjectName}
              </span>
              <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColor(s.average))}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className={cn("text-xs font-bold tabular-nums w-7 text-right shrink-0", textColor(s.average))}>
                {s.average}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
