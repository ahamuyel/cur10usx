"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentQuickStatsProps {
  generalAverage: number
  previousAverage: number
  classRank: number | null
  classSize: number | null
  totalAbsences: number
  subjectWithMostAbsences: string | null
  targetAverage: number
}

function scoreColor(score: number): string {
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

function scoreBg(score: number): string {
  if (score >= 14) return "bg-emerald-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

export default function StudentQuickStats({
  generalAverage,
  previousAverage,
  classRank,
  classSize,
  totalAbsences,
  subjectWithMostAbsences,
  targetAverage,
}: StudentQuickStatsProps) {
  const trend = generalAverage - previousAverage
  const trendUp = trend > 0
  const targetDiff = generalAverage - targetAverage
  const aboveTarget = targetDiff >= 0
  const hasAbsences = totalAbsences > 0
  const highAbsences = totalAbsences >= 5

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      <StatCard
        label="Média Geral"
        value={generalAverage.toFixed(1)}
        suffix="/20"
        color={scoreColor(generalAverage)}
        barColor={scoreBg(generalAverage)}
        percent={(generalAverage / 20) * 100}
      />
      <StatCard
        label="Ranking"
        value={classRank ? `#${classRank}` : "—"}
        suffix={classSize ? `de ${classSize}` : ""}
        color="text-indigo-600 dark:text-indigo-400"
        barColor="bg-indigo-500"
        percent={classRank && classSize ? ((classSize - classRank + 1) / classSize) * 100 : 0}
      />
      <StatCard
        label="Faltas"
        value={`${totalAbsences}`}
        suffix={hasAbsences ? (subjectWithMostAbsences ? `${subjectWithMostAbsences}` : "total") : "nenhuma"}
        color={highAbsences ? "text-rose-600 dark:text-rose-400" : hasAbsences ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}
        barColor={highAbsences ? "bg-rose-500" : hasAbsences ? "bg-amber-500" : "bg-emerald-500"}
        percent={Math.min((totalAbsences / 10) * 100, 100)}
      />
      <StatCard
        label="Meta"
        value={targetAverage.toFixed(1)}
        suffix={aboveTarget ? "atingida" : `falta ${Math.abs(targetDiff).toFixed(1)}`}
        color={aboveTarget ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}
        barColor={aboveTarget ? "bg-emerald-500" : "bg-amber-500"}
        percent={(generalAverage / targetAverage) * 100}
      />
      <div className="col-span-2 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border",
            trendUp
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20"
              : trend < -0.5
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/60"
          )}>
            {trendUp ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : trend < -0.5 ? (
              <TrendingDown size={16} className="text-rose-500" />
            ) : (
              <Minus size={16} className="text-zinc-400" />
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Evolução
            </p>
            <p className={cn(
              "text-sm font-bold tabular-nums",
              trendUp ? "text-emerald-600 dark:text-emerald-400" : trend < -0.5 ? "text-rose-600 dark:text-rose-400" : "text-zinc-600 dark:text-zinc-400"
            )}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 text-right max-w-[140px] leading-relaxed">
          {trendUp
            ? "A melhorar em relação ao período anterior"
            : trend < -0.5
              ? "quebra em relação ao período anterior"
              : "estável em relação ao período anterior"}
        </span>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
  color,
  barColor,
  percent,
}: {
  label: string
  value: string
  suffix?: string
  color: string
  barColor: string
  percent: number
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 flex flex-col justify-between">
      <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-xl font-black tabular-nums", color)}>{value}</span>
        {suffix && (
          <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{suffix}</span>
        )}
      </div>
      <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-3">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${Math.min(Math.max(percent, 0), 100)}%` }}
        />
      </div>
    </div>
  )
}
