"use client"

import { motion } from "framer-motion"
import { GraduationCap, TrendingUp, TrendingDown, Target, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import HeroBackgroundPaths from "./HeroBackgroundPaths"

type StudentHeroProps = {
  name: string
  average: number
  previousAverage: number
  classRank?: number | null
  classSize?: number | null
}

export default function StudentHero({
  name, average, previousAverage, classRank, classSize,
}: StudentHeroProps) {
  const trend = average - previousAverage
  const trendUp = trend > 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-8 shadow-sm transition-colors duration-500"
    >
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
        <HeroBackgroundPaths />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-2">
            <GraduationCap size={16} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Dashboard Académico</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            {greeting}, <span className="text-zinc-500 dark:text-zinc-400 font-medium">{name.split(" ")[0]}</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-sm pt-2 text-sm leading-relaxed">
            O teu desempenho está a ser monitorizado. Mantém o foco e a consistência.
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <MetricCard 
            icon={<Award size={18} className="text-violet-600 dark:text-violet-400" />}
            label="Média Atual"
            value={average.toFixed(1)}
            trend={trend}
            isUp={trendUp}
          />
          
          {classRank && (
            <MetricCard 
              icon={<Target size={18} className="text-indigo-600 dark:text-indigo-400" />}
              label="Posição"
              value={`${classRank}/${classSize}`}
              isRank
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

function MetricCard({ icon, label, value, trend, isUp, isRank = false }: any) {
  return (
    <div className="flex-1 md:w-36 bg-zinc-50/50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] backdrop-blur-sm transition-all">
      <div className="flex justify-between items-center mb-3">
        {/* Ícone com borda neutra consistente */}
        <div className="p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] shadow-sm">
          {icon}
        </div>
        {!isRank && trend !== undefined && (
          <div className={cn(
            "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md", 
            isUp 
              ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10" 
              : "text-rose-700 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10"
          )}>
            {isUp ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
            {Math.abs(trend).toFixed(1)}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{value}</div>
      <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  )
}