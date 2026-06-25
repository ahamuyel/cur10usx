"use client";

import {
  PenLine, ClipboardCheck, UserMinus, FilePlus, Clock,
  ClipboardList, FileWarning, UserCheck, CheckCircle2, ChevronRight
} from "lucide-react";
import Link from "next/link";
import HeroBackgroundPaths from "@/components/ui/HeroBackgroundPaths";
import { cn } from "@/lib/utils";

// Estilos partilhados por tema — evita repetir a mesma string Tailwind em cada card
const THEME_STYLES = {
  info: "bg-blue-50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 hover:border-blue-300",
  warning: "bg-amber-50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:border-amber-300",
  danger: "bg-rose-50 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 hover:border-rose-300",
  success: "bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400",
} as const;

type Theme = keyof typeof THEME_STYLES;

interface Lesson {
  id: string;
  subject: string;
  className: string;
  startTime: string;
  endTime: string;
  status: "completed" | "in_progress" | "upcoming" | "cancelled";
}

interface TeacherHeroProps {
  data: {
    teacher: { name: string };
    summary: {
      totalStudents: number;
      totalClasses: number;
      totalExamsToGrade: number;
      studentsAtRisk: number;
      unjustifiedAbsences: number;
    };
    upcomingLessons: Lesson[];
  };
}

export default function TeacherHero({ data }: TeacherHeroProps) {
  const isExamsInteractive = data.summary.totalExamsToGrade > 0;
  const isRiskInteractive = data.summary.studentsAtRisk > 0;
  const isAbsencesInteractive = data.summary.unjustifiedAbsences > 0;

  const cards: {
    id: string;
    v: number;
    l: string;
    desc: string;
    icon: typeof Clock;
    href: string;
    clickable: boolean;
    theme: Theme;
  }[] = [
    {
      id: "aulas",
      v: data.upcomingLessons?.length ?? 0,
      l: "Aulas hoje",
      desc: "Ver agenda letiva",
      icon: Clock,
      href: "/list/lessons",
      clickable: true,
      theme: "info",
    },
    {
      id: "exames",
      v: data.summary.totalExamsToGrade,
      l: isExamsInteractive ? "Por corrigir" : "Exames em dia",
      desc: isExamsInteractive ? `${data.summary.totalExamsToGrade} pendente(s)` : "Tudo corrigido",
      icon: isExamsInteractive ? ClipboardList : CheckCircle2,
      href: "/list/exams",
      clickable: isExamsInteractive,
      theme: isExamsInteractive ? "warning" : "success",
    },
    {
      id: "risco",
      v: data.summary.studentsAtRisk,
      l: isRiskInteractive ? "Alunos em risco" : "Sem riscos",
      desc: isRiskInteractive ? `${data.summary.studentsAtRisk} identificado(s)` : "Parâmetros normais",
      icon: isRiskInteractive ? UserMinus : UserCheck,
      href: "/dashboard/teacher/at-risk-students",
      clickable: isRiskInteractive,
      theme: isRiskInteractive ? "danger" : "success",
    },
    {
      id: "presencas",
      v: data.summary.unjustifiedAbsences,
      l: isAbsencesInteractive ? "Faltas p/ justificar" : "Faltas em dia",
      desc: isAbsencesInteractive ? `${data.summary.unjustifiedAbsences} por rever` : "Tudo justificado",
      icon: isAbsencesInteractive ? FileWarning : CheckCircle2,
      href: "/list/justifications",
      clickable: isAbsencesInteractive,
      theme: isAbsencesInteractive ? "warning" : "success",
    },
  ];

  // Apenas o que cria/regista algo num clique. Navegação (turmas, relatórios,
  // calendário) fica fora — isso é trabalho do sidebar, não da zona "hoje".
  // Risco e justificações já têm caminho direto pelos cards acima, por isso
  // não são repetidos aqui.
  const quickActions = [
    { label: "Lançar nota", icon: PenLine, href: "/list/results/new" },
    { label: "Registar presença", icon: ClipboardCheck, href: "/list/attendance/mark" },
    { label: "Justificar falta", icon: FileWarning, href: "/list/attendance/justify" },
    { label: "Criar avaliação", icon: FilePlus, href: "/list/exams/new" },
  ];

  return (
    <div className="relative w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-30 pointer-events-none">
        <HeroBackgroundPaths />
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Saudação e contexto */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Boa tarde, Prof. {data.teacher.name}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {data.summary.totalStudents} alunos · {data.summary.totalClasses} turmas ativas
          </p>
        </div>

        {/* Indicadores do dia */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            const content = (
              <div className={cn("group flex flex-col p-5 rounded-2xl border transition-all duration-200 h-full", THEME_STYLES[card.theme])}>
                <div className="flex items-center justify-between w-full mb-3">
                  <Icon size={18} className="opacity-80" />
                  {card.clickable && <ChevronRight size={14} className="opacity-50" />}
                </div>
                <p className="text-2xl font-semibold tabular-nums tracking-tight">
                  {String(card.v).padStart(2, "0")}
                </p>
                <p className="text-xs font-semibold mt-1 opacity-90">{card.l}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{card.desc}</p>
              </div>
            );

            return card.clickable ? (
              <Link key={card.id} href={card.href} className="block hover:scale-[1.02] active:scale-[0.98] transition-transform">
                {content}
              </Link>
            ) : (
              <div key={card.id}>{content}</div>
            );
          })}
        </div>

        {/* Aulas de hoje */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mb-8">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-300 mb-4">Aulas de hoje</p>
          {!data.upcomingLessons || data.upcomingLessons.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
              <p className="text-sm font-semibold text-zinc-400">Nenhuma aula hoje</p>
              <p className="text-xs text-zinc-400 mt-1">Aproveita para preparar materiais e planear avaliações.</p>
            </div>
          ) : (
            data.upcomingLessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between py-4 border-b last:border-0 border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-semibold text-zinc-500 w-24">{lesson.startTime}</span>
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{lesson.subject}</span>
                </div>
                {lesson.status === "in_progress" ? (
                  <Link href={`/list/attendance/mark?lessonId=${lesson.id}`} className="text-xs font-semibold text-amber-600 hover:underline">
                    Marcar presença (em curso)
                  </Link>
                ) : lesson.status === "upcoming" ? (
                  <Link href={`/list/attendance/mark?lessonId=${lesson.id}`} className="text-xs font-semibold text-violet-600 hover:underline">
                    Marcar presença
                  </Link>
                ) : (
                  <span className="text-xs font-semibold text-emerald-600">Aula concluída</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Ações rápidas */}
        {/* <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-300 mb-4">Ações rápidas</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-[0.98]"
              >
                <a.icon size={16} /> {a.label}
              </Link>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
}