"use client"

import { motion } from "framer-motion"
import { BookOpen, MapPin, Clock, Users, Play, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherUpcomingLessons({ data }: { data: NonNullable<TeacherDashboardData> }) {
  const lessons = data.upcomingLessons

  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <BookOpen size={14} />
          Aulas de Hoje
        </h3>
        <span className="text-[10px] font-bold bg-accent px-2 py-1 rounded-full text-muted-foreground border border-border">
          {lessons.length} Agendadas
        </span>
      </div>

      <div className="space-y-3">
        {lessons.length === 0 ? (
          <div className="text-center py-8 opacity-60 text-xs font-bold">Nenhuma aula hoje.</div>
        ) : (
          lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              className={cn(
                "group relative p-4 rounded-2xl border transition-all",
                lesson.status === "in_progress" 
                  ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-800/35" 
                  : "bg-muted border-border"
              )}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-foreground truncate">{lesson.subject}</h4>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{lesson.className}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1"><Clock size={10} /> {lesson.startTime}</div>
                    {lesson.room && <div className="flex items-center gap-1"><MapPin size={10} /> {lesson.room}</div>}
                    <div className="flex items-center gap-1"><Users size={10} /> {lesson.studentCount}</div>
                  </div>
                </div>

                {/* Badge de Estado minimalista */}
                <div className={cn(
                  "px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                  lesson.status === "in_progress" ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                )}>
                  {lesson.status === "in_progress" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {lesson.status === "upcoming" ? "Próxima" : lesson.status === "in_progress" ? "Em curso" : "Concluída"}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}