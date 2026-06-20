"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ChevronRight, MessageSquare, FileEdit, User, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = { data: NonNullable<TeacherDashboardData> }

const priorityStyles = {
  crítica: "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
  moderada: "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
  informativa: "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
}

export default function TeacherAttentionCenter({ data }: Props) {
  const students = data.attentionStudents

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} />
          Centro de Atenção
        </h3>
        <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
          {students.length} Pendentes
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {students.length === 0 ? (
          <div className="text-center py-10 opacity-60">
            <p className="text-xs font-bold text-zinc-500">Tudo em dia!</p>
          </div>
        ) : (
          students.slice(0, 5).map((s) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800/80"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-200/40 dark:border-zinc-700/30">
                {s.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{s.name}</p>
                <p className="text-[10px] text-zinc-500 truncate">{s.className} · {s.reason}</p>
              </div>

              <div className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border", priorityStyles[s.priority as keyof typeof priorityStyles])}>
                {s.priority}
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {students.length > 5 && (
        <button className="w-full mt-4 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-750 dark:hover:text-zinc-200 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors cursor-pointer">
          Ver todos os alertas <ChevronRight size={12} />
        </button>
      )}
    </div>
  )
}