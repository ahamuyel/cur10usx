"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
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

interface StudentPrioritySubjectsProps {
  subjectAverages: SubjectAverage[]
  subjectLastScores: Record<string, SubjectLastScore>
  targetAverage: number
}

function scoreBg(score: number): string {
  if (score >= 14) return "bg-emerald-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

export default function StudentPrioritySubjects({
  subjectAverages,
  subjectLastScores,
  targetAverage,
}: StudentPrioritySubjectsProps) {
  const { attention, highlights } = useMemo(() => {
    const withDiff = subjectAverages.map((s) => {
      const last = subjectLastScores[s.subjectId]
      const lastScore = last?.score ?? s.average
      const diff = s.average - lastScore
      return { ...s, diff, lastScore }
    })

    const sorted = [...withDiff].sort((a, b) => a.average - b.average)

    const attention = sorted.filter((s) => s.average < targetAverage).slice(0, 5)
    const highlights = [...sorted]
      .reverse()
      .filter((s) => s.average >= targetAverage)
      .slice(0, 4)

    return { attention, highlights }
  }, [subjectAverages, subjectLastScores, targetAverage])

  if (attention.length === 0 && highlights.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 text-center">
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 italic">
          Nenhuma disciplina disponível para análise.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {attention.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <AlertTriangle size={14} className="text-rose-500" />
            <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
              Atenção Necessária
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
              {attention.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {attention.map((s, i) => (
              <SubjectCard key={s.subjectId} s={s} index={i} />
            ))}
          </div>
        </div>
      )}

      {highlights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp size={14} className="text-emerald-500" />
            <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Destaques
            </h3>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
              {highlights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {highlights.map((s, i) => (
              <SubjectCard key={s.subjectId} s={s} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SubjectCard({
  s,
  index,
}: {
  s: SubjectAverage & { diff: number; lastScore: number }
  index: number
}) {
  const isGood = s.average >= 14
  const isWarning = s.average >= 10 && s.average < 14
  const percent = (s.average / 20) * 100
  const trendUp = s.diff > 1.0
  const trendDown = s.diff < -1.0

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 flex items-center gap-4 transition-all hover:border-zinc-200 dark:hover:border-zinc-700/50"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
          isGood ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20"
            : isWarning ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/20"
            : "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20"
        )}>
          <span className={cn(
            "text-sm font-black tabular-nums",
            isGood ? "text-emerald-600 dark:text-emerald-400"
              : isWarning ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-rose-400"
          )}>
            {s.average.toFixed(0)}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
            {s.subjectName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-1 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full", scoreBg(s.average))}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
              {s.count} aval.
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {trendUp ? (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
            <ArrowUpRight size={10} />+{s.diff.toFixed(1)}
          </span>
        ) : trendDown ? (
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">
            <ArrowDownRight size={10} />{s.diff.toFixed(1)}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            {s.lastScore.toFixed(0)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
