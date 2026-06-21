"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Target, AlertTriangle, Clock, ClipboardList, TrendingUp,
  BookOpen, Users, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectAverage {
  subjectId: string
  subjectName: string
  average: number
  count: number
}

interface Exam {
  id: string
  title: string
  subjectName: string
  date: string
}

interface AbsencesBySubject {
  subjectName: string
  count: number
}

interface StudentDailyFocusProps {
  subjectsNeedingAttention: string[]
  pendingSubmissions: number
  upcomingExams: Exam[]
  totalAbsences: number
  absencesBySubject: AbsencesBySubject[]
  subjectWithMostAbsences: string | null
  generalAverage: number
  previousAverage: number
  subjectAverages: SubjectAverage[]
  targetAverage: number
}

interface FocusItem {
  id: string
  icon: typeof Target
  title: string
  description: string
  priority: "critical" | "warning" | "info" | "success"
  type: string
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getStatusPhrase(
  average: number,
  previousAverage: number,
  totalAbsences: number,
  subjectWithMostAbsences: string | null,
  subjectsNeedingAttention: string[],
): string {
  const trend = average - previousAverage
  const hasAbsenceIssues = totalAbsences >= 5
  const hasSubjectIssues = subjectsNeedingAttention.length > 0

  if (hasAbsenceIssues && hasSubjectIssues)
    return `Tens ${totalAbsences} faltas e ${subjectsNeedingAttention.length} disciplina${subjectsNeedingAttention.length > 1 ? "s" : ""} com média crítica.`
  if (hasAbsenceIssues)
    return `Tens ${totalAbsences} faltas este período.${subjectWithMostAbsences ? ` A maioria em ${subjectWithMostAbsences}.` : ""}`
  if (hasSubjectIssues)
    return `${subjectsNeedingAttention.join(", ")} ${subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atenção.`
  if (totalAbsences === 0 && trend > 1.0 && average >= 14) return "Presença perfeita e excelente evolução."
  if (trend > 1.0 && average >= 14) return "Excelente evolução. Mantém o ritmo."
  if (trend > 0) return "Estás a melhorar. Continua assim."
  if (totalAbsences === 0) return "Sem faltas registadas. Desempenho estável."
  return "Desempenho estável. Foca-te nas próximas metas."
}

export default function StudentDailyFocus({
  subjectsNeedingAttention,
  pendingSubmissions,
  upcomingExams,
  totalAbsences,
  absencesBySubject,
  subjectWithMostAbsences,
  generalAverage,
  previousAverage,
  subjectAverages,
  targetAverage,
}: StudentDailyFocusProps) {
  const focusItems = useMemo((): FocusItem[] => {
    const items: FocusItem[] = []

    const worst = [...subjectAverages].sort((a, b) => a.average - b.average)[0]
    if (worst && worst.average < targetAverage) {
      items.push({
        id: "worst-subject",
        icon: worst.average < 10 ? AlertTriangle : BookOpen,
        title: `Melhorar ${worst.subjectName}`,
        description: `Média atual: ${worst.average.toFixed(1)} valores`,
        priority: worst.average < 10 ? "critical" : "warning",
        type: "subject",
      })
    }

    if (pendingSubmissions > 0) {
      items.push({
        id: "pending-work",
        icon: ClipboardList,
        title: `${pendingSubmissions} trabalho${pendingSubmissions > 1 ? "s" : ""} pendente${pendingSubmissions > 1 ? "s" : ""}`,
        description: "Submissões por entregar. Prioriza os prazos.",
        priority: "warning",
        type: "task",
      })
    }

    const nextExam = upcomingExams[0]
    if (nextExam) {
      const days = daysUntil(nextExam.date)
      items.push({
        id: "next-exam",
        icon: Clock,
        title: `Prova de ${nextExam.subjectName}`,
        description: days === 0 ? "Hoje!" : days === 1 ? "Amanhã" : `Em ${days} dias`,
        priority: days <= 3 ? "critical" : days <= 7 ? "warning" : "info",
        type: "exam",
      })
    }

    if (totalAbsences >= 5) {
      const worstSubject = absencesBySubject[0]
      items.push({
        id: "absences",
        icon: Users,
        title: `Tens ${totalAbsences} falta${totalAbsences > 1 ? "s" : ""} este período`,
        description: worstSubject
          ? `${worstSubject.subjectName} tem ${worstSubject.count} falta${worstSubject.count > 1 ? "s" : ""}. Evita novas ausências.`
          : "Assiste a todas as aulas para não comprometer o teu aproveitamento.",
        priority: "critical",
        type: "absences",
      })
    } else if (totalAbsences > 0 && totalAbsences < 5) {
      const worstSubject = absencesBySubject[0]
      if (worstSubject) {
        items.push({
          id: "absences",
          icon: Users,
          title: `Tens ${totalAbsences} falta${totalAbsences > 1 ? "s" : ""} este período`,
          description: `${worstSubject.subjectName} é a disciplina com mais ausências (${worstSubject.count}).`,
          priority: "warning",
          type: "absences",
        })
      }
    }

    if (items.length === 0 && totalAbsences === 0) {
      const trend = generalAverage - previousAverage
      const targetDiff = generalAverage - targetAverage
      if (targetDiff < 0) {
        items.push({
          id: "target",
          icon: Target,
          title: `Falta ${Math.abs(targetDiff).toFixed(1)} para a meta`,
          description: `Tens ${generalAverage.toFixed(1)} — objetivo: ${targetAverage.toFixed(1)}`,
          priority: "info",
          type: "target",
        })
        } else if (trend > 1.0 && generalAverage >= 14) {
        items.push({
          id: "maintain",
          icon: Sparkles,
          title: "Presença perfeita!",
          description: "Sem faltas registadas. Mantém o bom desempenho.",
          priority: "success",
          type: "success",
        })
      } else {
        items.push({
          id: "focus",
          icon: TrendingUp,
          title: `Média estável em ${generalAverage.toFixed(1)}`,
          description: "Foca-te nas próximas avaliações para subir.",
          priority: "info",
          type: "stable",
        })
      }
    }

    return items.slice(0, 4)
  }, [
    pendingSubmissions, upcomingExams,
    totalAbsences, absencesBySubject, generalAverage, previousAverage,
    subjectAverages, targetAverage,
  ])

  const statusPhrase = getStatusPhrase(
    generalAverage, previousAverage, totalAbsences, subjectWithMostAbsences, subjectsNeedingAttention,
  )

  const priorityColors = {
    critical: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      border: "border-rose-100 dark:border-rose-900/20",
      icon: "text-rose-500",
      dot: "bg-rose-500",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      border: "border-amber-100 dark:border-amber-900/20",
      icon: "text-amber-500",
      dot: "bg-amber-500",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      border: "border-blue-100 dark:border-blue-900/20",
      icon: "text-blue-500",
      dot: "bg-blue-500",
    },
    success: {
      bg: "bg-emerald-50 dark:bg-emerald-500/10",
      border: "border-emerald-100 dark:border-emerald-900/20",
      icon: "text-emerald-500",
      dot: "bg-emerald-500",
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-900/20">
            <Target size={15} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Foco de Hoje</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{statusPhrase}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {focusItems.map((item, i) => {
          const colors = priorityColors[item.priority]
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-start gap-3.5 p-4 rounded-2xl border transition-all",
                colors.bg,
                colors.border,
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                colors.bg,
                colors.border,
              )}>
                <item.icon size={16} className={colors.icon} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {item.title}
                  </p>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
