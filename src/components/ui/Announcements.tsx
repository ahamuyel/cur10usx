"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Megaphone, ArrowRight } from "lucide-react"

// Cores pastéis premium calibradas com suporte a Dark Mode cirúrgico
const BACKGROUND_THEMES = [
  "bg-primary-50/40 dark:bg-primary-950/20 border-primary-100/70 dark:border-primary-900/20 text-primary dark:text-primary-400",
  "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100/70 dark:border-cyan-900/20 text-cyan-600 dark:text-cyan-400",
  "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/70 dark:border-amber-900/20 text-amber-600 dark:text-amber-400",
  "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100/70 dark:border-rose-900/20 text-rose-600 dark:text-rose-400",
]

type Announcement = {
  id: string
  title: string
  description: string
  createdAt: string
}

export default function Announcements() {
  const [data, setData] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    fetch("/api/announcements?limit=4")
      .then((r) => r.json())
      .then((json) => {
        setData(json.data || [])
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </div>
          <div className="h-3 w-14 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 p-4 space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3.5 w-1/2 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-3 w-12 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
              <div className="h-3 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800/60" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800/80 shadow-xs flex flex-col justify-between h-full space-y-4">
      <div>
        {/* Header Consistente */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
              <Megaphone size={15} className="text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Mural de Avisos
              </h2>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Comunicados e atualizações</p>
            </div>
          </div>
          
          <Link
            href="/list/announcements"
            className="group inline-flex items-center gap-1 text-[11px] font-bold text-primary dark:text-primary-400 hover:opacity-80 transition-all"
          >
            Ver todos
            <ArrowRight size={12} className="transform transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Lista de Avisos / Estado Vazio */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhum aviso publicado</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">O mural encontra-se limpo de momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {data.map((item, idx) => {
              const themeClass = BACKGROUND_THEMES[idx % BACKGROUND_THEMES.length]
              return (
                <div
                  key={item.id}
                  className={`${themeClass} rounded-2xl p-3.5 border transition-all duration-300 hover:scale-[1.005] hover:shadow-2xs`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${idx * 40}ms`,
                  }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-zinc-950 dark:text-zinc-50 text-xs sm:text-sm leading-snug min-w-0 flex-1 break-words">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/80 border border-zinc-100/80 dark:border-zinc-800/50 rounded-lg px-2 py-0.5 shrink-0 shadow-3xs tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString("pt")}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2 font-medium">
                    {item.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}