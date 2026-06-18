"use client"

import { GraduationCap, CalendarCheck, ClipboardList, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentEssentialsProps {
  average: number
  attendancePercent: number
  pendingSubmissions: number
  nextEvent: { title: string; date: string; type: string } | null
  avgTrend?: number
  attendanceTrend?: number
}

type Card = {
  key: string
  label: string
  icon: typeof GraduationCap
  getValue: (p: StudentEssentialsProps) => string
  suffix: string | ((p: StudentEssentialsProps) => string)
  getColor: (p: StudentEssentialsProps) => "emerald" | "amber" | "rose" | "indigo"
  getTrend: (p: StudentEssentialsProps) => number | null | undefined
  trendLabel: (v: number) => string
}

const cards: Card[] = [
  {
    key: "average",
    label: "Média Geral",
    icon: GraduationCap,
    getValue: (p) => `${p.average.toFixed(1)}`,
    suffix: "/20",
    getColor: (p) => p.average >= 14 ? "emerald" : p.average >= 10 ? "amber" : "rose",
    getTrend: (p) => p.avgTrend,
    trendLabel: (v) => `${v >= 0 ? "+" : ""}${v.toFixed(1)} pts`,
  },
  {
    key: "attendance",
    label: "Assiduidade",
    icon: CalendarCheck,
    getValue: (p) => `${p.attendancePercent}`,
    suffix: "%",
    getColor: (p) => p.attendancePercent >= 90 ? "emerald" : p.attendancePercent >= 75 ? "amber" : "rose",
    getTrend: (p) => p.attendanceTrend,
    trendLabel: (v) => `${v >= 0 ? "+" : ""}${v}%`,
  },
  {
    key: "pending",
    label: "Tarefas Pendentes",
    icon: ClipboardList,
    getValue: (p) => `${p.pendingSubmissions}`,
    suffix: "",
    getColor: (p) => p.pendingSubmissions === 0 ? "emerald" : "amber",
    getTrend: () => null,
    trendLabel: () => "",
  },
  {
    key: "next",
    label: "Próxima Avaliação",
    icon: Calendar,
    getValue: (p) => p.nextEvent ? p.nextEvent.title : "Nenhuma",
    suffix: (p) => p.nextEvent ? new Date(p.nextEvent.date).toLocaleDateString("pt-AO", { day: "2-digit", month: "short" }) : "",
    getColor: () => "indigo",
    getTrend: () => null,
    trendLabel: () => "",
  },
]

const colorMap: Record<string, { bg: string; text: string; iconBg: string; trend: string }> = {
  emerald: { bg: "bg-emerald-50/50 dark:bg-emerald-950/10", text: "text-emerald-700 dark:text-emerald-300", iconBg: "bg-emerald-100 dark:bg-emerald-950/30", trend: "text-emerald-600 dark:text-emerald-400" },
  amber: { bg: "bg-amber-50/50 dark:bg-amber-950/10", text: "text-amber-700 dark:text-amber-300", iconBg: "bg-amber-100 dark:bg-amber-950/30", trend: "text-amber-600 dark:text-amber-400" },
  rose: { bg: "bg-rose-50/50 dark:bg-rose-950/10", text: "text-rose-700 dark:text-rose-300", iconBg: "bg-rose-100 dark:bg-rose-950/30", trend: "text-rose-600 dark:text-rose-400" },
  indigo: { bg: "bg-indigo-50/50 dark:bg-indigo-950/10", text: "text-indigo-700 dark:text-indigo-300", iconBg: "bg-indigo-100 dark:bg-indigo-950/30", trend: "text-indigo-600 dark:text-indigo-400" },
}

export default function StudentEssentials(props: StudentEssentialsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const color = card.getColor(props)
        const c = colorMap[color]
        const Icon = card.icon
        const value = card.getValue(props)
        const suffix = typeof card.suffix === "function" ? card.suffix(props) : card.suffix
        const trend = card.getTrend(props)
        const trendTxt = trend !== null && trend !== undefined ? card.trendLabel(trend) : null

        return (
          <div key={card.key} className={cn("rounded-2xl p-4 border border-zinc-200/50 dark:border-zinc-800", c.bg)}>
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", c.iconBg)}>
                <Icon size={16} className={c.text} />
              </div>
              {trendTxt && (
                <span className={cn("text-[10px] font-bold", (trend ?? 0) >= 0 ? c.trend : "text-rose-500")}>
                  {trendTxt}
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={cn("text-xl font-black tabular-nums", c.text)}>{value}</span>
              {suffix && <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">{suffix}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
