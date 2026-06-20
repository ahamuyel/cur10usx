"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Target, AlertTriangle, CheckCircle2, Sparkles, BookOpen,
  ClipboardList, TrendingUp, ArrowRight, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- DEFINIÇÕES AUXILIARES (O QUE ESTAVA EM FALTA) ---

type StudentStatus = "excellent" | "stable" | "at_risk" | "improving"

interface StudentActionHubProps {
  average: number
  previousAverage: number
  attendancePercent: number
  attendanceWarning: boolean
  pendingSubmissions: number
  subjectsNeedingAttention: string[]
}

function getStudentStatus(
  average: number, 
  previousAverage: number,
  attendanceWarning: boolean, 
  subjectsNeedingAttention: string[],
): StudentStatus {
  const trend = average - previousAverage
  const hasRisk = subjectsNeedingAttention.length > 0 || attendanceWarning
  if (average >= 14 && trend > 0.5 && !hasRisk) return "excellent"
  if (average >= 10 && trend > 0 && !hasRisk) return "improving"
  if (hasRisk || average < 10) return "at_risk"
  return "stable"
}

function getPrimaryFocusData(
  subjectsNeedingAttention: string[],
  pendingSubmissions: number,
  attendanceWarning: boolean,
  average: number,
): { title: string; description: string; action: string; link?: string } {
  if (subjectsNeedingAttention.length > 0) {
    const s = subjectsNeedingAttention.slice(0, 3)
    const label = s.length === 1 ? s[0] : `${s.length} disciplinas`
    return { title: "Recuperar disciplinas", description: `Focar em ${label} — média abaixo de 10`, action: "Ver notas", link: "/list/results" }
  }
  if (pendingSubmissions > 0) {
    return { title: `${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""}`, description: "Submissões por entregar — prioriza os prazos", action: "Ver tarefas", link: "/list/assignments" }
  }
  if (attendanceWarning) {
    return { title: "Melhorar assiduidade", description: "Presença abaixo do recomendado. Faltas podem comprometer os resultados", action: "Ver presenças", link: "/list/attendance" }
  }
  if (average < 14) {
    return { title: "Subir a média", description: `Estás com ${average.toFixed(1)} — foca-te em melhorar`, action: "Ver desempenho", link: "/list/results" }
  }
  return { title: "Manter o ritmo", description: `Média em ${average.toFixed(1)} — continua assim`, action: "Ver dashboard" }
}

const statusConfig: Record<StudentStatus, { label: string; color: string; dotColor: string; icon: typeof Sparkles }> = {
  excellent: { label: "Excelente", color: "text-emerald-600 dark:text-emerald-400", dotColor: "bg-emerald-500", icon: Sparkles },
  improving: { label: "A melhorar", color: "text-blue-600 dark:text-blue-400", dotColor: "bg-blue-500", icon: TrendingUp },
  stable: { label: "Estável", color: "text-zinc-500 dark:text-zinc-400", dotColor: "bg-zinc-400", icon: CheckCircle2 },
  at_risk: { label: "Atenção", color: "text-rose-600 dark:text-rose-400", dotColor: "bg-rose-500", icon: AlertTriangle },
}

// --- COMPONENTE PRINCIPAL ---

export default function StudentActionHub({
  average, previousAverage, attendancePercent, attendanceWarning,
  pendingSubmissions, subjectsNeedingAttention,
}: StudentActionHubProps) {
  const router = useRouter()
  const status = getStudentStatus(average, previousAverage, attendanceWarning, subjectsNeedingAttention)
  const focus = getPrimaryFocusData(subjectsNeedingAttention, pendingSubmissions, attendanceWarning, average)
  const cfg = statusConfig[status]
  const isAtRisk = status === "at_risk"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-card rounded-card border transition-all duration-300 h-full flex flex-col shadow-card",
        isAtRisk 
          ? "border-rose-200 dark:border-rose-800/80" 
          : "border-border"
      )}
    >
      <div className="p-6 flex flex-col gap-6 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("relative flex h-2 w-2")}>
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", cfg.dotColor)}></span>
              <span className={cn("relative inline-flex rounded-full h-2 w-2", cfg.dotColor)}></span>
            </span>
            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", cfg.color)}>
              {cfg.label}
            </span>
          </div>
          <div className="text-muted-foreground">
             <cfg.icon size={16} strokeWidth={1.5} />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/5 to-transparent rounded-2xl" />
          <div className="relative p-4 border border-border rounded-card bg-muted">
            <div className="flex items-center gap-1.5 mb-2">
              <Target size={12} className="text-muted-foreground" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Objetivo</span>
            </div>
            <h4 className="text-sm font-bold text-foreground leading-tight mb-1">{focus.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{focus.description}</p>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {pendingSubmissions > 0 && (
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <ClipboardList size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
                {pendingSubmissions} submissão{pendingSubmissions > 1 ? "es" : ""} pendente{pendingSubmissions > 1 ? "s" : ""}
              </span>
            </div>
          )}
          {attendanceWarning && (
            <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <Users size={14} className="text-rose-500" />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 tabular-nums">
                Assiduidade: {attendancePercent}% (Crítico)
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => focus.link && router.push(focus.link)}
          className={cn(
            "w-full py-4 rounded-2xl font-black text-[11px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] uppercase tracking-[0.1em] cursor-pointer",
            isAtRisk 
              ? "bg-rose-600 dark:bg-rose-500 text-white hover:opacity-90 shadow-md" 
              : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-primary-foreground dark:text-zinc-950"
          )}
        >
          {focus.action}
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  )
}