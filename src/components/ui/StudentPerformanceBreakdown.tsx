"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Award, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

// Tipagens mantidas e limpas
interface SubjectAverage { subjectId: string; subjectName: string; average: number; count: number }
interface SubjectLastScore { score: number; type: string; date: string }

interface StudentPerformanceBreakdownProps {
  subjectAverages: SubjectAverage[]
  subjectLastScores?: Record<string, SubjectLastScore>
  generalAverage: number
  previousAverage: number
}

// Refinamento: Cores cur10usx padrão (Escala 0-20 Angola)
function getStatusStyle(score: number) {
  if (score >= 16) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  if (score >= 10) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
  return "text-rose-500 bg-rose-500/10 border-rose-500/20"
}

export default function StudentPerformanceBreakdown({
  subjectAverages, subjectLastScores = {}, generalAverage, previousAverage,
}: StudentPerformanceBreakdownProps) {
  
  const STABILITY_THRESHOLD = 0.5

  const { declined, improved, stableCount } = useMemo(() => {
    const changes = subjectAverages.map((s) => {
      const last = subjectLastScores[s.subjectId]
      const diff = s.average - (last?.score ?? s.average)
      return { ...s, diff, lastScore: last?.score ?? s.average }
    })

    return {
      declined: changes.filter((c) => c.diff < -STABILITY_THRESHOLD),
      improved: changes.filter((c) => c.diff > STABILITY_THRESHOLD),
      stableCount: changes.filter((c) => Math.abs(c.diff) <= STABILITY_THRESHOLD).length
    }
  }, [subjectAverages, subjectLastScores])

  const overallDiff = generalAverage - previousAverage

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      {/* Header com Status Global */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Análise de Tendência
            {generalAverage < 10 && <AlertTriangle size={14} className="text-rose-500" />}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold mt-1">Evolução Pedagógica</p>
        </div>

        <div className={cn("px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border", 
          overallDiff > 0 
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-emerald-500/10" 
            : "text-rose-600 dark:text-rose-400 bg-rose-500/5 border-rose-500/10"
        )}>
          {overallDiff > 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
          {overallDiff > 0 ? "+" : ""}{overallDiff.toFixed(1)}
        </div>
      </div>

      {/* Lista de Mudanças */}
      <div className="flex-1 space-y-6">
        {/* Subidas */}
        {improved.length > 0 && (
          <div className="space-y-3">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-2">Evoluindo</span>
            {improved.slice(0, 2).map(s => (
              <div key={s.subjectId} className="flex items-center justify-between group">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">{s.subjectName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">{s.lastScore.toFixed(1)}</span>
                  <ArrowUpRight size={12} className="text-emerald-500" />
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", getStatusStyle(s.average))}>
                    {s.average.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quedas */}
        {declined.length > 0 && (
          <div className="space-y-3">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest px-2">Atenção</span>
            {declined.slice(0, 2).map(s => (
              <div key={s.subjectId} className="flex items-center justify-between group">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 truncate">{s.subjectName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-400 font-mono">{s.lastScore.toFixed(1)}</span>
                  <ArrowDownRight size={12} className="text-rose-500" />
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold border", getStatusStyle(s.average))}>
                    {s.average.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Minimalista */}
      <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/50 flex justify-center">
        <span className="text-[10px] text-zinc-400 font-medium">
          {stableCount} disciplinas com desempenho estável
        </span>
      </div>
    </div>
  )
}