"use client"

import { motion } from "framer-motion"
import { GraduationCap, TrendingUp, TrendingDown, Users, Target, Award } from "lucide-react"
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

function getTrendStyle(average: number): { text: string; bg: string; border: string; label: string } {
  if (average >= 16) return { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/5 dark:bg-emerald-500/10", border: "border-emerald-500/10 dark:border-emerald-500/20", label: "Excelente" }
  if (average >= 13) return { text: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/5 dark:bg-violet-500/10", border: "border-violet-500/10 dark:border-violet-500/20", label: "Bom" }
  if (average >= 10) return { text: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/5 dark:bg-amber-500/10", border: "border-amber-500/10 dark:border-amber-500/20", label: "Suficiente" }
  return { text: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/5 dark:bg-rose-500/10", border: "border-rose-500/10 dark:border-rose-500/20", label: "Insuficiente" }
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
  const currentStatus = getTrendStyle(average)

  const defaultPhrases: Record<string, string> = {
    excellent: "Estás a dominar o trimestre! Continua com este ritmo impressionante 🚀",
    improving: "A tua curva de aprendizagem está a subir. Excelente esforço!",
    stable: "Desempenho consistente. Mantém o foco nas próximas metas.",
    at_risk: "Identificámos picos críticos. É hora de ajustar a estratégia de estudo.",
  }

  const phrase = statusPhrase && statusPhrase.trim() !== "" 
    ? statusPhrase 
    : (average >= 16 && trend > 0 ? defaultPhrases.excellent
      : average >= 14 && trend > 0.5 ? defaultPhrases.improving
      : average >= 10 ? (trend > 0 ? defaultPhrases.improving : defaultPhrases.stable)
      : defaultPhrases.at_risk)

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden w-full bg-white/40 dark:bg-zinc-900/30 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-zinc-100 dark:border-zinc-800/50 shadow-xs group"
    >
      {/* Luzes de animação integradas de forma ultra-suave */}
      <div className="absolute inset-0 z-0 opacity-15 dark:opacity-25 pointer-events-none">
        <HeroBackgroundPaths />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
        
        {/* LADO ESQUERDO: INFOS GERAIS */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-500/20 shadow-xs shrink-0">
              <GraduationCap className="text-violet-500 dark:text-violet-400 w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                {classInfo || "Ecossistema Cur10usX"}
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 truncate">
                {greeting}, <span className="bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-indigo-500 dark:from-zinc-100 dark:to-zinc-300">{name}</span>
              </h1>
            </div>
          </div>

          <motion.p
            key={phrase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-xl"
          >
            {phrase}
          </motion.p>

          {/* Badges de Operação */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className={cn(
              "text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider",
              currentStatus.text, currentStatus.bg, currentStatus.border
            )}>
              {currentStatus.label}
            </span>
            {criticalSubjects && criticalSubjects.length > 0 && criticalSubjects.slice(0, 2).map((subj) => (
              <span key={subj} className="text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/5 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/10 dark:border-rose-500/20 uppercase tracking-wider">
                Ajustar: {subj}
              </span>
            ))}
          </div>
        </div>

        {/* LADO DIREITO: MÉTRICAS COMPACTAS */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4 w-full">
          
          {/* MINI CARD 1: MÉDIA */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
              <Award size={14} />
              {previousAverage > 0 && (
                <div className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums",
                  trendUp ? "bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/5 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                  {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(trend).toFixed(1)}
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Média Global</p>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight tabular-nums">
                  {average.toFixed(1)}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600">/20</span>
              </div>
            </div>
          </div>

          {/* MINI CARD 2: POSIÇÃO / META */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-800/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
              <Target size={14} className="text-violet-500 dark:text-violet-400" />
              <span className="text-[10px] font-bold tabular-nums text-zinc-500">{Math.round(goalPercent)}%</span>
            </div>
            
            <div className="mt-3 w-full">
              {hasClassData ? (
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Posição Turma</p>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight tabular-nums">{classRank}º</span>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600">/{classSize}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Meta Anual</p>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight tabular-nums">{goalAverage}</span>
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-600">val</span>
                  </div>
                </div>
              )}
              
              <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    goalPercent >= 85 ? "bg-emerald-500" : goalPercent >= 50 ? "bg-violet-500" : "bg-rose-500"
                  )}
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}