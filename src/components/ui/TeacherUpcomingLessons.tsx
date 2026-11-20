"use client"

import { motion } from "framer-motion"
import { BookOpen, MapPin, Clock, Users, Play, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const statusConfig = {
  in_progress: {
    label: "Em curso",
    dot: "bg-emerald-500 animate-pulse",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-900/30",
  },
  upcoming: {
    label: "Próxima",
    dot: "bg-violet-500",
    bg: "bg-violet-500/5 dark:bg-violet-500/10 border-violet-200/60 dark:border-violet-900/30",
  },
  completed: {
    label: "Concluída",
    dot: "bg-zinc-300 dark:bg-zinc-600",
    bg: "bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200/40 dark:border-zinc-800/30",
  },
  cancelled: {
    label: "Cancelada",
    dot: "bg-rose-400",
    bg: "bg-rose-500/5 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-900/30",
  },
}

export default function TeacherUpcomingLessons({ data }: Props) {
  const lessons = data.upcomingLessons

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Aulas de Hoje
          </h3>
          <span className="text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-1.5 py-0.5 rounded-md tabular-nums">
            {lessons.length}
          </span>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
            <BookOpen size={18} className="text-zinc-400" />
          </div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhuma aula hoje</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Aproveita para preparar materiais.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {lessons.map((lesson, idx) => {
            const config = statusConfig[lesson.status]

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all hover:shadow-xs",
                  config.bg
                )}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className={cn("w-2 h-2 rounded-full", config.dot)} />
                    <div className="w-px h-full min-h-[2rem] bg-zinc-200 dark:bg-zinc-700/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {lesson.subject}
                      </h4>
                      <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {lesson.className}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        <Clock size={10} />
                        <span className="tabular-nums">{lesson.startTime} — {lesson.endTime}</span>
                      </div>
                      {lesson.room && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                          <MapPin size={10} />
                          {lesson.room}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        <Users size={10} />
                        <span className="tabular-nums">{lesson.studentCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800/40">
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1",
                    lesson.status === "in_progress"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : lesson.status === "upcoming"
                        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                        : "bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500"
                  )}>
                    {lesson.status === "in_progress" && <Play size={8} />}
                    {lesson.status === "completed" && <CheckCircle2 size={8} />}
                    {config.label}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
