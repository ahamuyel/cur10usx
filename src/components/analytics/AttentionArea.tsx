"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, UserX, Inbox, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AttentionData {
  attention: {
    criticalStudents: number
    highRiskStudents: number
    pendingApplications: number
  }
  health?: {
    score: number
    status: string
    evolution: number
  }
}

interface AlertItem {
  label: string
  value: number
  description: string
  icon: React.ElementType
  color: string
  bg: string
  href: string
}

export default function AttentionArea() {
  const [data, setData] = useState<AttentionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/executive-briefing")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-36 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const alerts: AlertItem[] = [
    {
      label: "Alunos em Risco",
      value: data.attention.criticalStudents + data.attention.highRiskStudents,
      description: "requerem atenção imediata",
      icon: UserX,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/20",
      href: "/list/students?risk=critico",
    },
    {
      label: "Solicitações Pendentes",
      value: data.attention.pendingApplications,
      description: "aguardam revisão",
      icon: Inbox,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/20",
      href: "/list/applications",
    },
    {
      label: "Alunos Críticos",
      value: data.attention.criticalStudents,
      description: "situação muito grave",
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/20",
      href: "/list/students?risk=critico",
    },
  ].filter(a => a.value > 0)

  const noAlerts = alerts.length === 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-7 h-7 rounded-xl flex items-center justify-center",
            noAlerts ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-amber-50 dark:bg-amber-950/20"
          )}>
            <Bell size={15} className={noAlerts ? "text-emerald-500" : "text-amber-500"} />
          </div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Atenção Necessária
          </h2>
        </div>
        {!noAlerts && (
          <span className="text-lg font-bold text-amber-500">{alerts.length}</span>
        )}
      </div>

      {noAlerts ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            Nada requer atenção
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            A escola está a funcionar normalmente.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <Link
              key={i}
              href={alert.href}
              className="group flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", alert.bg)}>
                <alert.icon size={18} className={alert.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{alert.value}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{alert.label}</span>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{alert.description}</p>
              </div>
              <ArrowRight size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-all group-hover:translate-x-0.5 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}


