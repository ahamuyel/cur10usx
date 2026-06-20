"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherStudentInsights({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const { mostImproved, mostDeclined } = data.studentInsights

  const renderList = (list: any[], title: string, icon: any, color: string, border: string) => (
    <div className="flex-1 w-full">
      <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {icon} {title}
      </div>
      <div className="space-y-2">
        {list.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-accent border border-transparent hover:border-border transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn("w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0", border)}>
                {s.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{s.name}</p>
                <p className="text-[9px] text-muted-foreground truncate">{s.subject}</p>
              </div>
            </div>
            <div className={cn("text-[10px] font-black shrink-0 ml-2", color)}>
              {s.evolutionPercent > 0 ? '+' : ''}{s.evolutionPercent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card h-full flex flex-col">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Insights de Performance</h3>
      
      {/* Grid em vez de Flex com divide-x */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {renderList(mostImproved, "Melhoria", <TrendingUp size={12} className="text-emerald-500" />, "text-emerald-600", "border-emerald-200 dark:border-emerald-800/60 bg-emerald-500/5 dark:bg-emerald-500/10")}
        
        {/* Usamos um divisor vertical apenas em desktop */}
        <div className="relative md:pl-8">
            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-border" />
            {renderList(mostDeclined, "Atenção", <TrendingDown size={12} className="text-rose-500" />, "text-rose-600", "border-rose-200 dark:border-rose-800/60 bg-rose-500/5 dark:bg-rose-500/10")}
        </div>
      </div>
    </div>
  )
}