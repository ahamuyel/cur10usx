"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import HeroBackgroundPaths from "./HeroBackgroundPaths" // Mantemos o import
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

export default function TeacherHero({ data }: { data: NonNullable<TeacherDashboardData> }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full bg-card border border-border rounded-card p-8 shadow-card transition-colors duration-500 overflow-hidden"
    >
      {/* Container da Animação de Fundo */}
      <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.15] pointer-events-none">
        <HeroBackgroundPaths />
      </div>

      {/* Conteúdo (z-10 para ficar por cima da animação) */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <Sparkles size={16} />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Painel Docente</span>
        </div>
        
        <h1 className="text-3xl font-black text-foreground">
          Olá, Prof. {data.teacher.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          Bem-vindo de volta. Tens {data.upcomingLessons?.length ?? 0} aulas agendadas para hoje. 
          Podes consultar as tuas turmas e pendências logo abaixo.
        </p>
      </div>
    </motion.div>
  )
}