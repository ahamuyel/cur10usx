"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, UserX, Inbox, ArrowRight } from "lucide-react"
import Link from "next/link"

interface AttentionData {
  attention: {
    criticalStudents: number
    highRiskStudents: number
    pendingApplications: number
  }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const alerts = [
    {
      label: "Alunos Críticos",
      value: data.attention.criticalStudents,
      icon: UserX,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
      href: "/list/students?risk=critico",
      show: data.attention.criticalStudents > 0
    },
    {
      label: "Solicitações Pendentes",
      value: data.attention.pendingApplications,
      icon: Inbox,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      href: "/list/applications",
      show: data.attention.pendingApplications > 0
    },
    {
      label: "Alto Risco",
      value: data.attention.highRiskStudents,
      icon: AlertTriangle,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      href: "/list/students?risk=alto",
      show: data.attention.highRiskStudents > 0
    }
  ].filter(a => a.show)

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
          <ArrowRight size={18} />
        </div>
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
          Não existem situações críticas que exijam atenção imediata hoje.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
        Atenção Imediata
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert, i) => (
          <Link 
            key={i} 
            href={alert.href}
            className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${alert.bg} flex items-center justify-center ${alert.color}`}>
                <alert.icon size={20} />
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {alert.value}
                </div>
                <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                  {alert.label}
                </div>
              </div>
            </div>
            <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-500 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}
