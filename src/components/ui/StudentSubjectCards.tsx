"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectData {
  subjectId: string
  subjectName: string
  average: number
  count: number
}

interface SubjectLastScores {
  [subjectId: string]: {
    score: number
    type: string
    date: string
  }
}

interface StudentSubjectCardsProps {
  subjects: SubjectData[]
  subjectLastScores: SubjectLastScores
}

const GOOD_THRESHOLD = 14
const WARNING_THRESHOLD = 10

export default function StudentSubjectCards({ subjects, subjectLastScores }: StudentSubjectCardsProps) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Desempenho por Disciplina</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Sem dados de notas disponíveis</p>
      </div>
    )
  }

  const sorted = [...subjects].sort((a, b) => b.average - a.average)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Desempenho por Disciplina</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {sorted.map((s, i) => {
          const last = subjectLastScores[s.subjectId]
          const lastScore = last?.score ?? s.average
          const diff = s.average - lastScore
          const percent = (s.average / 20) * 100

          const isGood = s.average >= GOOD_THRESHOLD
          const isWarning = s.average >= WARNING_THRESHOLD && s.average < GOOD_THRESHOLD

          const TrendIcon = diff > 0.5 ? TrendingUp : diff < -0.5 ? TrendingDown : Minus

          return (
            <motion.div
              key={s.subjectId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "rounded-2xl border p-4 flex flex-col gap-3 transition-all hover:shadow-md",
                isGood
                  ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/30"
                  : isWarning
                  ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30"
                  : "bg-rose-50/50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/30"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{s.subjectName}</span>
                <span className={cn(
                  "text-[11px] font-bold px-2 py-0.5 rounded-lg",
                  isGood ? "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30"
                    : isWarning ? "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30"
                    : "text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/30"
                )}>
                  {isGood ? "Bom" : isWarning ? "Atenção" : "Crítico"}
                </span>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span className={cn(
                    "text-2xl font-black tabular-nums",
                    isGood ? "text-emerald-700 dark:text-emerald-400"
                      : isWarning ? "text-amber-700 dark:text-amber-400"
                      : "text-rose-700 dark:text-rose-400"
                  )}>
                    {s.average.toFixed(1)}
                  </span>
                  <span className="text-xs text-zinc-400 ml-1">/ 20</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between">
                <div className="flex-1 w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[11px] font-bold tabular-nums shrink-0",
                  isGood ? "text-emerald-600 dark:text-emerald-400"
                    : isWarning ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                )}>
                  {Math.round(percent)}%
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-zinc-400">Última nota:</span>
                  <span className={cn(
                    "text-sm font-bold tabular-nums",
                    lastScore >= 16 ? "text-emerald-600" : lastScore >= 10 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {lastScore}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendIcon size={14} className={cn(
                    diff > 0.5 ? "text-emerald-500" : diff < -0.5 ? "text-rose-500" : "text-zinc-400"
                  )} />
                  <span className={cn(
                    "text-[11px] font-semibold",
                    diff > 0.5 ? "text-emerald-600 dark:text-emerald-400" : diff < -0.5 ? "text-rose-600 dark:text-rose-400" : "text-zinc-400"
                  )}>
                    {diff > 0.5 ? "Melhorou" : diff < -0.5 ? "Piorou" : "Estável"}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
