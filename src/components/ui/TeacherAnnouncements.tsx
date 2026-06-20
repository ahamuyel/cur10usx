"use client"

import { motion } from "framer-motion"
import { Megaphone, Building, GraduationCap, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

const categoryConfig = {
  escola: { icon: Building, bg: "bg-zinc-50/50 dark:bg-zinc-950/40 border-zinc-200/60 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300", label: "Escola" },
  coordenação: { icon: GraduationCap, bg: "bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-200/50 dark:border-cyan-900/30 text-cyan-600 dark:text-cyan-400", label: "Coordenação" },
  sistema: { icon: Cpu, bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400", label: "Sistema" },
}

export default function TeacherAnnouncements({ data }: Props) {
  const announcements = data.recentAnnouncements

  return (
    <div className="bg-card rounded-card border border-border p-4 sm:p-5 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={14} className="text-muted-foreground" />
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Comunicados
        </h3>
        <span className="text-[10px] font-bold bg-accent text-muted-foreground px-1.5 py-0.5 rounded-md tabular-nums border border-border">
          {announcements.length}
        </span>
      </div>

      {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-card bg-muted">
          <p className="text-xs font-bold text-muted-foreground">Nenhum comunicado</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Tudo tranquilo por aqui.</p>
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
                className={cn("rounded-card p-3 border transition-all hover:shadow-card", cat.bg)}
              >
                <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-xl bg-card flex items-center justify-center shrink-0 mt-0.5 border border-border">
                    <Icon size={11} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[11px] font-bold text-foreground truncate">{item.title}</h4>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">{cat.label}</span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[8px] font-medium text-muted-foreground mt-1 block tabular-nums">
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
