"use client"

import { motion } from "framer-motion"
import { FileText, ClipboardList, BookOpen, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Result {
  id: string
  subjectName: string
  score: number
  type: string
  date: string
}

interface StudentResultsTimelineProps {
  results: Result[]
}

const typeConfig: Record<string, { label: string; icon: typeof BookOpen; color: string }> = {
  Prova: { label: "Prova", icon: FileText, color: "text-rose-600 dark:text-rose-400" },
  Tarefa: { label: "Tarefa", icon: ClipboardList, color: "text-violet-600 dark:text-violet-400" },
  Trabalho: { label: "Trabalho", icon: BookOpen, color: "text-blue-600 dark:text-blue-400" },
  Participação: { label: "Participação", icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400" },
}

function daysAgo(dateStr: string): string {
  const now = new Date()
  const d = new Date(dateStr)
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Hoje"
  if (diff === 1) return "Ontem"
  if (diff <= 7) return `Há ${diff} dias`
  return d.toLocaleDateString("pt-AO", { day: "2-digit", month: "short" })
}

function scoreColor(score: number): string {
  if (score >= 16) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 13) return "text-blue-600 dark:text-blue-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

function scoreBg(score: number): string {
  if (score >= 16) return "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30"
  if (score >= 13) return "bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30"
  if (score >= 10) return "bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30"
  return "bg-rose-50 dark:bg-rose-950/20 border-rose-200/50 dark:border-rose-900/30"
}

export default function StudentResultsTimeline({ results }: StudentResultsTimelineProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Timeline de Resultados</h3>
        <p className="text-sm text-zinc-400 text-center py-6">Sem resultados registados</p>
      </div>
    )
  }

  const grouped: Record<string, Result[]> = {}
  for (const r of results) {
    const key = daysAgo(r.date)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/50 dark:border-zinc-800 p-5 sm:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Timeline de Resultados</h3>
      <div className="relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
        <div className="space-y-4">
          {Object.entries(grouped).slice(0, 3).map(([label, items], groupIdx) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 relative z-10">
                  <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">{groupIdx + 1}</span>
                </div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
              </div>
              <div className="ml-14 space-y-2">
                {items.slice(0, 3).map((r, i) => {
                  const cfg = typeConfig[r.type] || { label: r.type, icon: BookOpen, color: "text-zinc-500" }
                  const Icon = cfg.icon
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "flex items-center gap-3 py-2.5 px-3 rounded-xl border transition-all hover:shadow-sm",
                        scoreBg(r.score)
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon size={14} className={cn("shrink-0", cfg.color)} />
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                          {r.subjectName}
                        </span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", cfg.color, "bg-white/50 dark:bg-black/20")}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className={cn("text-base font-black tabular-nums shrink-0", scoreColor(r.score))}>
                        {r.score}
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
