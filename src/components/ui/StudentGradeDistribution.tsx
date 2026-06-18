"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ScoreDistribution {
  excelente: number
  bom: number
  suficiente: number
  insuficiente: number
}

interface StudentGradeDistributionProps {
  distribution: ScoreDistribution
}

const categories = [
  { key: "excelente" as const, label: "Excelente (16-20)", color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400", bgLight: "bg-emerald-50 dark:bg-emerald-950/10" },
  { key: "bom" as const, label: "Bom (13-15)", color: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-400", bgLight: "bg-blue-50 dark:bg-blue-950/10" },
  { key: "suficiente" as const, label: "Suficiente (10-12)", color: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-400", bgLight: "bg-amber-50 dark:bg-amber-950/10" },
  { key: "insuficiente" as const, label: "Insuficiente (<10)", color: "bg-rose-500", textColor: "text-rose-700 dark:text-rose-400", bgLight: "bg-rose-50 dark:bg-rose-950/10" },
]

export default function StudentGradeDistribution({ distribution }: StudentGradeDistributionProps) {
  const total = distribution.excelente + distribution.bom + distribution.suficiente + distribution.insuficiente

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Distribuição das Notas</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Sem notas registadas</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Distribuição das Notas</h3>
      <div className="space-y-3">
        {categories.map((cat, i) => {
          const value = distribution[cat.key]
          const percent = Math.round((value / total) * 100)

          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span className={cn("text-xs font-medium w-32 shrink-0", cat.textColor)}>
                {cat.label}
              </span>
              <div className="flex-1 h-5 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                  className={cn("h-full rounded-lg", cat.color)}
                />
              </div>
              <span className={cn("text-xs font-bold tabular-nums w-12 text-right shrink-0", cat.textColor)}>
                {percent}%
              </span>
              <span className="text-[11px] text-zinc-400 tabular-nums w-8 text-right shrink-0">
                {value}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
