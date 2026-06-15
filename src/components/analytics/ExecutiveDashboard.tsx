"use client"

import { useState } from "react"
import { RefreshCw, LayoutDashboard, Settings2 } from "lucide-react"
import AcademicHealthScore from "@/components/ui/AcademicHealthScore"
import AcademicHealthHistoryChart from "./AcademicHealthHistoryChart"
import InsightsPanel from "./InsightsPanel"
import StudentRiskPanel from "./StudentRiskPanel"
import ClassHealthPanel from "./ClassHealthPanel"
import TrendsComparison from "./TrendsComparison"
import RecommendationsPanel from "./RecommendationsPanel"
import ExecutiveBriefing from "./ExecutiveBriefing"
import AttentionArea from "./AttentionArea"
import ReferenceData from "./ReferenceData"
import EventCalendar from "@/components/ui/EventCalendar"
import Announcements from "@/components/ui/Announcements"

export default function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [key, setKey] = useState(0)

  const refresh = async () => {
    setRefreshing(true)
    try {
      await fetch("/api/analytics/academic-health/snapshot", { method: "POST" })
      setKey(k => k + 1)
    } catch {
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-8 max-w-[1600px] mx-auto w-full">
      {/* 1. Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Centro de Decisão Escolar
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Painel Executivo de Gestão Académica
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition disabled:opacity-50 border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Actualizar Dados
        </button>
      </div>

      {/* 2. Executive Briefing */}
      <ExecutiveBriefing key={`briefing-${key}`} />

      {/* 3. Attention Area */}
      <AttentionArea key={`attention-${key}`} />

      {/* 4. Core Intelligence (Health & Recommendations) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <AcademicHealthScore key={`score-${key}`} />
        </div>
        <div className="xl:col-span-7">
          <RecommendationsPanel key={`recs-${key}`} />
        </div>
      </div>

      {/* 5. Insights & Detailed Diagnostics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <InsightsPanel key={`insights-${key}`} />
        <div className="grid grid-cols-1 gap-6">
          <StudentRiskPanel key={`risk-${key}`} />
          <ClassHealthPanel key={`classes-${key}`} />
        </div>
      </div>

      {/* 6. Context & Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
           <AcademicHealthHistoryChart key={`history-${key}`} />
           <TrendsComparison key={`trends-${key}`} />
        </div>
        <aside className="xl:col-span-4 flex flex-col gap-6">
          <EventCalendar />
          <Announcements />
        </aside>
      </div>

      {/* 7. Reference Data (Progressive Disclosure via details) */}
      <details className="group border-t border-zinc-100 dark:border-zinc-800 pt-8 mt-4">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition list-none">
          <Settings2 size={14} />
          Visualizar Métricas de Suporte e Dados Base
        </summary>
        <div className="mt-8">
          <ReferenceData />
        </div>
      </details>
    </div>
  )
}
