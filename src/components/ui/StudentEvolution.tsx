"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrimesterData {
  label: string
  generalAverage: number
}

interface StudentEvolutionProps {
  trimesters: TrimesterData[]
}

function barColor(score: number): string {
  if (score >= 14) return "bg-emerald-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

export default function StudentEvolution({ trimesters }: StudentEvolutionProps) {
  if (trimesters.length < 1) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Evolução Académica</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Sem dados para mostrar</p>
      </div>
    )
  }

  const sorted = [...trimesters]
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const diff = last.generalAverage - first.generalAverage
  const trend = diff > 0.5 ? "up" : diff < -0.5 ? "down" : "stable"

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const trendText = trend === "up" ? "Melhorou" : trend === "down" ? "Piorou" : "Manteve"
  const trendColor = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-rose-600" : "text-zinc-400"

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Evolução Académica</h3>
        <div className={cn("flex items-center gap-1 text-xs font-bold", trendColor)}>
          <TrendIcon size={14} />
          {trendText} {diff > 0 ? `+${diff.toFixed(1)}` : diff < 0 ? diff.toFixed(1) : ""}
        </div>
      </div>

      <div className="flex items-end gap-3 h-32">
        {sorted.map((t, i) => {
          const height = (t.generalAverage / 20) * 100
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className={cn("text-sm font-bold tabular-nums", barColor(t.generalAverage).replace("bg-", "text-"))}>
                {t.generalAverage}
              </span>
              <div
                className={cn("w-full rounded-t-lg transition-all duration-700", barColor(t.generalAverage))}
                style={{ height: `${height}%`, minHeight: "4px" }}
              />
              <span className="text-[10px] font-medium text-zinc-400 text-center">{t.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
