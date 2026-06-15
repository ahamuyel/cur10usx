"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Minus, Sun, Moon, Coffee } from "lucide-react"

interface BriefingData {
  health: {
    score: number
    status: string
    evolution: number
  }
  today: {
    lessons: number
  }
}

export default function ExecutiveBriefing() {
  const [data, setData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/executive-briefing")
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="h-24 sm:h-28 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    )
  }

  const getTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return { text: "Bom dia", icon: Sun }
    if (hour < 18) return { text: "Boa tarde", icon: Coffee }
    return { text: "Boa noite", icon: Moon }
  }

  const greeting = getTimeGreeting()
  const EvolutionIcon = data.health.evolution > 0 ? TrendingUp : data.health.evolution < 0 ? TrendingDown : Minus

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-indigo-500 dark:to-violet-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg shadow-indigo-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <greeting.icon size={18} className="text-amber-300" />
            <span className="text-sm font-medium opacity-90">{greeting.text}, Diretor(a)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-2">
            A saúde académica está <span className="underline decoration-amber-400 underline-offset-4">{data.health.status}</span>
          </h1>
          <p className="text-sm opacity-80 max-w-md">
            A escola apresenta uma pontuação de {data.health.score}/100. 
            {data.health.evolution !== 0 ? (
              <span className="inline-flex items-center gap-1 ml-1 font-medium">
                <EvolutionIcon size={14} />
                {Math.abs(data.health.evolution)}pts em relação ao último período.
              </span>
            ) : " Mantém-se estável desde o último snapshot."}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-60">Hoje</div>
            <div className="text-xl font-bold leading-tight">{data.today.lessons} Aulas</div>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-60">Score</div>
            <div className="text-xl font-bold leading-tight text-amber-300">{data.health.score}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
