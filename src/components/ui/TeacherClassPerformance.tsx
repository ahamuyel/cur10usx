"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherClassPerformance({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const classes = data.classPerformance

  if (!classes?.length) return null

  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-muted-foreground" />
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Performance por Turma</h3>
      </div>

      <div className="space-y-4">
        {classes.map((cls) => (
          <div key={cls.classId} className="group flex flex-col gap-3 p-4 rounded-card bg-muted border border-border hover:bg-accent transition-all">
            
            {/* Header: Nome e Presença */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="font-black text-sm text-foreground">{cls.className}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-md border border-border">
                  <Users size={10} /> {cls.studentCount}
                </div>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground">Presença: <span className="text-foreground">{cls.attendanceRate}%</span></div>
            </div>

            {/* Média e Barra */}
            <div className="flex items-center gap-4">
              <div className="w-12 text-center">
                <div className={cn("text-lg font-black", cls.average >= 14 ? "text-emerald-600" : "text-amber-600")}>
                  {cls.average.toFixed(1)}
                </div>
              </div>
              
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", cls.average >= 14 ? "bg-emerald-500" : "bg-amber-500")}
                  style={{ width: `${(cls.average / 20) * 100}%` }}
                />
              </div>

              {/* Evolução */}
              {cls.monthlyEvolution !== 0 && (
                <div className={cn("flex items-center gap-0.5 text-[10px] font-bold", cls.monthlyEvolution > 0 ? "text-emerald-600" : "text-rose-600")}>
                  {cls.monthlyEvolution > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {Math.abs(cls.monthlyEvolution)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}