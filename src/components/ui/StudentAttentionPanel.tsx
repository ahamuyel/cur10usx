"use client"

import { useRouter } from "next/navigation"
import { AlertTriangle, FileText, ClipboardList, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface StudentAttentionPanelProps {
  exams: Exam[]
  assignments: Assignment[]
  pendingSubmissions: number
}

type PriorityItem = {
  id: string
  title: string
  subjectName: string
  date: Date
  kind: "exam" | "assignment"
  priority: "urgent" | "upcoming" | "info"
  label: string
}

function daysUntil(d: Date): number {
  return Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export default function StudentAttentionPanel({ exams, assignments, pendingSubmissions }: StudentAttentionPanelProps) {
  const router = useRouter()

  const items: PriorityItem[] = [
    ...exams.map((e) => {
      const d = new Date(e.date)
      const days = daysUntil(d)
      return {
        id: e.id,
        title: e.title,
        subjectName: e.subjectName,
        date: d,
        kind: "exam" as const,
        priority: days <= 1 ? "urgent" as const : days <= 5 ? "upcoming" as const : "info" as const,
        label: days <= 0 ? "Hoje" : days === 1 ? "Amanhã" : days <= 5 ? `Em ${days} dias` : d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" }),
      }
    }),
    ...assignments.map((a) => {
      const d = new Date(a.dueDate)
      const days = daysUntil(d)
      return {
        id: a.id,
        title: a.title,
        subjectName: a.subjectName,
        date: d,
        kind: "assignment" as const,
        priority: days <= 1 ? "urgent" as const : days <= 5 ? "upcoming" as const : "info" as const,
        label: days <= 0 ? "Hoje" : days === 1 ? "Amanhã" : days <= 5 ? `Em ${days} dias` : d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" }),
      }
    }),
  ]

  if (pendingSubmissions > 0) {
    items.push({
      id: "pending-submissions",
      title: `${pendingSubmissions} tarefa${pendingSubmissions > 1 ? "s" : ""} por entregar`,
      subjectName: "Submissões pendentes",
      date: new Date(),
      kind: "assignment",
      priority: "urgent",
      label: "Pendente",
    })
  }

  items.sort((a, b) => a.date.getTime() - b.date.getTime())

  const urgent = items.filter((i) => i.priority === "urgent")
  const upcoming = items.filter((i) => i.priority === "upcoming")
  const info = items.filter((i) => i.priority === "info")

  const kindConfig = {
    exam: { icon: FileText, bg: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400", link: "/list/exams", label: "Prova" },
    assignment: { icon: ClipboardList, bg: "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400", link: "/list/assignments", label: "Tarefa" },
  }

  if (urgent.length === 0 && upcoming.length === 0 && info.length === 0) {
    return (
      <div className="bg-card rounded-card border border-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">O que precisa da sua atenção</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Nada urgente — tudo em dia 🎉</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">O que precisa da sua atenção</h3>

      {urgent.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle size={12} />
            Urgente
          </p>
          <div className="space-y-1.5">
            {urgent.slice(0, 3).map((item) => {
              const cfg = kindConfig[item.kind]
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(cfg.link)}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200/50 dark:border-rose-900/30 cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                    <p className="text-[11px] text-zinc-400">{item.subjectName} · {cfg.label}</p>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg shrink-0">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Próximo</p>
          <div className="space-y-1.5">
            {upcoming.slice(0, 3).map((item) => {
              const cfg = kindConfig[item.kind]
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(cfg.link)}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                    <p className="text-[11px] text-zinc-400">{item.subjectName} · {cfg.label}</p>
                  </div>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg shrink-0">
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {info.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Informativo</p>
          <div className="space-y-1.5">
            {info.slice(0, 2).map((item) => {
              const cfg = kindConfig[item.kind]
              const Icon = cfg.icon
              return (
                <div
                  key={item.id}
                  onClick={() => router.push(cfg.link)}
                  className="flex items-center gap-3 py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                    <p className="text-[11px] text-zinc-400">{item.subjectName} · {cfg.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
