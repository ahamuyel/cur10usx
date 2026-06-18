"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, LayoutDashboard, Clock } from "lucide-react";
import AcademicHealthHistoryChart from "./AcademicHealthHistoryChart";
import StudentRiskPanel from "./StudentRiskPanel";
import ClassHealthPanel from "./ClassHealthPanel";
import RecommendationsPanel from "./RecommendationsPanel";
import AttentionArea from "./AttentionArea";
import GeneralIndicators from "./GeneralIndicators";
import PedagogicalInsights from "./PedagogicalInsights";
import EventCalendar from "@/components/ui/EventCalendar";
import Announcements from "@/components/ui/Announcements";

export default function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);
  const [briefing, setBriefing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [historyRes, briefingRes] = await Promise.all([
        fetch("/api/analytics/academic-health/history"),
        fetch("/api/analytics/executive-briefing"),
      ]);

      const briefingData = await briefingRes.json();
      setBriefing(briefingData);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [key, loadDashboardData]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      setKey((k) => k + 1);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={24} className="animate-spin text-primary" />
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
          A consolidar dados executivos...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full overflow-hidden p-0.5">
      {/* HEADER: Identificação Dinâmica da Instituição */}
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20 shrink-0 shadow-2xs">
            <LayoutDashboard
              size={18}
              className="text-primary dark:text-primary-400"
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              {briefing?.schoolInfo?.schoolName || "Centro de Decisão Escolar"}
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
              Ano Lectivo:{" "}
              <span className="text-zinc-600 dark:text-zinc-300 font-semibold">
                {briefing?.schoolInfo?.academicYear || "N/A"}
              </span>{" "}
              • Painel Executivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {briefing?.lastActivity?.label && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
              <Clock size={12} strokeWidth={2.2} />
              <span>{briefing.lastActivity.label}</span>
            </div>
          )}

          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 shadow-3xs transition-all duration-200 active:scale-98 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin text-primary" : "text-zinc-400 dark:text-zinc-500"}
              strokeWidth={2.2}
            />
            <span className="hidden @[380px]:inline">Actualizar Dados</span>
          </button>
        </div>
      </div>

      {/* GRID PRINCIPAL: Layout Assimétrico 75% / 25% */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
        
        {/* COLUNA DA ESQUERDA (Core Analytics) - 75% */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full min-w-0">
          
          {/* Métricas Rápidas perfeitamente integradas no alinhamento */}
          <div className="w-full min-w-0">
            <GeneralIndicators key={`indicators-${key}`} briefing={briefing} />
          </div>

          {/* Triagem de Urgência / Alertas Críticos */}
          <div className="w-full min-w-0">
            <AttentionArea key={`attention-${key}`} briefing={briefing} />
          </div>

          {/* Tendência e Evolução Temporal */}
          <div className="w-full min-w-0 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <AcademicHealthHistoryChart key={`history-${key}`} />
          </div>

          {/* Insights Automatizados */}
          <div className="w-full min-w-0">
            <PedagogicalInsights key={`insights-${key}`} />
          </div>

          {/* Listagens Granulares (Turmas e Alunos em Risco) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            <div className="min-w-0">
              <ClassHealthPanel key={`classes-${key}`} />
            </div>
            <div className="min-w-0">
              <StudentRiskPanel key={`risk-${key}`} />
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA (Feed de Operações Fixo) - 25% */}
        <div className="xl:col-span-1 flex flex-col gap-6 w-full min-w-0 xl:sticky xl:top-6">
          <div className="min-w-0">
            <RecommendationsPanel key={`recs-${key}`} />
          </div>

          {/* Agenda e Comunicados Unificados */}
          <div className="flex flex-col gap-6">
            <EventCalendar key={`calendar-${key}`} />
            <Announcements key={`announcements-${key}`} />
          </div>
        </div>

      </div>
    </div>
  );
}