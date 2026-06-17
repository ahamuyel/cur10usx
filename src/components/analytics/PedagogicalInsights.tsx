"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, TrendingDown, BookOpen, GraduationCap, School } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PedagogicalInsights() {
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/insights")
      .then(r => r.json())
      .then(data => {
        setInsights(data.insights || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading || insights.length === 0) return null

  const getIcon = (icon: string) => {
    switch (icon) {
      case "trending-up": return <TrendingUp size={14} className="text-emerald-500" />
      case "trending-down": return <TrendingDown size={14} className="text-rose-500" />
      case "book": return <BookOpen size={14} className="text-blue-500" />
      case "graduation": return <GraduationCap size={14} className="text-indigo-500" />
      default: return <Sparkles size={14} className="text-amber-500" />
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/20 flex items-center justify-center">
          <Sparkles size={15} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Insights Pedagógicos</h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Destaques automáticos da instituição</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight, i) => (
          <div 
            key={i}
            className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100/50 dark:border-zinc-800/20"
          >
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0 shadow-3xs">
              {getIcon(insight.icon)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                {insight.title}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 leading-relaxed">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
