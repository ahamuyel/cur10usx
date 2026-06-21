"use client"

import { useEffect, useState } from "react"
import { Users, Presentation, GraduationCap, AlertCircle, AlertTriangle } from "lucide-react"
import { MetricCard } from "../dashboard/MetricCard"

type IndicatorType = "aproveitamento" | "assiduidade" | "alunosEmRisco" | "turmasMonitorizacao"

export default function GeneralIndicators({ briefing }: { briefing?: any }) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (briefing && !briefing.error && briefing.academic) {
      setStats({
        aproveitamento: briefing.academic.aproveitamento,
        assiduidade: briefing.academic.assiduidade,
        alunosEmRisco: briefing.risk?.totalAtRisk || 0,
        turmasMonitorizacao: briefing.classes?.totalUnderMonitoring || 0,
      })
      setLoading(false)
      requestAnimationFrame(() => setVisible(true))
      return
    }

    if (briefing?.error) {
      setError(true)
      setLoading(false)
      return
    }

    fetch("/api/school-stats")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        setStats(json)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [briefing])

  const gridLayoutClass = "grid grid-cols-1 @[240px]:grid-cols-2 @[580px]:grid-cols-4 gap-4 w-full"

  if (loading) {
    return (
      <div className="@container w-full">
        <div className={gridLayoutClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="h-[106px] rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/80 p-4 flex flex-col justify-between shadow-xs animate-pulse"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
              <div className="space-y-1.5 w-full">
                <div className="h-2.5 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-5 w-10 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-4 flex items-center gap-2.5">
        <AlertTriangle size={16} className="text-rose-500 shrink-0" />
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Não foi possível carregar as métricas rápidas.
        </p>
      </div>
    )
  }

  if (!stats) return null

  const indicators = [
    {
      key: "aproveitamento" as IndicatorType,
      label: "Taxa de Aproveitamento",
      value: `${stats.aproveitamento}%`,
      icon: <GraduationCap className="w-4 h-4 text-violet-500" />,
      variant: stats.aproveitamento >= 70 ? ("success" as const) : ("warning" as const),
      href: "/list/results",
      description: briefing?.academic?.evolution !== undefined ? `${briefing.academic.evolution > 0 ? "+" : ""}${briefing.academic.evolution}% em evolução` : undefined,
    },
    {
      key: "assiduidade" as IndicatorType,
      label: "Assiduidade Global",
      value: `${stats.assiduidade}%`,
      icon: <Users className="w-4 h-4 text-violet-500" />,
      variant: stats.assiduidade >= 80 ? ("success" as const) : ("warning" as const),
      href: "/list/attendance",
    },
    {
      key: "alunosEmRisco" as IndicatorType,
      label: "Alunos em Risco",
      value: stats.alunosEmRisco,
      icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
      variant: stats.alunosEmRisco > 0 ? ("warning" as const) : ("success" as const),
      href: "/list/students",
    },
    {
      key: "turmasMonitorizacao" as IndicatorType,
      label: "Turmas sob Monitorização",
      value: stats.turmasMonitorizacao,
      icon: <Presentation className="w-4 h-4 text-violet-500" />,
      variant: stats.turmasMonitorizacao > 0 ? ("warning" as const) : ("info" as const),
      href: "/list/classes",
    },
  ]

  return (
    <div className="@container w-full">
      <div 
        className={gridLayoutClass}
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
        }}
      >
        {indicators.map((ind) => (
          <MetricCard
            key={ind.key}
            title={ind.label}
            value={ind.value}
            description={ind.description}
            variant={ind.variant}
            icon={ind.icon}
            href={ind.href}
            className="min-h-[102px]"
          />
        ))}
      </div>
    </div>
  )
}