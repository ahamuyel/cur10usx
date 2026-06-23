"use client"

import { useEffect, useState, useMemo } from "react"
import { AlertTriangle, UserX, Inbox, ArrowRight, Bell, CheckCircle2, Lightbulb, ChevronRight } from "lucide-react"
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

function computeInsight(briefing: any): string {
  if (!briefing) return ""
  const ap = briefing.academic?.aproveitamento
  const ass = briefing.academic?.assiduidade
  const status = briefing.academic?.status
  const atRisk = briefing.risk?.totalAtRisk ?? 0
  const monitoring = briefing.classes?.totalUnderMonitoring ?? 0
  const critical = briefing.risk?.summary?.["Crítico"] ?? 0
  const altoRisco = briefing.risk?.summary?.["Alto Risco"] ?? 0
  const evolution = briefing.academic?.evolution ?? 0

  if (!ap && !ass) return "Ainda não existem dados suficientes para gerar este insight."

  const parts: string[] = []
  if (critical > 0) parts.push(`${critical} aluno${critical > 1 ? "s" : ""} com absentismo crítico.`)
  if (altoRisco > 0) parts.push(`${altoRisco} aluno${altoRisco > 1 ? "s" : ""} em alto risco pedagógico.`)
  if (monitoring > 0) parts.push(`${monitoring} turma${monitoring > 1 ? "s" : ""} sob monitorização.`)
  if (evolution !== 0) {
    parts.push(`Aproveitamento médio ${evolution > 0 ? "subiu" : "desceu"} ${Math.abs(evolution)}% esta semana.`)
  }
  if (ap) parts.push(`Aproveitamento geral em ${ap}% (${(status || "sem dados").toLowerCase()}).`)
  if (ass) parts.push(`Assiduidade geral em ${ass}%.`)

  return parts.join(" ") || "Tudo dentro da normalidade."
}

export default function AttentionArea({ briefing }: { briefing?: any }) {
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (briefing && !briefing.error) {
      setLoading(false)
      requestAnimationFrame(() => setVisible(true))
    } else if (briefing?.error) {
      setLoading(false)
    }
  }, [briefing])

  const insightText = useMemo(() => computeInsight(briefing), [briefing])

  if (loading || briefing?.error) {
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

  const sections = [
    {
      title: "Intervenção Imediata",
      priority: "high",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100/60 dark:border-rose-900/20",
      icon: AlertTriangle,
      items: [
        briefing?.risk?.summary["Crítico"] > 0 && {
          label: "Alunos em Risco Crítico",
          value: briefing.risk.summary["Crítico"],
          href: "/list/students?risk=critico"
        },
        briefing?.classes?.criticalCount > 0 && {
          label: "Turmas com Aproveitamento Crítico",
          value: briefing.classes.criticalCount,
          href: "/list/classes"
        }
      ].filter(Boolean)
    },
    {
      title: "Atenção Pedagógica",
      priority: "medium",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100/60 dark:border-amber-900/20",
      icon: Bell,
      items: [
        briefing?.risk?.summary["Alto Risco"] > 0 && {
          label: "Alunos em Alto Risco",
          value: briefing.risk.summary["Alto Risco"],
          href: "/list/students?risk=alto"
        },
        briefing?.classes?.atRiskCount > 0 && {
          label: "Turmas em Observação",
          value: briefing.classes.atRiskCount,
          href: "/list/classes"
        }
      ].filter(Boolean)
    },
    {
      title: "Operação e Secretaria",
      priority: "low",
      color: "text-zinc-600 dark:text-zinc-400",
      bg: "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-100/60 dark:border-zinc-800/20",
      icon: Inbox,
      items: [
        briefing?.operational?.pendingApplications > 0 && {
          label: "Candidaturas Pendentes",
          value: briefing.operational.pendingApplications,
          href: "/list/applications"
        }
      ].filter(Boolean)
    }
  ].filter(s => s.items.length > 0)

  const noAlerts = sections.length === 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-6">
      {/* Banner de Insight Automático */}
      {insightText && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 dark:border-amber-500">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <Lightbulb size={15} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Insight Automático
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              {insightText}
            </p>
            <Link
              href="/analytics/pedagogical"
              className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              Ver relatório completo <ChevronRight size={10} />
            </Link>
          </div>
        </div>
      )}

      {/* Header de Acções Prioritárias */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
            noAlerts ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20" : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/20"
          )}>
            <Bell size={15} className={noAlerts ? "text-emerald-500" : "text-amber-500"} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Acções Prioritárias</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">O que exige atenção hoje?</p>
          </div>
        </div>
      </div>

      {noAlerts ? (
        <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2 text-emerald-500">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Operação em Conformidade</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <section.icon size={14} className={section.color} />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {section.title}
                </h4>
              </div>
              <div className="space-y-1.5">
                {section.items.map((item: any, i: number) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="group flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 border bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 border-zinc-100/50 dark:border-zinc-800/20"
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(6px)",
                      transitionDelay: `${(idx * 2 + i) * 30}ms`,
                    }}
                  >
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-3xs", section.bg)}>
                      <span className={cn("text-xs font-bold tabular-nums", section.color)}>{item.value}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate leading-tight">
                        {item.label}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
