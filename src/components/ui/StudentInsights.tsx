"use client"

import { BarChart3, Layers, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface ScoreDistribution {
  excelente: number
  bom: number
  suficiente: number
  insuficiente: number
}

interface AbsenceBySubject {
  subjectName: string
  count: number
}

interface AttendanceByMonth {
  month: string
  ausente: number
}

interface StudentInsightsProps {
  scoreDistribution: ScoreDistribution
  totalAbsences: number
  absencesBySubject: AbsenceBySubject[]
  attendanceByMonth: AttendanceByMonth[]
}

export default function StudentInsights({
  scoreDistribution,
  totalAbsences,
  absencesBySubject,
  attendanceByMonth,
}: StudentInsightsProps) {
  const cats = [
    { label: "Excelente (16-20)", val: scoreDistribution.excelente, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
    { label: "Bom (13-15)", val: scoreDistribution.bom, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
    { label: "Suficiente (10-12)", val: scoreDistribution.suficiente, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
    { label: "Insuficiente (<10)", val: scoreDistribution.insuficiente, color: "bg-rose-500", textColor: "text-rose-600 dark:text-rose-400" },
  ]

  const total = Object.values(scoreDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return null

  const recentAbsences = attendanceByMonth
    .filter((m) => m.ausente > 0)
    .slice(-3)
    .reverse()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50">
          <Layers size={14} className="text-zinc-500 dark:text-zinc-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Insights Académicos</h3>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
            Distribuição de notas e histórico de faltas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <BarChart3 size={12} /> Distribuição de Notas
          </h4>
          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", c.color)} />
                <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex-1">{c.label}</span>
                <div className="w-full max-w-[100px] h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", c.color)}
                    style={{ width: `${total > 0 ? (c.val / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold tabular-nums w-6 text-right text-zinc-700 dark:text-zinc-300">
                  {c.val}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
            {total} avaliaç{total === 1 ? "ão" : "ões"} registada{total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
            <CalendarDays size={12} /> Histórico de Faltas
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">Total de faltas no período</span>
              <span className={cn(
                "text-xs font-bold tabular-nums",
                totalAbsences >= 5 ? "text-rose-600 dark:text-rose-400"
                  : totalAbsences > 0 ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}>
                {totalAbsences}
              </span>
            </div>

            {absencesBySubject.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 px-1">Faltas por disciplina</p>
                {absencesBySubject.slice(0, 4).map((s) => (
                  <div key={s.subjectName} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                    <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">{s.subjectName}</span>
                    <span className={cn(
                      "text-xs font-bold tabular-nums",
                      s.count >= 3 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {s.count} falta{s.count > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {recentAbsences.length > 0 && (
              <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/40">
                <p className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mb-1">Faltas recentes</p>
                {recentAbsences.map((m) => (
                  <div key={m.month} className="flex items-center justify-between py-1 px-3">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.month}</span>
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">{m.ausente} falta{m.ausente > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}

            {totalAbsences === 0 && (
              <div className="py-4 text-center">
                <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Nenhuma falta registada este período. 🎉
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
