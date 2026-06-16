"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, UserX, Inbox, ArrowRight, Bell, CheckCircle2 } from "lucide-react"
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
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/executive-briefing")
      .then(r => r.json())
      .then(json => {
        setData(json)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!data || !data.attention) return null

  const alerts: AlertItem[] = [
    {
      label: "Alunos em Risco",
      value: data.attention.criticalStudents + data.attention.highRiskStudents,
      description: "Requerem acompanhamento imediato",
      icon: UserX,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100/60 dark:border-rose-900/20",
      href: "/list/students?risk=alto",
    },
    {
      label: "Solicitações Pendentes",
      value: data.attention.pendingApplications,
      description: "Processos aguardando revisão",
      icon: Inbox,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100/60 dark:border-amber-900/20",
      href: "/list/applications",
    },
    {
      label: "Casos Críticos",
      value: data.attention.criticalStudents,
      description: "Situação de extrema vulnerabilidade",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50/50 dark:bg-red-950/30 border-red-100/60 dark:border-red-900/20",
      href: "/list/students?risk=critico",
    },
  ].filter(a => a.value > 0)

  const noAlerts = alerts.length === 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-5 h-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
            noAlerts ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20"
          )}>
            <Bell size={15} className={noAlerts ? "text-emerald-500" : "text-amber-500"} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Ações Requeridas</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Alertas operacionais activos</p>
          </div>
        </div>
        {!noAlerts && (
          <span className="inline-flex items-center justify-center bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 tabular-nums">
            {alerts.length}
          </span>
        )}
      </div>

      {noAlerts ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2 text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Operação em Conformidade</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {alerts.map((alert, i) => (
            <Link
              key={i}
              href={alert.href}
              className="group flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 border bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 border-zinc-100/50 dark:border-zinc-800/20"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(6px)",
                transitionDelay: `${i * 45}ms`,
              }}
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", alert.bg)}>
                <alert.icon size={15} className={alert.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">{alert.value}</span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{alert.label}</span>
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate font-medium mt-0.5">{alert.description}</p>
              </div>
              <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}