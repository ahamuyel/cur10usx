"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { TrendingUp, AlertCircle } from "lucide-react"
import { useTheme } from "@/provider/theme"
import { cn } from "@/lib/utils"

interface HistoryEntry {
  id: string
  score: number
  status: string
  breakdown: {
    academicPerformance: number
    attendance: number
    schoolActivity: number
    administrativeEfficiency: number
  }
  snapshotDate: string
}

interface TrendsInfo {
  change7d: number | null
  change30d: number | null
  history: HistoryEntry[]
}

interface ChartResponse {
  history: HistoryEntry[]
  trends: TrendsInfo
}

export default function AcademicHealthHistoryChart() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  const [data, setData] = useState<ChartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/academic-health/history")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setData(json)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-44 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="h-56 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Evolução do Score</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar o histórico.</p>
      </div>
    )
  }

  const chartData = [...data.history].reverse().map(h => ({
    date: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "2-digit" }),
    score: h.score,
    previous: null as number | null,
  }))

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0
  const initialScore = chartData.length > 0 ? chartData[0].score : 0
  const totalChange = latestScore - initialScore
  const trend = totalChange >= 0 ? "up" : "down"

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
            <TrendingUp size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Evolução da Saúde Académica
          </h3>
        </div>
        <div className="flex items-center gap-4">
          {data.trends?.change7d !== null && data.trends?.change7d !== undefined && (
            <span className={cn(
              "text-xs font-medium",
              data.trends.change7d >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {data.trends.change7d >= 0 ? "+" : ""}{data.trends.change7d} (7d)
            </span>
          )}
          {data.trends?.change30d !== null && data.trends?.change30d !== undefined && (
            <span className={cn(
              "text-xs font-semibold",
              data.trends.change30d >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              {data.trends.change30d >= 0 ? "+" : ""}{data.trends.change30d} (30d)
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
              axisLine={false}
              tickLine={false}
              minTickGap={20}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
              axisLine={false}
              tickLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <ReferenceLine
              y={50}
              stroke={isDark ? "#3f3f46" : "#d4d4d8"}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Score Geral"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: isDark ? "#18181b" : "#ffffff" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Trend indicator */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <span className={cn(
          "text-xs font-medium",
          trend === "up" ? "text-emerald-600" : "text-rose-600"
        )}>
          Tendência {trend === "up" ? "positiva" : "negativa"}
        </span>
        <span className="text-xs text-zinc-400">
          — {totalChange > 0 ? "+" : ""}{totalChange} pts no período
        </span>
      </div>
    </div>
  )
}
