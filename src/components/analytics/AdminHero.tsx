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
    { id: "students", v: briefing?.academic?.totalStudents ?? 0, l: "Alunos", icon: Users, href: "/list/students", theme: "info" as Theme },
    { id: "teachers", v: briefing?.academic?.totalTeachers ?? 0, l: "Professores", icon: GraduationCap, href: "/list/teachers", theme: "info" as Theme },
    { id: "classes", v: briefing?.academic?.totalClasses ?? 0, l: "Turmas", icon: BookOpen, href: "/list/classes", theme: "info" as Theme },
    { id: "risk", v: highRisk, l: "Em risco", icon: AlertTriangle, href: "/list/students?risk=alto", theme: "info" as Theme },
  ];

  const quickActions = [
    { label: "Adicionar aluno", icon: UserPlus, href: "/list/students/new" },
    { label: "Adicionar professor", icon: GraduationCap, href: "/list/teachers/new" },
    { label: "Criar turma", icon: LayoutGrid, href: "/list/classes/new" },
    { label: "Enviar comunicado", icon: Megaphone, href: "/list/announcements/new" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full rounded-3xl p-6 md:p-8 overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 shadow-sm"
    >
      <div className="absolute inset-0 z-0 opacity-20"><HeroBackgroundPaths /></div>

      <div className="relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
            Olá, {adminName}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Ano Lectivo {academicYear} · Painel Executivo</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            const isRiskCard = card.id === "risk";
            return (
              <Link key={card.id} href={card.href} className="group block">
                <div className={cn(
                  "flex flex-col p-4 rounded-2xl border shadow-sm transition-all duration-300 group-hover:scale-[1.02] group-active:scale-[0.98]",
                  card.theme === "info"
                    ? "bg-white dark:bg-zinc-900/70 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 backdrop-blur-md"
                    : THEME_STYLES[card.theme]
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className={cn("w-5 h-5", isRiskCard && isHighRisk ? "text-rose-500" : "opacity-70")} />
                      {isRiskCard && isHighRisk && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>
                    <ChevronRight size={14} className="opacity-30" />
                  </div>
                  <p className="text-xl font-bold text-zinc-950 dark:text-white tabular-nums">{String(card.v).padStart(2, "0")}</p>
                  <p className="text-[10px] font-semibold mt-1 opacity-70 truncate">{card.l}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-zinc-100 dark:border-white/10 pt-6">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">Ações rápidas</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href} className="flex items-center gap-2 text-xs sm:text-sm font-medium px-4 py-3 rounded-xl bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all border border-zinc-100 dark:border-zinc-700/50 group">
                <a.icon size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="truncate">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}