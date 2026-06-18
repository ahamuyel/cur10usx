"use client"

import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Result {
  id: string
  subjectName: string
  score: number
  type: string
  date: string
  trimester: string | null
}

interface StudentActivityChartProps {
  results: Result[]
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay()
}

function barColor(count: number, maxCount: number): string {
  if (maxCount === 0) return "bg-zinc-100 dark:bg-zinc-800"
  const ratio = count / maxCount
  if (ratio >= 0.75) return "bg-violet-500"
  if (ratio >= 0.5) return "bg-violet-400"
  if (ratio >= 0.25) return "bg-violet-300"
  return count > 0 ? "bg-violet-200" : "bg-zinc-100 dark:bg-zinc-800"
}

export default function StudentActivityChart({ results }: StudentActivityChartProps) {
  const dayCount = Array(7).fill(0)
  for (const r of results) {
    dayCount[getDayOfWeek(r.date)]++
  }

  const maxCount = Math.max(...dayCount, 1)

  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm h-full">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Actividade Avaliativa</h3>
        <p className="text-sm text-zinc-400 text-center py-8">Sem resultados registados</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <BarChart3 size={15} className="text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Actividade Avaliativa</h3>
          <p className="text-[11px] text-zinc-400">Distribuição por dia da semana</p>
        </div>
      </div>

      <div className="flex items-end gap-2 sm:gap-3 h-40">
        {dayLabels.map((label, i) => {
          const count = dayCount[i]
          const barHeight = (count / maxCount) * 100
          const today = new Date().getDay()
          const isToday = i === today

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tabular-nums"
              >
                {count}
              </motion.span>
              <div className="flex-1 w-full flex items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(barHeight, count > 0 ? 8 : 4)}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                  className={cn(
                    "w-full max-w-[32px] rounded-lg transition-colors",
                    barColor(count, maxCount)
                  )}
                  style={{ minHeight: count > 0 ? "8px" : "4px" }}
                />
              </div>
              <span className={cn(
                "text-[10px] font-semibold",
                isToday ? "text-violet-600 dark:text-violet-400" : "text-zinc-400"
              )}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
