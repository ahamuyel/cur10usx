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

interface SubjectLastScore {
  score: number
  type: string
  date: string
}

interface StudentPerformanceBreakdownProps {
  subjectAverages: SubjectAverage[]
  subjectLastScores: Record<string, SubjectLastScore>
  generalAverage: number
  previousAverage: number
}

// Escala de cores semântica refinada para as notas (Padrão de Angola: 0 a 20)
function scoreColor(score: number): string {
  if (score >= 16) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 13) return "text-blue-600 dark:text-blue-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

export default function StudentPerformanceBreakdown({
  subjectAverages, subjectLastScores, generalAverage, previousAverage,
}: StudentPerformanceBreakdownProps) {
  
  // Agrupamento analítico calculado apenas quando os dados mudam
  const performanceData = useMemo(() => {
    const changes = subjectAverages.map((s) => {
      const last = subjectLastScores[s.subjectId]
      const lastScore = last?.score ?? s.average
      const diff = s.average - lastScore
      return { ...s, diff, lastScore }
    })

    return {
      declined: changes.filter((c) => c.diff < -0.5).sort((a, b) => a.diff - b.diff),
      improved: changes.filter((c) => c.diff > 0.5).sort((a, b) => b.diff - a.diff),
      stableCount: changes.filter((c) => Math.abs(c.diff) <= 0.5).length,
      totalChanges: changes.length
    }
  }, [subjectAverages, subjectLastScores])

  const overallDiff = generalAverage - previousAverage
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
        {/* HEADER DA ANÁLISE COMPORTAMENTAL */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Desempenho Recente
            </h3>
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
              Variação em relação ao ciclo anterior
            </p>
          </div>

          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 tabular-nums tracking-wide",
            overallDiff > 0.5 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : overallDiff < -0.5 ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
              : "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60"
          )}>
            {overallDiff > 0.5 ? <TrendingUp size={12} /> : overallDiff < -0.5 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {overallDiff > 0 ? "+" : ""}{overallDiff.toFixed(1)} global
          </span>
        </div>

        {/* CONTAINER DINÂMICO DAS VARIÁVEIS DE NOTAS */}
        <div className="space-y-4">
          
          {/* SEÇÃO: QUEDAS DE RENDIMENTO */}
          {declined.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pl-0.5">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                  Queda em {declined.length} {declined.length === 1 ? "disciplina" : "disciplinas"}
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
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[160px] sm:max-w-none">
                      {s.subjectName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {s.lastScore.toFixed(1)}
                      </span>
                      <ArrowDownRight size={12} className="text-rose-400 opacity-60" />
                      <span className={cn("text-xs font-bold tabular-nums", scoreColor(s.average))}>
                        {s.average.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md tabular-nums min-w-[32px] text-center">
                        {s.diff.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO: SUBIDAS DE RENDIMENTO */}
          {improved.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pl-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Subida em {improved.length} {improved.length === 1 ? "disciplina" : "disciplinas"}
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
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[160px] sm:max-w-none">
                      {s.subjectName}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                        {s.lastScore.toFixed(1)}
                      </span>
                      <ArrowUpRight size={12} className="text-emerald-400 opacity-60" />
                      <span className={cn("text-xs font-bold tabular-nums", scoreColor(s.average))}>
                        {s.average.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md tabular-nums min-w-[32px] text-center">
                        +{s.diff.toFixed(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ESTADO DE ESTABILIDADE TOTAL */}
          {declined.length === 0 && improved.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
              <Minus size={16} className="text-zinc-300 dark:text-zinc-700 mb-1" />
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                Rendimento linear — sem flutuações nas pautas.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* METADADOS DO FOOTER */}
      {stableCount > 0 && (declined.length > 0 || improved.length > 0) && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/40 text-center">
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            {stableCount} {stableCount === 1 ? "cadeira mantém-se" : "cadeiras mantêm-se"} dentro da margem de estabilidade.
          </p>
        </div>
      )}
    </div>
  )
}