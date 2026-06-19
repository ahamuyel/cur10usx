"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ChevronRight, MessageSquare, FileEdit, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const priorityConfig = {
  crítica: {
    icon: AlertTriangle,
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    border: "border-rose-200/60 dark:border-rose-900/30",
    text: "text-rose-600 dark:text-rose-400",
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  moderada: {
    icon: AlertTriangle,
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    border: "border-amber-200/60 dark:border-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  informativa: {
    icon: AlertTriangle,
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
    border: "border-blue-200/60 dark:border-blue-900/30",
    text: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
}

export default function TeacherAttentionCenter({ data }: Props) {
  const students = data.attentionStudents

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-500" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Centro de Atenção
          </h3>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums",
            students.length > 0
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          )}>
            {students.length}
          </span>
        </div>
        <button className="text-[9px] font-bold text-primary dark:text-primary-400 flex items-center gap-1 hover:opacity-80 transition-opacity uppercase tracking-wider">
          Ver todos <ChevronRight size={10} />
        </button>
      </div>

      {students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <AlertTriangle size={18} className="text-emerald-500" />
          </div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhum aluno precisa de atenção</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Tudo dentro da normalidade.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {students.slice(0, 6).map((student, idx) => {
            const config = priorityConfig[student.priority]

            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all hover:shadow-xs",
                  config.bg, config.border
                )}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/30 dark:border-zinc-700/30 flex items-center justify-center text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase shrink-0">
                    {student.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{student.name}</p>
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider", config.badge)}>
                        {student.priority}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                      {student.className} · {student.subject}
                    </p>
                    <p className="text-[9px] font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                      {student.reason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button className="w-7 h-7 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800/60 transition-all" title="Ver aluno">
                    <User size={12} />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800/60 transition-all" title="Enviar feedback">
                    <MessageSquare size={12} />
                  </button>
                  <button className="w-7 h-7 rounded-lg bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800/60 transition-all" title="Registar observação">
                    <FileEdit size={12} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
