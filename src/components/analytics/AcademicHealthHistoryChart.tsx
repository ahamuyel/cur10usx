"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { TrendingUp, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react"
import { useTheme } from "@/provider/theme"
import { cn } from "@/lib/utils"

interface HistoryEntry {
  id: string
  score: number
  snapshotDate: string
}

interface ChartResponse {
  history: HistoryEntry[]
  trends: { change7d: number | null; change30d: number | null }
}

function CustomTooltip({ active, payload, isDark }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
          {payload[0].payload.dateFull}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            Score: {payload[0].value} pts
          </p>
        </div>
      </div>
    )
  }
  return null
}

export default function AcademicHealthHistoryChart() {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)
  const [data, setData] = useState<ChartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Sincroniza estado de tema com o Provider
  useEffect(() => {
    setIsDark(theme === "dark")
  }, [theme])

  useEffect(() => {
    fetch("/api/analytics/academic-health/history")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="h-64 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl" />
  if (error) return <div className="text-sm text-rose-500 p-4">Erro ao carregar histórico.</div>

  // Ordena os dados para exibição cronológica (antigo -> novo)
  const chartData = [...(data?.history || [])].reverse().map(h => ({
    date: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "2-digit" }),
    dateFull: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "short", year: "numeric" }),
    score: h.score,
  }))

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0
  const initialScore = chartData.length > 0 ? chartData[0].score : 0
  const totalChange = latestScore - initialScore
  const trend = totalChange >= 0 ? "up" : "down"

  return (
    // A key forçada garante a re-renderização ao trocar tema
    <div key={isDark ? "dark" : "light"} className="w-full space-y-5 p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center">
            <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Evolução do Aproveitamento</h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Histórico de desempenho institucional</p>
          </div>
        </div>
        
        {/* Tendências */}
        <div className="flex items-center gap-2">
            {[data?.trends?.change7d, data?.trends?.change30d].map((change, i) => (
                change !== undefined && change !== null && (
                    <div key={i} className={cn(
                        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border",
                        change >= 0 
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" 
                            : "text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                    )}>
                        {change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {change >= 0 ? "+" : ""}{change}% <span className="opacity-50">{i === 0 ? "7d" : "30d"}</span>
                    </div>
                )
            ))}
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.3 : 0.15}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#27272a" : "#e4e4e7"} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? "#71717a" : "#a1a1aa" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: isDark ? "#71717a" : "#a1a1aa" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip isDark={isDark} />} />
            <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fill="url(#scoreGlow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}