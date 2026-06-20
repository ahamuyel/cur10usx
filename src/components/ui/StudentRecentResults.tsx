"use client"

import { FileText, ClipboardList, BookOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Result {
  id: string
  subjectName: string
  score: number
  type: string
  date: string
}

interface StudentRecentResultsProps {
  results: Result[]
}

const typeConfig: Record<string, { label: string; icon: typeof BookOpen; bg: string; badge: string }> = {
  Prova: {
    label: "Prova", icon: FileText,
    bg: "bg-rose-50 dark:bg-rose-950/20",
    badge: "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  },
  Tarefa: {
    label: "Tarefa", icon: ClipboardList,
    bg: "bg-violet-50 dark:bg-violet-950/20",
    badge: "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300",
  },
  Trabalho: {
    label: "Trabalho", icon: BookOpen,
    bg: "bg-blue-50 dark:bg-blue-950/20",
    badge: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300",
  },
  Participação: {
    label: "Participação", icon: MessageSquare,
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    badge: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  },
}

function scoreColor(score: number): string {
  if (score >= 14) return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
  if (score >= 10) return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30"
  return "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
}

export default function StudentRecentResults({ results }: StudentRecentResultsProps) {
  if (results.length === 0) {
    return (
      <div className="bg-card rounded-card border border-border p-5 shadow-card">
        <h3 className="text-sm font-semibold text-foreground mb-4">Últimas Avaliações</h3>
        <p className="text-sm text-muted-foreground text-center py-6">Sem notas registadas</p>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-card border border-border p-5 shadow-card">
      <h3 className="text-sm font-semibold text-foreground mb-4">Últimas Avaliações</h3>
      <div className="space-y-2">
        {results.slice(0, 6).map((r) => {
          const config = typeConfig[r.type] || {
            label: r.type, icon: BookOpen,
            bg: "bg-muted",
            badge: "bg-accent text-muted-foreground",
          }
          const Icon = config.icon
          return (
            <div key={r.id} className={cn("flex items-center gap-3 py-2.5 px-3 rounded-xl", config.bg)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", config.badge)}>
                    {config.label}
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {r.subjectName}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground ml-1">
                  {new Date(r.date).toLocaleDateString("pt-AO", { day: "2-digit", month: "long" })}
                </p>
              </div>
              <span className={cn("text-base font-bold tabular-nums px-3 py-1 rounded-lg shrink-0", scoreColor(r.score))}>
                {r.score}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
