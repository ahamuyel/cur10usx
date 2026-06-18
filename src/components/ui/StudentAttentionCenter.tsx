"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, FileText, ClipboardList, Users, BookOpen } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type AttentionItem = {
  id: string
  message: string
  detail: string
  icon: typeof AlertTriangle
  variant: "danger" | "warning" | "info"
  link?: string
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

interface Exam {
  id: string
  title: string
  subjectName: string
  date: string
}

interface Assignment {
  id: string
  title: string
  subjectName: string
  dueDate: string
}

interface StudentAttentionCenterProps {
  exams: Exam[]
  assignments: Assignment[]
  pendingSubmissions: number
  attendanceWarning: boolean
  attendancePercent: number
  subjectsNeedingAttention: string[]
}

export default function StudentAttentionCenter({
  exams,
  assignments,
  pendingSubmissions,
  attendanceWarning,
  attendancePercent,
  subjectsNeedingAttention,
}: StudentAttentionCenterProps) {
  const router = useRouter()

  const items: (AttentionItem & { priority: number })[] = []

  for (const e of exams) {
    const d = new Date(e.date)
    const days = daysUntil(d)
    if (days <= 3) {
      items.push({
        id: `exam-${e.id}`,
        message: days <= 0 ? `Prova de ${e.subjectName} hoje` : days === 1 ? `Prova de ${e.subjectName} amanhã` : `Prova de ${e.subjectName} em ${days} dias`,
        detail: e.title,
        icon: FileText,
        variant: days <= 1 ? "danger" : "warning",
        link: "/list/exams",
        priority: days,
      })
    }
  }

  for (const a of assignments) {
    const d = new Date(a.dueDate)
    const days = daysUntil(d)
    if (days <= 3) {
      items.push({
        id: `assignment-${a.id}`,
        message: days <= 0 ? `Trabalho de ${a.subjectName} para hoje` : days === 1 ? `Trabalho de ${a.subjectName} para amanhã` : `Trabalho de ${a.subjectName} em ${days} dias`,
        detail: a.title,
        icon: ClipboardList,
        variant: days <= 1 ? "danger" : "warning",
        link: "/list/assignments",
        priority: days,
      })
    }
  }

  if (pendingSubmissions > 0) {
    items.push({
      id: "pending",
      message: `${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} por entregar`,
      detail: "Submissões pendentes",
      icon: ClipboardList,
      variant: "danger",
      link: "/list/assignments",
      priority: -1,
    })
  }

  if (attendanceWarning) {
    items.push({
      id: "attendance",
      message: `Assiduidade abaixo da meta (${attendancePercent}%)`,
      detail: "Mínimo recomendado: 85%",
      icon: Users,
      variant: "warning",
      link: "/list/attendance",
      priority: -2,
    })
  }

  for (const subj of subjectsNeedingAttention) {
    items.push({
      id: `subject-${subj}`,
      message: `Média de ${subj} abaixo de 10 valores`,
      detail: "Precisa de atenção urgente",
      icon: BookOpen,
      variant: "danger",
      link: "/list/results",
      priority: -3,
    })
  }

  items.sort((a, b) => a.priority - b.priority)
  const top = items.slice(0, 5)

  if (top.length === 0) {
    return null
  }

  const variantConfig = {
    danger: {
      bg: "bg-rose-50 dark:bg-rose-950/10 border-rose-200/50 dark:border-rose-900/30",
      iconBg: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30",
      iconBg: "bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/10 border-blue-200/50 dark:border-blue-900/30",
      iconBg: "bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
      badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-rose-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Centro de Atenção</h3>
      </div>
      <div className="space-y-2">
        {top.map((item, i) => {
          const cfg = variantConfig[item.variant]
          const Icon = item.icon
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => item.link && router.push(item.link)}
              className={cn(
                "flex items-center gap-3 py-2.5 px-3 rounded-xl border cursor-pointer transition-colors",
                cfg.bg,
                "hover:brightness-95 dark:hover:brightness-125"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.iconBg)}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.message}</p>
                <p className="text-[11px] text-zinc-400 truncate">{item.detail}</p>
              </div>
              <div className={cn("text-[10px] font-bold px-2 py-1 rounded-lg shrink-0", cfg.badge)}>
                {item.variant === "danger" ? "Urgente" : "Atenção"}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
