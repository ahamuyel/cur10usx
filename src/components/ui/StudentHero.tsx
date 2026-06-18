"use client"

import { motion } from "framer-motion"
import { GraduationCap, TrendingUp, TrendingDown, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import HeroBackgroundPaths from "./HeroBackgroundPaths"

type StudentHeroProps = {
  name: string
  average: number
  previousAverage: number
  classInfo?: string
  statusPhrase?: string
  classRank?: number | null
  classSize?: number | null
  criticalSubjects?: string[]
}

function trendColor(average: number): string {
  if (average >= 16) return "bg-emerald-400/20 text-emerald-300"
  if (average >= 13) return "bg-blue-400/20 text-blue-300"
  if (average >= 10) return "bg-amber-400/20 text-amber-300"
  return "bg-rose-400/20 text-rose-300"
}

export default function StudentHero({
  name, average, previousAverage, classInfo,
  statusPhrase, classRank, classSize, criticalSubjects,
}: StudentHeroProps) {
  const trend = average - previousAverage
  const trendUp = trend > 0
  const goalAverage = 18
  const goalPercent = Math.min((average / goalAverage) * 100, 100)
  const period = new Date().getHours()
  const greeting = period < 12 ? "Bom dia" : period < 18 ? "Boa tarde" : "Boa noite"
  const hasClassData = classRank != null && classSize != null && classSize > 0

  const defaultPhrases: Record<string, string> = {
    excellent: "Estás a ir muito bem! Continua assim 🚀",
    improving: "Estás a melhorar — bom trabalho!",
    stable: "Tudo estável — mantém o foco.",
    at_risk: "Precisas de atenção — age agora para reverter.",
  }

  const phrase = statusPhrase || (average >= 16 && trend > 0 ? defaultPhrases.excellent
    : average >= 14 && trend > 0.5 ? defaultPhrases.improving
    : average >= 10 ? (trend > 0 ? defaultPhrases.improving : defaultPhrases.stable)
    : defaultPhrases.at_risk)

  return (
    <div className="relative overflow-hidden w-full bg-linear-to-br from-violet-600 to-indigo-700 dark:from-zinc-900 dark:to-zinc-950 p-6 sm:p-8 rounded-3xl border border-violet-500/10 dark:border-zinc-800 shadow-md">

      <HeroBackgroundPaths />

      <div className="relative z-10 flex flex-col gap-5 w-full">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0 shadow-xs">
              <GraduationCap className="text-white w-6 h-6" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-xl sm:text-2xl font-black tracking-tight text-white truncate"
              >
                {greeting}, {name}
              </motion.h1>
              <p className="text-xs sm:text-sm text-violet-100/80 dark:text-zinc-400 font-medium truncate mt-1">
                {classInfo || "Painel do Aluno"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasClassData && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-xl flex items-center gap-2">
                <Users size={13} className="text-violet-200" />
                <span className="text-xs font-bold text-white tabular-nums">{classRank}º / {classSize}</span>
              </div>
            )}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm sm:text-base text-violet-100/90 dark:text-zinc-300 font-medium leading-relaxed"
        >
          {phrase}
        </motion.p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="flex items-end gap-4">
            <div className="text-left">
              <p className="text-[10px] font-bold text-violet-200 dark:text-zinc-400 uppercase tracking-wider">Média Actual</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl sm:text-5xl font-black text-white leading-none tracking-tight tabular-nums">
                  {average.toFixed(1)}
                </span>
                <span className="text-sm font-medium text-violet-200/70">/ 20</span>
              </div>
            </div>
            {previousAverage > 0 && (
              <div className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold",
                trendUp ? "bg-emerald-400/20 text-emerald-300" : "bg-rose-400/20 text-rose-300"
              )}>
                {trendUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                {Math.abs(trend).toFixed(1)}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-lg border border-white/15",
              trendColor(average)
            )}>
              {average >= 16 ? "Excelente" : average >= 13 ? "Bom" : average >= 10 ? "Suficiente" : "Insuficiente"}
            </span>
            {criticalSubjects && criticalSubjects.length > 0 && criticalSubjects.slice(0, 3).map((subj) => (
              <span key={subj} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-400/20 text-rose-300 border border-rose-400/20">
                {subj}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-violet-200/80 font-medium">Meta Anual: {average.toFixed(1)} / {goalAverage}</span>
            <span className="text-violet-200/80 font-bold tabular-nums">{Math.round(goalPercent)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                goalPercent >= 80 ? "bg-emerald-400" : goalPercent >= 50 ? "bg-amber-400" : "bg-rose-400"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
