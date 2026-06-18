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
      <div className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xs rounded-2xl border border-zinc-100 dark:border-zinc-800/40 p-6 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Nenhum registo de avaliações disponível para análise.
        </p>
      </div>
    )
  }

  const sorted = [...subjects].sort((a, b) => b.average - a.average)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.03 }}
            whileHover={{ y: -1 }}
            className="group bg-white/30 dark:bg-zinc-900/15 backdrop-blur-md rounded-2xl border border-zinc-100/80 dark:border-zinc-800/40 p-4 flex flex-col gap-3 transition-all duration-300 hover:border-zinc-200/80 dark:hover:border-zinc-700/50 hover:bg-white/50 dark:hover:bg-zinc-900/25"
          >
            {/* HEADER METÁLICO MINIMALISTA */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Indicador de Estado em Micro-Dot */}
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  isGood ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : isWarning ? "bg-amber-500 shadow-[0_0_6px_#f59e0b]" : "bg-rose-500 shadow-[0_0_6px_#f43f5e]"
                )} />
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-200 truncate">
                  {s.subjectName}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tabular-nums">
                {s.count} avaliações
              </span>
            </div>

            {/* ÁREA NUMÉRICA LIMPA */}
            <div className="flex items-baseline gap-0.5">
              <span className={cn(
                "text-2xl font-black tracking-tight tabular-nums",
                isGood ? "text-zinc-800 dark:text-zinc-100" 
                  : isWarning ? "text-amber-600 dark:text-amber-400" 
                  : "text-rose-600 dark:text-rose-400"
              )}>
                {s.average.toFixed(1)}
              </span>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600">/20</span>
            </div>

            {/* BARRA DE PROGRESSO ULTRA-SLIM */}
            <div className="h-0.5 w-full bg-zinc-100 dark:bg-zinc-800/60 rounded-full overflow-hidden mt-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isGood ? "bg-emerald-500" : isWarning ? "bg-amber-500" : "bg-rose-500"
                )}
              />
            </div>

            {/* SUB-INFO METRICA (MÁXIMA DISCREÇÃO) */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/30 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              <div className="flex items-center gap-1">
                <span>Última:</span>
                <span className="font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">
                  {lastScore.toFixed(0)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <TrendIcon size={12} className={cn(
                  diff > 0.5 ? "text-emerald-500" : diff < -0.5 ? "text-rose-500" : "text-zinc-400"
                )} />
                <span className={cn(
                  "font-semibold tracking-tight",
                  diff > 0.5 ? "text-emerald-600 dark:text-emerald-400" 
                    : diff < -0.5 ? "text-rose-600 dark:text-rose-400" 
                    : "text-zinc-400 dark:text-zinc-500"
                )}>
                  {diff > 0.5 ? "Subiu" : diff < -0.5 ? "Desceu" : "Estável"}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}