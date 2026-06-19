"use client"

import { motion } from "framer-motion"
import { FileCheck, Plus, Send, Eye, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

export default function TeacherAssessmentCenter({ data }: Props) {
  const { assessments } = data

  const metrics = [
    { label: "Por corrigir", value: assessments.toGrade, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: ClipboardCheck },
    { label: "Publicadas", value: assessments.published, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: Eye },
    { label: "Agendadas", value: assessments.scheduled, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", icon: FileCheck },
  ]

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileCheck size={14} className="text-primary" />
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Centro de Avaliações
          </h3>
        </div>
        <button className="text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-2.5 py-1 rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1 uppercase tracking-wider">
          <Plus size={10} /> Criar
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {metrics.map((m) => {
          const Icon = m.icon
          return (
            <div key={m.label} className={cn("rounded-2xl p-3 border text-center", m.bg, "border-transparent")}>
              <Icon size={14} className={cn("mx-auto mb-1", m.color)} />
              <span className={cn("text-lg font-black tabular-nums block", m.color)}>
                {m.value}
              </span>
              <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mt-0.5">
                {m.label}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-1.5">
        {assessments.recentExams.slice(0, 5).map((exam, idx) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.03 }}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
          >
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                {exam.title}
              </p>
              <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 truncate">
                {exam.className}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                exam.status === "publicado" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                exam.status === "pendente" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                exam.status === "agendado" && "bg-violet-500/10 text-violet-600 dark:text-violet-400",
              )}>
                {exam.status}
              </span>
              {exam.status === "pendente" && (
                <button className="text-[9px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-2 py-0.5 rounded-lg hover:bg-primary/20 transition-all">
                  Corrigir
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {assessments.recentExams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhuma avaliação encontrada</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Cria a primeira avaliação para começar.</p>
        </div>
      )}

      <div className="flex gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
        <button className="flex-1 text-[9px] font-bold py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-1 uppercase tracking-wider">
          <Send size={10} /> Publicar
        </button>
        <button className="flex-1 text-[9px] font-bold py-2 rounded-xl bg-primary/10 text-primary dark:text-primary-400 hover:bg-primary/20 transition-all flex items-center justify-center gap-1 uppercase tracking-wider">
          <ClipboardCheck size={10} /> Corrigir
        </button>
      </div>
    </div>
  )
}
