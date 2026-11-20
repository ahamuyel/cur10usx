"use client"

import { cn } from "@/lib/utils"

interface Metric {
  label: string
  value: number
}

interface StudentAcademicStatusProps {
  metrics: Metric[]
}

function statusColor(value: number): string {
  if (value >= 80) return "bg-emerald-500"
  if (value >= 60) return "bg-amber-500"
  return "bg-rose-500"
}

export default function StudentAcademicStatus({ metrics }: StudentAcademicStatusProps) {
  if (metrics.length === 0) return null

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Saúde Académica</h3>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{m.label}</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 tabular-nums">{m.value}%</span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", statusColor(m.value))}
                style={{ width: `${Math.min(m.value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
