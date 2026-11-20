"use client";

import { motion } from "framer-motion";
import {
  UserPlus,
  GraduationCap,
  LayoutGrid,
  Megaphone,
  AlertTriangle,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import HeroBackgroundPaths from "@/components/ui/HeroBackgroundPaths";

const THEME_STYLES = {
  info: "bg-white dark:bg-zinc-900/70 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 backdrop-blur-md",
  success: "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-100 backdrop-blur-md",
  danger: "bg-rose-50/80 dark:bg-rose-950/30 border-rose-100 dark:border-rose-500/20 text-rose-900 dark:text-rose-100 backdrop-blur-md",
} as const;

type Theme = keyof typeof THEME_STYLES;

export default function AdminHero({ briefing }: { briefing: any }) {
  const adminName = briefing?.schoolInfo?.adminName ?? "Administrador";
  const academicYear = briefing?.schoolInfo?.academicYear ?? "N/A";
  
  const highRisk = (briefing?.risk?.summary?.["Crítico"] ?? 0) + (briefing?.risk?.summary?.["Alto Risco"] ?? 0);
  const isHighRisk = highRisk > 0;

  const cards = [
    { id: "students", v: briefing?.academic?.totalStudents ?? 0, l: "Alunos", icon: Users, href: "/list/students" },
    { id: "teachers", v: briefing?.academic?.totalTeachers ?? 0, l: "Professores", icon: GraduationCap, href: "/list/teachers" },
    { id: "classes", v: briefing?.academic?.totalClasses ?? 0, l: "Turmas", icon: BookOpen, href: "/list/classes" },
    { id: "risk", v: highRisk, l: "Em risco", icon: AlertTriangle, href: "/list/students?risk=alto" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-[2rem] p-5 sm:p-6 md:p-8 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/80 shadow-xs"
    >
      {/* Fundo dinâmico com melhor integração dark/light mode */}
      <div className="absolute inset-0 z-0 opacity-15 dark:opacity-25 pointer-events-none transition-opacity duration-700">
        <HeroBackgroundPaths />
      </div>

      <div className="relative z-10">
        {/* Header Responsivo */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-zinc-950 dark:text-white tracking-tight leading-none">
            Olá, {adminName}
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">
            Painel Executivo · Ano Lectivo {academicYear}
          </p>
        </div>

        {/* Grid de Cards: 2 colunas no mobile, 4 em telas grandes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            const isRisk = card.id === "risk" && isHighRisk;
            
            return (
              <Link key={card.id} href={card.href} className="group block outline-none">
                <div className={cn(
                  "flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-sm active:scale-[0.98] h-full",
                  "bg-white/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/70 backdrop-blur-xs",
                  isRisk && "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("w-4 h-4 md:w-5 md:h-5", isRisk ? "text-rose-500" : "text-zinc-400 dark:text-zinc-500")} />
                    <ChevronRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform text-zinc-400 dark:text-zinc-300" />
                  </div>
                  <p className="text-base sm:text-lg md:text-xl font-black text-zinc-950 dark:text-white tabular-nums tracking-tight">
                    {String(card.v).padStart(2, "0")}
                  </p>
                  <p className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                    {card.l}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ações Rápidas: Layout adaptável porbreakpoints */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/65 pt-6">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">
            Ações rápidas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              { label: "Adicionar Aluno", icon: UserPlus, href: "/list/students/new" },
              { label: "Adicionar Professor", icon: GraduationCap, href: "/list/teachers/new" },
              { label: "Criar Turma", icon: LayoutGrid, href: "/list/classes/new" },
              { label: "Comunicado", icon: Megaphone, href: "/list/announcements/new" },
            ].map((a) => (
              <Link 
                key={a.label} 
                href={a.href} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all border border-zinc-100 dark:border-zinc-800/50 group active:scale-[0.99]"
              >
                <a.icon size={16} className="text-violet-500 dark:text-violet-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                  {a.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}