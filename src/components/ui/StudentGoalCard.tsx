"use client"

import { Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentGoalCardProps {
  average: number
  goal?: number
}

export default function StudentGoalCard({ average, goal = 14 }: StudentGoalCardProps) {
  const percent = Math.min((average / goal) * 100, 100)
  const reached = average >= goal
  const remaining = Math.max(0, goal - average)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
          <Target size={15} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Meta Académica</h3>
          <p className="text-[10px] text-zinc-400">{reached ? "Meta alcançada 🎉" : "Acompanhe o seu progresso"}</p>
        </div>
      </div>

      <div className="flex items-end justify-between mb-3">
        <div>
          <span className="text-[11px] text-zinc-500 font-medium">Actual</span>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-3xl font-black tabular-nums", reached ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-50")}>
              {average.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-400">/20</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-zinc-500 font-medium">Meta</span>
          <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300">{goal}/20</div>
        </div>
      </div>

      <div className="relative h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            reached ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-amber-500 to-amber-400"
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <TrendingUp size={14} className={cn(reached ? "text-emerald-500" : "text-amber-500")} />
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          {reached
            ? `Parabéns! Superaste a tua meta em ${(average - goal).toFixed(1)} valores 🎯`
            : `Faltam ${remaining.toFixed(1)} valores para atingir a tua meta.`
          }
        </p>
      </div>
    </div>
  )
}
