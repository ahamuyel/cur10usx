"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Target, AlertTriangle, CheckCircle2, Sparkles, BookOpen,
  ClipboardList, TrendingUp, ArrowRight, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

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

function getSuggestion(
  status: StudentStatus, 
  subjectsNeedingAttention: string[], 
  pendingSubmissions: number,
): { title: string; description: string; action: string; link?: string } {
  if (subjectsNeedingAttention.length > 0) {
    return { title: "Micro-objectivo", description: `Resolver exercícios de ${subjectsNeedingAttention[0]} hoje`, action: "Começar", link: "/list/results" }
  }
  if (pendingSubmissions > 0) {
    return { title: "Micro-objectivo", description: `Entregar ${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""}`, action: "Ir para tarefas", link: "/list/assignments" }
  }
  if (status === "excellent") {
    return { title: "Sugestão", description: "Rever apontamentos das últimas aulas", action: "Ir para dashboard" }
  }
  return { title: "Sugestão", description: "Praticar exercícios das disciplinas mais fracas", action: "Ver disciplinas", link: "/list/results" }
}

const statusConfig: Record<StudentStatus, { label: string; color: string; dotColor: string; icon: typeof Sparkles }> = {
  excellent: { label: "Excelente", color: "text-emerald-600 dark:text-emerald-400", dotColor: "bg-emerald-500", icon: Sparkles },
  improving: { label: "A melhorar", color: "text-blue-600 dark:text-blue-400", dotColor: "bg-blue-500", icon: TrendingUp },
  stable: { label: "Estável", color: "text-zinc-500 dark:text-zinc-400", dotColor: "bg-zinc-400", icon: CheckCircle2 },
  at_risk: { label: "Atenção", color: "text-rose-600 dark:text-rose-400", dotColor: "bg-rose-500", icon: AlertTriangle },
}

export default function StudentActionHub({
  average, previousAverage, attendancePercent, attendanceWarning,
  pendingSubmissions, subjectsNeedingAttention,
}: StudentActionHubProps) {
  const router = useRouter()
  const status = getStudentStatus(average, previousAverage, attendanceWarning, subjectsNeedingAttention)
  const focus = getPrimaryFocusData(subjectsNeedingAttention, pendingSubmissions, attendanceWarning, average)
  const suggestion = getSuggestion(status, subjectsNeedingAttention, pendingSubmissions)
  const cfg = statusConfig[status]
  const isAtRisk = status === "at_risk"

  const hasContent = pendingSubmissions > 0 || subjectsNeedingAttention.length > 0 || attendanceWarning

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 shadow-2xs h-full flex flex-col justify-between"
    >
      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* HEADER DO STATUS OPERACIONAL */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full animate-pulse", cfg.dotColor)} />
            <span className={cn("text-[11px] font-bold uppercase tracking-wider", cfg.color)}>
              Foco Operacional · {cfg.label}
            </span>
          </div>
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border",
            isAtRisk 
              ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20" 
              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-100 dark:border-zinc-800/60"
          )}>
            <cfg.icon size={14} className={isAtRisk ? "text-rose-500" : "text-zinc-400 dark:text-zinc-500"} />
          </div>
        </div>

        {/* ALVO CENTRAL / ALERTA DO DIA */}
        <div className="bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800/40">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={13} className="text-violet-500 dark:text-violet-400" />
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Objetivo Principal
            </span>
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            {focus.title}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
            {focus.description}
          </p>
        </div>

        {/* FEEDBACK DE ALERTAS SIMPLIFICADOS (SEM EXAMES/TAREFAS DUPLICADOS) */}
        <div className="space-y-2 flex-1">
          {pendingSubmissions > 0 && (
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100/50 dark:border-amber-900/20">
              <ClipboardList size={13} className="text-amber-500 shrink-0" />
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400 tabular-nums">
                {pendingSubmissions} tarefa{pendingSubmissions > 1 ? "s" : ""} por entregar
              </span>
            </div>
          )}

          {attendanceWarning && (
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/50 dark:border-rose-900/20">
              <Users size={13} className="text-rose-500 shrink-0" />
              <span className="text-xs font-medium text-rose-800 dark:text-rose-400 tabular-nums">
                Assiduidade crítica: {attendancePercent}%
              </span>
            </div>
          )}

          {!hasContent && (
            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl text-center">
              <CheckCircle2 size={16} className="text-emerald-400 dark:text-emerald-500 mb-1" />
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tudo em ordem!</p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5 max-w-[180px]">
                Nenhuma pendência operacional detetada na pauta.
              </p>
            </div>
          )}
        </div>

        {/* CARD DE SUGESTÃO AUTOMÁTICA */}
        <div className="flex items-center gap-3 py-3 px-3.5 bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 rounded-2xl mt-auto">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border",
            pendingSubmissions > 0 ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/20" 
              : subjectsNeedingAttention.length > 0 ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20" 
              : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20"
          )}>
            {pendingSubmissions > 0 ? <ClipboardList size={13} className="text-amber-500" />
              : subjectsNeedingAttention.length > 0 ? <BookOpen size={13} className="text-rose-500" />
              : <CheckCircle2 size={13} className="text-emerald-500" />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {suggestion.title}
            </p>
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {suggestion.description}
            </p>
          </div>
        </div>

        {/* BOTÃO DE AÇÃO PRINCIPAL */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => focus.link && router.push(focus.link)}
          className={cn(
            "w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all tracking-wide uppercase",
            isAtRisk ? "bg-rose-500 text-white hover:bg-rose-600 shadow-xs shadow-rose-500/10"
              : "bg-violet-600 text-white hover:bg-violet-700 shadow-xs shadow-violet-600/10",
          )}
        >
          {focus.action}
          <ArrowRight size={14} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}