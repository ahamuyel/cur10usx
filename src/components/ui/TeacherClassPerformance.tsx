"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherClassPerformance({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const classes = data.classPerformance

  if (!classes?.length) return null

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-zinc-400" />
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Performance por Turma</h3>
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls.classId} className="group flex flex-col gap-3 p-4 rounded-2xl bg-zinc-50/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            
            {/* Header: Nome e Presença */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="font-black text-sm text-zinc-900 dark:text-white">{cls.className}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-550 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200/50 dark:border-zinc-700/50">
                  <Users size={10} /> {cls.studentCount}
                </div>
              </div>
              <div className="text-[10px] font-bold text-zinc-400">Presença: <span className="text-zinc-900 dark:text-white">{cls.attendanceRate}%</span></div>
            </div>

            {/* Média e Barra */}
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                <div className={cn("text-lg font-black", cls.average >= 14 ? "text-emerald-600" : "text-amber-600")}>
                  {cls.average.toFixed(1)}
                </div>
              </div>
              
              <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", cls.average >= 14 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${(cls.average / 20) * 100}%` }}
                />
              </div>

              {/* Evolução */}
              {cls.monthlyEvolution !== 0 && (
                <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", cls.monthlyEvolution > 0 ? "text-emerald-600" : "text-rose-600")}>
                  {cls.monthlyEvolution > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(cls.monthlyEvolution)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}