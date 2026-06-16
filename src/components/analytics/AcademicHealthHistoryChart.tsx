"use client"

import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts"
import { TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
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

// UI UPGRADE: Tooltip totalmente customizado com Tailwind CSS
function CustomTooltip({ active, payload, isDark }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-3 py-2 shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
          {payload[0].payload.dateFull}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
            Score: {payload[0].value}
          </p>
        </div>
      </div>
    )
  }
  return null
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
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>
        <div className="h-64 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40 animate-pulse" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="w-full py-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Evolução da Saúde Académica</h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Não foi possível carregar o histórico de dados analíticos.</p>
      </div>
    )
  }

  const chartData = [...data.history].reverse().map(h => ({
    date: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "2-digit" }),
    // Salva a data completa para o tooltip personalizado
    dateFull: new Date(h.snapshotDate).toLocaleDateString("pt", { day: "2-digit", month: "short", year: "numeric" }),
    score: h.score,
  }))

  const latestScore = chartData.length > 0 ? chartData[chartData.length - 1].score : 0
  const initialScore = chartData.length > 0 ? chartData[0].score : 0
  const totalChange = latestScore - initialScore
  const trend = totalChange >= 0 ? "up" : "down"

  return (
    // UI UPGRADE: Removido o card de container redundante para encaixar perfeito no grid do DashboardPage
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center">
            <TrendingUp size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Evolução Histórica
            </h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Histórico recente de saúde institucional</p>
          </div>
        </div>
        
        {/* Pílulas de Tendências Customizadas */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {data.trends?.change7d !== null && data.trends?.change7d !== undefined && (
            <div className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-3xs",
              data.trends.change7d >= 0 
                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" 
                : "text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
            )}>
              {data.trends.change7d >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{data.trends.change7d >= 0 ? "+" : ""}{data.trends.change7d}%</span>
              <span className="opacity-50 font-medium">7d</span>
            </div>
          )}
          {data.trends?.change30d !== null && data.trends?.change30d !== undefined && (
            <div className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-3xs",
              data.trends.change30d >= 0 
                ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" 
                : "text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
            )}>
              {data.trends.change30d >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              <span>{data.trends.change30d >= 0 ? "+" : ""}{data.trends.change30d}%</span>
              <span className="opacity-50 font-medium">30d</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart - Convertido para AreaChart com degradê líquido */}
      <div className="h-60 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={isDark ? 0.25 : 0.12}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke={isDark ? "#27272a/60" : "#e4e4e7/80"} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontWeight: 500, fill: isDark ? "#71717a" : "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              minTickGap={25}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fontWeight: 500, fill: isDark ? "#71717a" : "#a1a1aa" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ stroke: isDark ? "#3f3f46" : "#e4e4e7", strokeWidth: 1, strokeDasharray: "3 3" }} />
            
            <ReferenceLine
              y={50}
              stroke={isDark ? "#27272a" : "#e4e4e7"}
              strokeDasharray="5 5"
              strokeWidth={1.5}
            />
            
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#scoreGlow)"
              dot={{ r: 0 }} // Esconde as bolinhas normais para visual limpo estilo Apple
              activeDot={{ r: 5, fill: "#6366f1", strokeWidth: 2.5, stroke: isDark ? "#09090b" : "#ffffff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend footer */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
            trend === "up" 
              ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20" 
              : "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/20"
          )}>
            {trend === "up" ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            Tendência {trend === "up" ? "Geral Positiva" : "Geral Negativa"}
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
            — acumulado de {totalChange > 0 ? "+" : ""}{totalChange} pontos no período analisado
          </span>
        </div>
      </div>
    </div>
  )
}