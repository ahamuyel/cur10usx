"use client"

import { motion } from "framer-motion"
import { FileCheck, Plus, Send, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherAssessmentCenter({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const { assessments } = data

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <FileCheck size={14} /> Centro de Avaliações
        </h3>
        <button className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer">
          <Plus size={12} /> Novo
        </button>
      </div>

      {/* Métricas Simplificadas */}
      <div className="flex gap-6 mb-6">
        {[
          { label: "Corrigir", value: assessments.toGrade, color: "text-amber-600 dark:text-amber-400" },
          { label: "Publicadas", value: assessments.published, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Agendadas", value: assessments.scheduled, color: "text-violet-600 dark:text-violet-400" },
        ].map((m) => (
          <div key={m.label}>
            <div className={cn("text-xl font-black", m.color)}>{m.value}</div>
            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Lista de Exames */}
      <div className="flex-1 space-y-1">
        {assessments.recentExams.slice(0, 4).map((exam) => (
          <div key={exam.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50/50 dark:hover:bg-zinc-950/40 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800/80 transition-all">
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{exam.title}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{exam.className}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-[9px] font-bold uppercase", 
                exam.status === "pendente" ? "text-amber-600 dark:text-amber-400" : "text-zinc-400 dark:text-zinc-500"
              )}>
                {exam.status}
              </span>
              {exam.status === "pendente" && (
                <button className="text-[9px] font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-450 px-2 py-1 rounded-md transition-colors cursor-pointer">
                  Corrigir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé de Ações */}
      <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <button className="text-[10px] font-bold py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors uppercase cursor-pointer">
          <Send size={12} /> Publicar
        </button>
        <button className="text-[10px] font-bold py-2 flex items-center justify-center gap-2 text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 transition-colors uppercase cursor-pointer">
          <ClipboardCheck size={12} /> Corrigir
        </button>
      </div>
    </div>
  )
}