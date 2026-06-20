"use client"

import { motion } from "framer-motion"
import { FileCheck, Plus, Send, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherAssessmentCenter({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const { assessments } = data

  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <FileCheck size={14} /> Centro de Avaliações
        </h3>
        <button className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer">
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
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Lista de Exames */}
      <div className="flex-1 space-y-1">
        {assessments.recentExams.slice(0, 4).map((exam) => (
          <div key={exam.id} className="group flex items-center justify-between p-3 rounded-xl hover:bg-accent border border-transparent hover:border-border transition-all">
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{exam.title}</p>
              <p className="text-[10px] text-muted-foreground">{exam.className}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-[9px] font-bold uppercase", 
                exam.status === "pendente" ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              )}>
                {exam.status}
              </span>
              {exam.status === "pendente" && (
                <button className="text-[9px] font-bold bg-muted border border-border hover:bg-accent text-muted-foreground px-2 py-1 rounded-md transition-colors cursor-pointer">
                  Corrigir
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé de Ações */}
      <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-border">
        <button className="text-[10px] font-bold py-2 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors uppercase cursor-pointer">
          <Send size={12} /> Publicar
        </button>
        <button className="text-[10px] font-bold py-2 flex items-center justify-center gap-2 text-foreground hover:text-foreground transition-colors uppercase cursor-pointer">
          <ClipboardCheck size={12} /> Corrigir
        </button>
      </div>
    </div>
  )
}