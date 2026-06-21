"use client"

import { BarChart3, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ScoreDistribution {
  excelente: number
  bom: number
  suficiente: number
  insuficiente: number
}

interface StudentInsightsProps {
  scoreDistribution: ScoreDistribution
  totalResults: number
  subjectAverages: { subjectId: string; subjectName: string; average: number; count: number }[]
}

export default function StudentInsights({
  scoreDistribution,
  totalResults,
  subjectAverages,
}: StudentInsightsProps) {
  const cats = [
    { label: "Excelente (16-20)", val: scoreDistribution.excelente, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Bom (13-15)", val: scoreDistribution.bom, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
    { label: "Suficiente (10-12)", val: scoreDistribution.suficiente, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
    { label: "Insuficiente (<10)", val: scoreDistribution.insuficiente, color: "bg-rose-500", textColor: "text-rose-600 dark:text-rose-400" },
  ]

  const aboveThreshold = subjectAverages.filter((s) => s.average >= 10).length
  const belowThreshold = subjectAverages.filter((s) => s.average < 10).length
  const consistency = totalResults > 0
    ? Math.round((aboveThreshold / subjectAverages.length) * 100)
    : 0

  const total = Object.values(scoreDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50">
          <Layers size={14} className="text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Insights Académicos</h3>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            Métricas analíticas e distribuição de notas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <BarChart3 size={12} /> Distribuição de Notas
          </h4>
          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", c.color)} />
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex-1">{c.label}</span>
                <div className="w-full max-w-[100px] h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", c.color)}
                    style={{ width: `${total > 0 ? (c.val / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums w-6 text-right text-zinc-700 dark:text-zinc-300">
                  {c.val}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
            {total} avaliaç{total === 1 ? "ão" : "ões"} registada{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <Layers size={12} /> Métricas de Consistência
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Disciplinas acima de 10</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {aboveThreshold}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Disciplinas abaixo de 10</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                {belowThreshold}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Consistência</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${consistency}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                  {consistency}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
