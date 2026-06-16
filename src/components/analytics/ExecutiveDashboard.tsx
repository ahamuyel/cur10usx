"use client"

import { useState, useEffect } from "react"
import { RefreshCw, LayoutDashboard } from "lucide-react"
import AcademicHealthScore from "@/components/ui/AcademicHealthScore"
import AcademicHealthHistoryChart from "./AcademicHealthHistoryChart"
import StudentRiskPanel from "./StudentRiskPanel"
import ClassHealthPanel from "./ClassHealthPanel"
import RecommendationsPanel from "./RecommendationsPanel"
import AttentionArea from "./AttentionArea"
import GeneralIndicators from "./GeneralIndicators"
import EventCalendar from "@/components/ui/EventCalendar"
import Announcements from "@/components/ui/Announcements"

export default function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const [key, setKey] = useState(0)

  // Ensure we have at least one snapshot on mount to populate charts
  useEffect(() => {
    const ensureInitialData = async () => {
      try {
        const res = await fetch("/api/analytics/academic-health/history")
        const data = await res.json()
        if (!data.history || data.history.length === 0) {
          await fetch("/api/analytics/academic-health/snapshot", { method: "POST" })
          setKey(k => k + 1)
        }
      } catch (err) {
        console.error("Failed to ensure initial data:", err)
      }
    }
    ensureInitialData()
  }, [])

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
...
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

      {/* Line 1: Academic Health Score (hero) + Attention Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AcademicHealthScore key={`score-${key}`} />
        </div>
        <div>
          <AttentionArea key={`attention-${key}`} />
        </div>
      </div>

      {/* Line 2: Evolution Chart (dominant width) */}
      <AcademicHealthHistoryChart key={`history-${key}`} />

      {/* Line 3: General Indicators (reduced visual weight) */}
      <GeneralIndicators />

      {/* Line 4: Classes, Students at Risk, Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ClassHealthPanel key={`classes-${key}`} />
        <StudentRiskPanel key={`risk-${key}`} />
        <RecommendationsPanel key={`recs-${key}`} />
      </div>

      {/* Line 5: Calendar + Announcements (secondary area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-60 hover:opacity-100 transition-opacity duration-300">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  )
}
