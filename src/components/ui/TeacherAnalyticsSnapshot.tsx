"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeacherDashboardData } from "@/hooks/useTeacherDashboard";

export default function TeacherAnalyticsSnapshot({
  data,
}: {
  data: NonNullable<TeacherDashboardData>;
}) {
  const { summary } = data;

  const mainMetrics = [
    {
      label: "Média Geral",
      value: summary.generalAverage.toFixed(1),
      suffix: "/20",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Alunos em Risco",
      value: summary.studentsAtRisk,
      icon: AlertTriangle,
      color:
        summary.studentsAtRisk > 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-emerald-600 dark:text-emerald-400",
    },
  ];

  const secondaryMetrics = [
    { label: "Total Alunos", value: summary.totalStudents },
    { label: "Presença", value: `${summary.attendanceRate}%` },
    { label: "Avaliações", value: summary.assessmentsCompleted },
  ];

  return (
    <div className="bg-card border border-border rounded-card p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 size={16} className="text-muted-foreground" />
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Resumo Executivo
        </h3>
      </div>

      <div className="flex flex-col gap-6">
        {/* Destaques: Grid responsivo (1 col no mobile, 2 no sm+) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mainMetrics.map((m) => (
            <div
              key={m.label}
              className="bg-muted p-5 rounded-card border border-border transition-colors"
            >
              <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <m.icon size={14} />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {m.label}
                </span>
              </div>
              <div
                className={cn(
                  "text-2xl sm:text-3xl font-black tabular-nums",
                  m.color,
                )}
              >
                {m.value}
                <span className="text-sm font-medium text-muted-foreground ml-1">
                  {m.suffix}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Suporte: Grid de colunas que vira lista ou linha dependendo da largura */}
        <div className="grid grid-cols-3 gap-2 py-4 border-t border-border">
          {secondaryMetrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center sm:items-baseline sm:flex-row gap-0.5 sm:gap-2 px-2"
            >
              <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {m.label}
              </span>
              <span className="text-xs sm:text-sm font-bold text-foreground tabular-nums">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
