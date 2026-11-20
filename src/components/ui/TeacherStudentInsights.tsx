"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

export default function TeacherStudentInsights({ data }: Props) {
  const { mostImproved, mostDeclined } = data.studentInsights

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Insights de Alunos
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Mais Evoluíram
            </span>
          </div>
          {mostImproved.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic pl-1">Sem dados suficientes.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {mostImproved.map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[8px] font-black text-emerald-700 dark:text-emerald-300 uppercase shrink-0">
                      {student.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">{student.name}</p>
                      <p className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 truncate">{student.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{student.evolutionPercent}%
                    </span>
                    <ChevronRight size={10} className="text-zinc-300 dark:text-zinc-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <TrendingDown size={12} className="text-rose-500" />
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Mais Regrediram
            </span>
          </div>
          {mostDeclined.length === 0 ? (
            <p className="text-[10px] text-zinc-400 italic pl-1">Sem dados suficientes.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {mostDeclined.map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-[8px] font-black text-rose-700 dark:text-rose-300 uppercase shrink-0">
                      {student.name[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">{student.name}</p>
                      <p className="text-[9px] font-medium text-zinc-400 dark:text-zinc-500 truncate">{student.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 tabular-nums">
                      {student.evolutionPercent}%
                    </span>
                    <ChevronRight size={10} className="text-zinc-300 dark:text-zinc-600" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
