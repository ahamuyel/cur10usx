"use client"

import { useRouter } from "next/navigation"
import { FileText, ClipboardList, Calendar } from "lucide-react"
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

interface StudentAgendaProps {
  exams: Exam[]
  assignments: Assignment[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formatted = d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })
  if (diffDays <= 0) return { text: "Hoje", urgent: true, day: d.getDate(), month: d.toLocaleDateString("pt-AO", { month: "short" }) }
  if (diffDays === 1) return { text: "Amanhã", urgent: true, day: d.getDate(), month: d.toLocaleDateString("pt-AO", { month: "short" }) }
  if (diffDays <= 3) return { text: `Em ${diffDays} dias`, urgent: true, day: d.getDate(), month: d.toLocaleDateString("pt-AO", { month: "short" }) }
  return { text: formatted, urgent: false, day: d.getDate(), month: d.toLocaleDateString("pt-AO", { month: "short" }) }
}

export default function StudentAgenda({ exams, assignments }: StudentAgendaProps) {
  const router = useRouter()

  const items = [
    ...exams.map((e) => ({
      id: e.id,
      title: e.title,
      subjectName: e.subjectName,
      date: e.date,
      kind: "exam" as const,
      kindLabel: "Prova",
      icon: FileText,
      iconBg: "bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400",
      link: "/list/exams",
    })),
    ...assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subjectName: a.subjectName,
      date: a.dueDate,
      kind: "assignment" as const,
      kindLabel: "Tarefa",
      icon: ClipboardList,
      iconBg: "bg-violet-100 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
      link: "/list/assignments",
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-card border border-border p-5 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Agenda Académica</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento próximo</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-card border border-border p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={16} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Agenda Académica</h3>
      </div>
      <div className="space-y-2">
        {items.slice(0, 6).map((item) => {
          const date = formatDate(item.date)
          const Icon = item.icon
          return (
            <div
              key={`${item.kind}-${item.id}`}
              onClick={() => router.push(item.link)}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-muted cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex flex-col items-center w-10 shrink-0">
                <span className="text-sm font-black text-foreground tabular-nums leading-none">{date.day}</span>
                <span className="text-[9px] font-medium text-muted-foreground uppercase">{date.month}</span>
              </div>
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.iconBg)}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.subjectName} · {item.kindLabel}</p>
              </div>
              {date.urgent && (
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-lg shrink-0">
                  {date.text}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
