"use client"

import { motion } from "framer-motion"
import { BarChart3, TrendingUp, TrendingDown, Users, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"
import Link from "next/link"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const VISIBLE_LIMIT = 4

export default function TeacherClassPerformance({ data }: Props) {
  const classes = data.classPerformance
  const visible = classes.slice(0, VISIBLE_LIMIT)
  const remaining = classes.length - visible.length

  if (classes.length === 0) {
    return (
      <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Performance por Turma
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhuma turma atribuída</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Performance por Turma
          </h3>
        </div>
        {remaining > 0 && (
          <Link
            href="/list/classes"
            className="text-[9px] font-bold text-primary dark:text-primary-400 flex items-center gap-1 hover:opacity-80 transition-opacity uppercase tracking-wider cursor-pointer"
          >
            Ver todas (+{remaining}) <ChevronRight size={10} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((cls, idx) => {
          const avgColor = cls.average >= 14 ? "text-emerald-600 dark:text-emerald-400" : cls.average >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"
          const avgBarColor = cls.average >= 14 ? "bg-emerald-500" : cls.average >= 10 ? "bg-amber-500" : "bg-rose-500"
          const barWidth = Math.min(100, Math.max(0, (cls.average / 20) * 100))
          const hasEvolution = typeof cls.monthlyEvolution === "number" && cls.monthlyEvolution !== 0

          return (
            <Link key={cls.classId} href={`/list/classes/${cls.classId}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/40 hover:border-zinc-200 dark:hover:border-zinc-700/60 transition-all h-full"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{cls.className}</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                      <Users size={10} />
                      <span className="tabular-nums font-medium">{cls.studentCount}</span>
                    </div>
                    <ChevronRight size={12} className="text-zinc-300 dark:text-zinc-600" />
                  </div>
                </div>

                <div className="flex items-end gap-3 mb-3">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Média</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className={cn("text-2xl font-black tracking-tight tabular-nums", avgColor)}>
                        {cls.average.toFixed(1)}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400">/20</span>
                    </div>
                  </div>

                  {hasEvolution && (
                    <div className={cn(
                      "flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums mb-1",
                      cls.monthlyEvolution > 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    )}>
                      {cls.monthlyEvolution > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {Math.abs(cls.monthlyEvolution).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div
                  className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3"
                  role="progressbar"
                  aria-valuenow={Math.round(cls.average * 10) / 10}
                  aria-valuemin={0}
                  aria-valuemax={20}
                  aria-label={`Média da turma ${cls.className}: ${cls.average.toFixed(1)} de 20`}
                >
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", avgBarColor)}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Presença</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{cls.attendanceRate}%</span>
                  </div>
                  <div className="bg-white/50 dark:bg-zinc-900/30 rounded-xl p-2 border border-zinc-100 dark:border-zinc-800/40">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">Aprovação</span>
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{cls.approvalRate}%</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}