"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, TrendingUp, ClipboardCheck, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

export default function TeacherAnalyticsSnapshot({ data }: Props) {
  const { summary } = data

  const metrics = [
    {
      label: "Alunos Acompanhados",
      value: summary.totalStudents,
      icon: Users,
      color: "text-primary dark:text-primary-400",
      bg: "bg-primary/10",
    },
    {
      label: "Média Geral",
      value: summary.generalAverage.toFixed(1),
      suffix: "/20",
      icon: TrendingUp,
      color: summary.generalAverage >= 14 ? "text-emerald-600 dark:text-emerald-400" : summary.generalAverage >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400",
      bg: summary.generalAverage >= 14 ? "bg-emerald-500/10" : summary.generalAverage >= 10 ? "bg-amber-500/10" : "bg-rose-500/10",
    },
    {
      label: "Taxa de Presença",
      value: `${summary.attendanceRate}`,
      suffix: "%",
      icon: ClipboardCheck,
      color: summary.attendanceRate >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      bg: summary.attendanceRate >= 80 ? "bg-emerald-500/10" : "bg-amber-500/10",
    },
    {
      label: "Avaliações Realizadas",
      value: summary.assessmentsCompleted,
      icon: BarChart3,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      label: "Alunos em Risco",
      value: summary.studentsAtRisk,
      icon: AlertTriangle,
      color: summary.studentsAtRisk > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
      bg: summary.studentsAtRisk > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
    },
  ]

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Resumo Executivo
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m, idx) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={cn("rounded-2xl p-3.5 border border-zinc-100 dark:border-zinc-800/40 flex flex-col gap-2")}
            >
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", m.bg, m.color)}>
                <Icon size={14} />
              </div>
              <div>
                <div className="flex items-baseline gap-0.5">
                  <span className={cn("text-lg sm:text-xl font-black tracking-tight tabular-nums", m.color)}>
                    {m.value}
                  </span>
                  {m.suffix && (
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500">{m.suffix}</span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5 leading-tight">
                  {m.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
