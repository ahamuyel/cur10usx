"use client"

import { motion } from "framer-motion"
import { Trophy, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentPointProgressProps {
  average: number
  classRank?: number | null
  classSize?: number | null
}

function scoreRingColor(score: number): string {
  if (score >= 16) return "stroke-emerald-500"
  if (score >= 13) return "stroke-blue-500"
  if (score >= 10) return "stroke-amber-500"
  return "stroke-rose-500"
}

function scoreTextColor(score: number): string {
  if (score >= 16) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 13) return "text-blue-600 dark:text-blue-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

function scoreLabel(score: number): string {
  if (score >= 16) return "Excelente"
  if (score >= 13) return "Bom"
  if (score >= 10) return "Suficiente"
  return "Insuficiente"
}

export default function StudentPointProgress({ average, classRank, classSize }: StudentPointProgressProps) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(average / 20, 1)
  const offset = circumference - percent * circumference
  const hasClassData = classRank != null && classSize != null && classSize > 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <Trophy size={15} className="text-zinc-600 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Progresso da Média</h3>
          <p className="text-[11px] text-zinc-400">Visão geral do rendimento</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <svg width="140" height="140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-100 dark:text-zinc-800"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={scoreRingColor(average)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className={cn("text-2xl font-black tabular-nums", scoreTextColor(average))}
            >
              {average.toFixed(1)}
            </motion.span>
            <span className="text-[10px] font-semibold text-zinc-400 mt-0.5">/ 20</span>
          </div>
        </div>

        <div className="text-center">
          <span className={cn("text-xs font-bold", scoreTextColor(average))}>
            {scoreLabel(average)}
          </span>
        </div>

        {hasClassData && (
          <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="text-violet-500" />
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Posição na Turma
              </span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className={cn("text-xl font-black", classRank! <= Math.ceil(classSize! / 3)
                ? "text-emerald-600 dark:text-emerald-400"
                : classRank! <= Math.ceil((classSize! * 2) / 3)
                ? "text-amber-600 dark:text-amber-400"
                : "text-rose-600 dark:text-rose-400"
              )}>
                {classRank}º
              </span>
              <span className="text-sm font-medium text-zinc-400 mb-0.5">
                de {classSize}
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5 mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((classSize! - classRank!) / classSize!) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className={cn(
                  "h-full rounded-full",
                  classRank! <= Math.ceil(classSize! / 3)
                    ? "bg-emerald-500"
                    : classRank! <= Math.ceil((classSize! * 2) / 3)
                    ? "bg-amber-500"
                    : "bg-rose-500"
                )}
              />
            </div>
          </div>
        )}

        {!hasClassData && (
          <div className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 text-center">Sem dados de turma</p>
          </div>
        )}
      </div>
    </div>
  )
}
