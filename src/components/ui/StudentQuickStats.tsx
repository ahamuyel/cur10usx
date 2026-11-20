"use client"

import { TrendingUp, TrendingDown, Minus, Target, Users, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricCard } from "../dashboard/MetricCard"

interface StudentQuickStatsProps {
  studentId: string
  generalAverage: number
  previousAverage: number
  classRank: number | null
  classSize: number | null
  totalAbsences: number
  subjectWithMostAbsences: string | null
  targetAverage: number | null
}

export default function StudentQuickStats({
  studentId,
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
  const targetDiff = targetAverage !== null ? generalAverage - targetAverage : 0
  const aboveTarget = targetAverage !== null && targetDiff >= 0
  const hasAbsences = totalAbsences > 0
  const highAbsences = totalAbsences >= 5

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Média Geral"
          value={generalAverage.toFixed(1)}
          description="Em relação a 20"
          variant={generalAverage >= 14 ? "success" : generalAverage >= 10 ? "info" : "warning"}
          icon={<TrendingUp className="w-4 h-4 text-violet-500" />}
          href={`/list/students/${studentId}/history`}
        />
        <MetricCard
          title="Ranking"
          value={classRank ? `#${classRank}` : "—"}
          description={classSize ? `De ${classSize} alunos` : ""}
          variant="info"
          icon={<Users className="w-4 h-4 text-violet-500" />}
        />
        <MetricCard
          title="Faltas"
          value={totalAbsences}
          description={subjectWithMostAbsences ? `Maioria em ${subjectWithMostAbsences}` : "Nenhuma falta"}
          variant={highAbsences ? "warning" : hasAbsences ? "info" : "success"}
          icon={<ClipboardCheck className="w-4 h-4 text-violet-500" />}
          href="/list/justifications"
        />
        <MetricCard
          title="Meta"
          value={targetAverage !== null ? targetAverage.toFixed(1) : "—"}
          description={targetAverage !== null ? (aboveTarget ? "Meta atingida!" : `Falta ${Math.abs(targetDiff).toFixed(1)} para a meta`) : "Sem meta definida"}
          variant={aboveTarget ? "success" : targetAverage !== null ? "info" : "info"}
          icon={<Target className="w-4 h-4 text-violet-500" />}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center border",
            trendUp
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20"
              : trend < -1.0
                ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/60"
          )}>
            {trendUp ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : trend < -1.0 ? (
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
              trendUp ? "text-emerald-600 dark:text-emerald-400" : trend < -1.0 ? "text-rose-600 dark:text-rose-400" : "text-zinc-600 dark:text-zinc-400"
            )}>
              {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 text-right max-w-[140px] leading-relaxed">
          {trendUp
            ? "A melhorar em relação ao período anterior"
            : trend < -1.0
              ? "quebra em relação ao período anterior"
              : "estável em relação ao período anterior"}
        </span>
      </div>
    </div>
  )
}
