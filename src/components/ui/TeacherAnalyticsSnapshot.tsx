"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, TrendingUp, ClipboardCheck, AlertTriangle } from "lucide-react"
import { MetricCard } from "../dashboard/MetricCard"
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
      icon: <Users className="w-4 h-4 text-violet-500" />,
      variant: "info" as const,
      href: "/list/students",
    },
    {
      label: "Média Geral",
      value: summary.generalAverage.toFixed(1),
      description: "Em relação a 20",
      icon: <TrendingUp className="w-4 h-4 text-violet-500" />,
      variant: summary.generalAverage >= 14 ? ("success" as const) : summary.generalAverage >= 10 ? ("info" as const) : ("warning" as const),
      href: "/list/results",
    },
    {
      label: "Taxa de Presença",
      value: `${summary.attendanceRate}%`,
      icon: <ClipboardCheck className="w-4 h-4 text-violet-500" />,
      variant: summary.attendanceRate >= 80 ? ("success" as const) : ("warning" as const),
      href: "/list/attendance",
    },
    {
      label: "Avaliações Realizadas",
      value: summary.assessmentsCompleted,
      icon: <BarChart3 className="w-4 h-4 text-violet-500" />,
      variant: "info" as const,
      href: "/list/exams",
    },
    {
      label: "Alunos em Risco",
      value: summary.studentsAtRisk,
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      variant: summary.studentsAtRisk > 0 ? ("warning" as const) : ("success" as const),
      href: "/list/students",
    },
  ]

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-violet-500" />
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Resumo Executivo
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map((m, idx) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.04 }}
            className="flex flex-col h-full"
          >
            <MetricCard
              title={m.label}
              value={m.value}
              description={m.description}
              variant={m.variant}
              icon={m.icon}
              href={m.href}
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
