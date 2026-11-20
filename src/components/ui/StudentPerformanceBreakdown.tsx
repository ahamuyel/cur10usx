"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectAverage {
  subjectId: string
  subjectName: string
  average: number
  count: number
}

interface SubjectTrend {
  currentAverage: number
  previousAverage: number
  trend: number
}

interface StudentPerformanceBreakdownProps {
  subjectAverages: SubjectAverage[]
  subjectTrends: Record<string, SubjectTrend>
  generalAverage: number
  previousAverage: number
}

const SIGNIFICANT_THRESHOLD = 1.0

function scoreColor(score: number): string {
  if (score >= 16) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 13) return "text-blue-600 dark:text-blue-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

export default function StudentPerformanceBreakdown({
  subjectAverages, subjectTrends, generalAverage, previousAverage,
}: StudentPerformanceBreakdownProps) {

  const performanceData = useMemo(() => {
    const changes = subjectAverages.map((s) => {
      const trend = subjectTrends[s.subjectName]
      const diff = trend?.trend ?? 0
      const prevAvg = trend?.previousAverage ?? s.average
      return { ...s, diff, prevAvg }
    })

    return {
      declined: changes.filter((c) => c.diff < -SIGNIFICANT_THRESHOLD).sort((a, b) => a.diff - b.diff),
      improved: changes.filter((c) => c.diff > SIGNIFICANT_THRESHOLD).sort((a, b) => b.diff - a.diff),
      stableCount: changes.filter((c) => Math.abs(c.diff) <= SIGNIFICANT_THRESHOLD).length,
      totalChanges: changes.length,
    }
  }, [subjectAverages, subjectTrends])

  const overallDiff = Math.round((generalAverage - previousAverage) * 10) / 10
  const { declined, improved, stableCount, totalChanges } = performanceData

  if (totalChanges === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 h-full flex items-center justify-center min-h-[220px]">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 italic">
          Sem dados de disciplina para analisar neste ciclo.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 shadow-2xs h-full flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Desempenho Recente
            </h3>
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Comparação entre trimestres
            </p>
          </div>

          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 tabular-nums tracking-wide",
            overallDiff > SIGNIFICANT_THRESHOLD ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : overallDiff < -SIGNIFICANT_THRESHOLD ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
              : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60"
          )}>
            {overallDiff > SIGNIFICANT_THRESHOLD ? <TrendingUp size={12} /> : overallDiff < -SIGNIFICANT_THRESHOLD ? <TrendingDown size={12} /> : <Minus size={12} />}
            {overallDiff > 0 ? "+" : ""}{overallDiff.toFixed(1)} global
          </span>
        </div>

        <div className="space-y-4">

          {declined.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pl-0.5">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                  {declined.length === 1 ? "Queda de rendimento" : `Queda em ${declined.length} disciplinas`}
                </p>
              </div>
              <div className="space-y-1.5">
                {declined.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={s.subjectId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 group hover:bg-rose-50/20 dark:hover:bg-rose-950/5 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {s.subjectName}
                      </span>
                      {s.average < generalAverage && (
                        <span className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          abaixo da média
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums block leading-tight">
                          {s.prevAvg.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">anterior</span>
                      </div>
                      <ArrowDownRight size={12} className="text-rose-400 shrink-0" />
                      <div className="text-right">
                        <span className={cn("text-xs font-bold tabular-nums block leading-tight", scoreColor(s.average))}>
                          {s.average.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">atual</span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md tabular-nums min-w-[32px] text-center">
                        {s.diff.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {improved.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pl-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  {improved.length === 1 ? "Melhoria de rendimento" : `Melhoria em ${improved.length} disciplinas`}
                </p>
              </div>
              <div className="space-y-1.5">
                {improved.slice(0, 3).map((s, i) => (
                  <motion.div
                    key={s.subjectId}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 group hover:bg-emerald-50/20 dark:hover:bg-emerald-950/5 transition-all duration-150"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {s.subjectName}
                      </span>
                      {s.average >= generalAverage && (
                        <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          acima da média
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums block leading-tight">
                          {s.prevAvg.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">anterior</span>
                      </div>
                      <ArrowUpRight size={12} className="text-emerald-400 shrink-0" />
                      <div className="text-right">
                        <span className={cn("text-xs font-bold tabular-nums block leading-tight", scoreColor(s.average))}>
                          {s.average.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-zinc-400 dark:text-zinc-500">atual</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md tabular-nums min-w-[32px] text-center">
                        +{s.diff.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {declined.length === 0 && improved.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
              <Minus size={16} className="text-zinc-300 dark:text-zinc-700 mb-1" />
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Rendimento estável — sem alterações significativas entre trimestres.
              </span>
            </div>
          )}
        </div>
      </div>

      {stableCount > 0 && (declined.length > 0 || improved.length > 0) && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/40 text-center">
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            {stableCount} {stableCount === 1 ? "disciplina mantém-se" : "disciplinas mantêm-se"} dentro da margem de estabilidade.
          </p>
        </div>
      )}
    </div>
  )
}
