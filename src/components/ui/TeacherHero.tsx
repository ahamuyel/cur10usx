"use client"

import { motion } from "framer-motion"
import { GraduationCap, BookOpen, Users, Bell, CalendarCheck, Sparkles, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard"

type Props = {
  data: NonNullable<TeacherDashboardData>
}

export default function TeacherHero({ data }: Props) {
  const period = new Date().getHours()
  const greeting = period < 12 ? "Bom dia" : period < 18 ? "Boa tarde" : "Boa noite"

  const formattedDate = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })

  const totalLessons = data.upcomingLessons?.length ?? 0
  const completedLessons = data.summary.assessmentsCompleted ?? 0
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const items = [
    { label: "Aulas Hoje", value: totalLessons, icon: BookOpen, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Por Corrigir", value: data.summary.totalExamsToGrade, icon: Bell, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Em Atenção", value: data.summary.totalStudentsAttention, icon: Users, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Reuniões", value: data.summary.totalMeetings, icon: CalendarCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden w-full bg-linear-to-b from-white/70 to-white/40 dark:from-zinc-900/40 dark:to-zinc-900/15 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-zinc-200/50 dark:border-zinc-800/60 shadow-xl dark:shadow-2xl flex flex-col xl:flex-row gap-8 items-center justify-between"
    >
      {/* Aurora Glows com Interação de Camadas */}
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-[-20%] right-[10%] w-[300px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

      {/* ================= SECCÃO ESQUERDA: INFOS & BRANDING DE CONTEXTO ================= */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-4 z-10">
        
        {/* Micro Badge Dinâmica */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-500/8 dark:bg-violet-500/15 px-3 py-1 rounded-full w-fit border border-violet-500/10 shadow-xs backdrop-blur-xs">
          <Sparkles size={11} className="animate-pulse" />
          {formattedDate}
        </div>

        {/* Bloco de Título Principal */}
        <div className="flex flex-col gap-1 mt-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            {greeting}, <span className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-700 dark:from-white dark:via-zinc-200 dark:to-zinc-400 bg-clip-text text-transparent">Prof. {data.teacher.name}</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-zinc-400 dark:text-zinc-500 mt-1 max-w-lg leading-relaxed">
            Painel Geral do Cur10usX. Estás a gerir um ecossistema com <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">{data.summary.totalStudents} alunos</span> e <span className="text-zinc-800 dark:text-zinc-200 font-extrabold">{data.summary.totalClasses} turmas ativas</span>.
          </p>
        </div>

        {/* Zona Dinâmica de Alerta / Sucesso Académico */}
        <div className={cn(
          "mt-2 p-3 rounded-2xl border text-xs font-semibold max-w-lg flex items-center justify-between gap-4 transition-all",
          data.summary.studentsAtRisk > 0 
            ? "bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/10 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
            : "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/10 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        )}>
          <span>
            {data.summary.studentsAtRisk > 0 
              ? `Atenção: Existem ${data.summary.studentsAtRisk} alunos com comportamento de risco académico.` 
              : "Excelente! O rendimento geral de todas as turmas está estabilizado."}
          </span>
          <button className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 shrink-0 hover:underline cursor-pointer">
            Verificar <ArrowUpRight size={12} />
          </button>
        </div>

        {/* Tracker Progressivo Otimizado */}
        {totalLessons > 0 && (
          <div className="flex flex-col gap-1.5 mt-2 max-w-xs w-full">
            <div className="flex justify-between items-baseline text-[10px] font-extrabold tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
              <span>Aulas Concluídas Hoje</span>
              <span className="text-zinc-800 dark:text-zinc-300 tabular-nums">{completedLessons}/{totalLessons}</span>
            </div>
            <div className="h-2 w-full bg-zinc-200/50 dark:bg-zinc-800/40 rounded-full overflow-hidden p-[2px] border border-zinc-100 dark:border-zinc-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(139,92,246,0.3)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ================= SECCÃO DIREITA: METRIC GRID METAMÓRFICO ================= */}
      <div className="w-full xl:w-auto grid grid-cols-2 sm:grid-cols-4 xl:flex xl:flex-wrap gap-3.5 z-10 shrink-0 justify-end">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="bg-white/90 dark:bg-zinc-900/40 rounded-[24px] p-4 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between gap-4 min-w-[130px] xl:w-[140px] shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] group"
            >
              <div className="flex items-center justify-between w-full">
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-800/40 shadow-3xs", item.bg, item.color)}>
                  <Icon size={14} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 group-hover:bg-violet-500 transition-colors" />
              </div>
              
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight tabular-nums leading-none">
                  {String(item.value).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mt-1.5 block truncate">
                  {item.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

    </motion.div>
  )
}