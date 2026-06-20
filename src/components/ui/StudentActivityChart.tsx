"use client"

import { motion } from "framer-motion"
import { BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Result {
  id: string
  date: string
}

interface StudentActivityChartProps {
  results: Result[]
}

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay()
}

export default function StudentActivityChart({ results }: StudentActivityChartProps) {
  const dayCount = Array(7).fill(0)
  results.forEach(r => dayCount[getDayOfWeek(r.date)]++)
  
  const maxCount = Math.max(...dayCount, 1)

  return (
    <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 p-6 shadow-xl shadow-zinc-200/20 dark:shadow-none h-full transition-all">
      {/* Header com estilo mais limpo */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <BarChart3 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Actividade Avaliativa</h3>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Distribuição semanal</p>
          </div>
        </div>
      </div>

      <div className="flex items-end gap-3 h-40">
        {dayLabels.map((label, i) => {
          const count = dayCount[i]
          const barHeight = (count / maxCount) * 100
          const isToday = i === new Date().getDay()

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
              <span className={cn(
                "text-[10px] font-black tabular-nums transition-opacity",
                count > 0 ? "opacity-100 text-zinc-900 dark:text-white" : "opacity-0"
              )}>
                {count}
              </span>
              
              <div className="flex-1 w-full flex items-end justify-center relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(barHeight, count > 0 ? 8 : 4)}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "w-full max-w-[28px] rounded-t-lg transition-all duration-300",
                    isToday ? "bg-violet-600 shadow-[0_0_15px_rgba(124,58,237,0.4)]" : "bg-violet-400/30 group-hover:bg-violet-400/60"
                  )}
                />
              </div>
              
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
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