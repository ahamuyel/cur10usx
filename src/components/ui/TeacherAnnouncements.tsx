"use client"

import { motion } from "framer-motion"
import { Megaphone, Building, GraduationCap, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const categoryConfig = {
  escola: { icon: Building, bg: "bg-primary-50/40 dark:bg-primary-950/20 border-primary-100/70 dark:border-primary-900/20 text-primary", label: "Escola" },
  coordenação: { icon: GraduationCap, bg: "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100/70 dark:border-cyan-900/20 text-cyan-600 dark:text-cyan-400", label: "Coordenação" },
  sistema: { icon: Cpu, bg: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-100/70 dark:border-amber-900/20 text-amber-600 dark:text-amber-400", label: "Sistema" },
}

export default function TeacherAnnouncements({ data }: Props) {
  const announcements = data.recentAnnouncements

  return (
    <div className="bg-white/60 dark:bg-zinc-900/20 backdrop-blur-md rounded-3xl border border-zinc-200/60 dark:border-zinc-800/50 p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={14} className="text-primary" />
        <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Comunicados
        </h3>
        <span className="text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-400 px-1.5 py-0.5 rounded-md tabular-nums">
          {announcements.length}
        </span>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Nenhum comunicado</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Tudo tranquilo por aqui.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {announcements.slice(0, 4).map((item, idx) => {
            const cat = categoryConfig[item.category] || categoryConfig.escola
            const Icon = cat.icon

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={cn("rounded-2xl p-3 border transition-all hover:shadow-xs", cat.bg)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-xl bg-white/60 dark:bg-zinc-900/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={11} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.title}</h4>
                      <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider shrink-0">{cat.label}</span>
                    </div>
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 block tabular-nums">
                      {new Date(item.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
