"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react"
import { useTheme } from "@/provider/theme"

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

const STATUS_COLORS: Record<string, string> = {
  Excelente: "#10B981",
  Boa: "#06B6D4",
  Atenção: "#F59E0B",
  Crítica: "#F43F5E",
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
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Histórico do Score</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar o histórico.</p>
      </div>
    )
  }

  const chartData = [...data.history].reverse().map(h => ({
    date: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "2-digit" }),
    score: h.score,
    academicPerformance: h.breakdown.academicPerformance,
    attendance: h.breakdown.attendance,
  }))

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0

  return (
    <div className="theme-card p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-cyan-600 dark:text-cyan-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Evolução do Score</h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {data.trends?.change7d !== null && (
            <span className={data.trends.change7d! >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {data.trends.change7d! >= 0 ? "+" : ""}{data.trends.change7d} (7d)
            </span>
          )}
          {data.trends?.change30d !== null && (
            <span className={data.trends.change30d! >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {data.trends.change30d! >= 0 ? "+" : ""}{data.trends.change30d} (30d)
            </span>
          )}
        </div>
      </div>

      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: isDark ? "#a1a1aa" : "#71717a" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
                borderRadius: "12px",
                fontSize: "12px",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px" }}
            />
            <Line
              type="monotone"
              dataKey="score"
              name="Score Geral"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: "#6366f1" }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="academicPerformance"
              name="Desempenho"
              stroke="#10B981"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
            <Line
              type="monotone"
              dataKey="attendance"
              name="Assiduidade"
              stroke="#06B6D4"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
