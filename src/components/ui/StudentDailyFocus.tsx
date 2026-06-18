"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type StudentStatus = "excellent" | "stable" | "at_risk" | "improving"

interface DailyFocus {
  title: string
  description: string
  action: string
  link?: string
}

interface StudentDailyFocusProps {
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

function getPrimaryFocus(
  average: number,
  subjectsNeedingAttention: string[],
  pendingSubmissions: number,
  attendanceWarning: boolean,
): DailyFocus {
  if (subjectsNeedingAttention.length > 0) {
    const subjects = subjectsNeedingAttention.slice(0, 3)
    const label = subjects.length === 1 ? subjects[0] : `${subjects.length} disciplinas`
    return {
      title: "Recuperar disciplinas",
      description: `Focar em ${label} — média abaixo de 10 valores`,
      action: "Ver notas e recuperar",
      link: "/list/results",
    }
  }

  if (pendingSubmissions > 0) {
    return {
      title: `${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""}`,
      description: "Submissões por entregar — prioriza os prazos mais próximos",
      action: "Ver tarefas",
      link: "/list/assignments",
    }
  }

  if (attendanceWarning) {
    return {
      title: "Melhorar assiduidade",
      description: "Presença abaixo do recomendado. Faltas podem comprometer os resultados",
      action: "Ver presenças",
      link: "/list/attendance",
    }
  }

  if (average < 14 && average >= 10) {
    return {
      title: "Subir a média",
      description: `Estás com ${average.toFixed(1)} — foca-te em melhorar nas disciplinas com notas mais baixas`,
      action: "Ver desempenho",
      link: "/list/results",
    }
  }

  return {
    title: "Manter o ritmo",
    description: `Média em ${average.toFixed(1)} — continua assim para atingir a meta`,
    action: "Ver dashboard",
  }
}

function getMicroGoal(status: StudentStatus, subjectsNeedingAttention: string[], pendingSubmissions: number): DailyFocus {
  if (subjectsNeedingAttention.length > 0) {
    return {
      title: "Micro-objectivo",
      description: `Resolver exercícios de ${subjectsNeedingAttention[0]} hoje`,
      action: "Começar agora",
      link: "/list/results",
    }
  }

  if (pendingSubmissions > 0) {
    return {
      title: "Micro-objectivo",
      description: `Entregar ${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""}`,
      action: "Ir para tarefas",
      link: "/list/assignments",
    }
  }

  if (status === "excellent") {
    return {
      title: "Micro-objectivo",
      description: "Rever apontamentos das últimas aulas",
      action: "Ir para dashboard",
    }
  }

  if (status === "improving") {
    return {
      title: "Micro-objectivo",
      description: "Praticar exercícios das disciplinas mais fracas",
      action: "Ver disciplinas",
      link: "/list/results",
    }
  }

  return {
    title: "Micro-objectivo",
    description: "Organizar o plano de estudo da semana",
    action: "Criar plano",
  }
}

const statusConfig: Record<StudentStatus, { label: string; color: string; dotColor: string; gradient: string; icon: typeof Sparkles }> = {
  excellent: {
    label: "Excelente",
    color: "text-emerald-700 dark:text-emerald-400",
    dotColor: "bg-emerald-500",
    gradient: "from-emerald-500/5 to-emerald-600/5",
    icon: Sparkles,
  },
  improving: {
    label: "A melhorar",
    color: "text-blue-700 dark:text-blue-400",
    dotColor: "bg-blue-500",
    gradient: "from-blue-500/5 to-blue-600/5",
    icon: TrendingUp,
  },
  stable: {
    label: "Estável",
    color: "text-zinc-600 dark:text-zinc-400",
    dotColor: "bg-zinc-400",
    gradient: "from-zinc-400/5 to-zinc-500/5",
    icon: CheckCircle2,
  },
  at_risk: {
    label: "Atenção",
    color: "text-rose-700 dark:text-rose-400",
    dotColor: "bg-rose-500",
    gradient: "from-rose-500/5 to-rose-600/5",
    icon: AlertTriangle,
  },
}

export default function StudentDailyFocus({
  average,
  previousAverage,
  attendancePercent,
  attendanceWarning,
  pendingSubmissions,
  subjectsNeedingAttention,
}: StudentDailyFocusProps) {
  const router = useRouter()

  const status = getStudentStatus(average, previousAverage, attendanceWarning, subjectsNeedingAttention)
  const focus = getPrimaryFocus(average, subjectsNeedingAttention, pendingSubmissions, attendanceWarning)
  const goal = getMicroGoal(status, subjectsNeedingAttention, pendingSubmissions)
  const cfg = statusConfig[status]
  const StatusIcon = cfg.icon

  const isAtRisk = status === "at_risk"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 shadow-sm"
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-40 dark:opacity-20 pointer-events-none" />

      <div className="relative p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={cn("w-2.5 h-2.5 rounded-full", cfg.dotColor)} />
            <span className={cn("text-xs font-bold uppercase tracking-wider", cfg.color)}>{cfg.label}</span>
          </div>
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isAtRisk ? "bg-rose-100 dark:bg-rose-950/30" : "bg-zinc-100 dark:bg-zinc-800")}>
            <StatusIcon size={16} className={isAtRisk ? "text-rose-500" : "text-zinc-500"} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-1.5">
              <Target size={14} className="text-violet-600 dark:text-violet-400" />
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Foco do Dia</span>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{focus.title}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{focus.description}</p>
          </div>

          {isAtRisk && (
            <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle size={14} className="text-rose-500" />
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Alerta</span>
              </div>
              <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                {subjectsNeedingAttention.length > 0
                  ? `${subjectsNeedingAttention.length} disciplina${subjectsNeedingAttention.length > 1 ? "s" : ""} ${subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atenção urgente`
                  : attendanceWarning
                  ? `Assiduidade em ${attendancePercent}% — abaixo do mínimo recomendado`
                  : "Risco identificado — age agora para reverter"}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                {pendingSubmissions > 0 ? (
                  <ClipboardList size={14} className="text-amber-600 dark:text-amber-400" />
                ) : subjectsNeedingAttention.length > 0 ? (
                  <BookOpen size={14} className="text-rose-600 dark:text-rose-400" />
                ) : (
                  <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{goal.title}</p>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{goal.description}</p>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => focus.link && router.push(focus.link)}
          className={cn(
            "w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all",
            isAtRisk
              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/20"
              : "bg-violet-600 text-white hover:bg-violet-700 shadow-sm shadow-violet-600/20",
          )}
        >
          Iniciar Foco
          <ArrowRight size={16} strokeWidth={2.5} />
        </motion.button>
      </div>
    </motion.div>
  )
}
