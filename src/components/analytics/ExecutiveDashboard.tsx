"use client";

import { useState, useEffect } from "react";
import { RefreshCw, LayoutDashboard } from "lucide-react";
import AcademicHealthScore from "@/components/ui/AcademicHealthScore";
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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [historyRes, briefingRes] = await Promise.all([
          fetch("/api/analytics/academic-health/history"),
          fetch("/api/analytics/executive-briefing")
        ]);
        
        const historyData = await historyRes.json();
        const briefingData = await briefingRes.json();
        
        setBriefing(briefingData);

        if (!historyData.history || historyData.history.length === 0) {
          await fetch("/api/analytics/academic-health/snapshot", {
            method: "POST",
          });
          setKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadData();
  }, [key]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/analytics/academic-health/snapshot", {
        method: "POST",
      });
      setKey((k) => k + 1);
    } catch {
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full overflow-hidden p-1">
      {/* HEADER: Identificação da Escola e Ano Lectivo */}
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
              {briefing?.schoolInfo?.academicYear || "Carregando ano lectivo..."} • Gestão Académica
            </p>
          </div>
        </div>

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

      {/* SECÇÃO 1: KPIs PRINCIPAIS (Aproveitamento, Assiduidade, Risco, Turmas) */}
      <div className="w-full min-w-0">
        <GeneralIndicators key={`indicators-${key}`} briefing={briefing} />
      </div>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
        
        {/* COLUNA DA ESQUERDA (Analytics e Tabelas) - 75% da Tela */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full min-w-0">

          {/* Linha: Acções Prioritárias (Triagem de Urgência) */}
          <div className="w-full min-w-0">
             <AttentionArea key={`attention-${key}`} briefing={briefing} />
          </div>

          {/* Linha: Evolução Histórica (Gráfico de Aproveitamento) */}
          <div className="w-full min-w-0 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
            <AcademicHealthHistoryChart key={`history-${key}`} />
          </div>

          {/* Linha: Insights Pedagógicos (Destaques Automáticos) */}
          <div className="w-full min-w-0">
            <PedagogicalInsights key={`insights-${key}`} />
          </div>

          {/* Linha: Detalhes por Turma e Aluno (Com motivos de intervenção) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            <div className="min-w-0">
              <ClassHealthPanel key={`classes-${key}`} />
            </div>
            <div className="min-w-0">
              <StudentRiskPanel key={`risk-${key}`} />
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA (Recomendações, Calendário e Operações) - 25% da Tela */}
        <div className="xl:col-span-1 flex flex-col gap-6 w-full min-w-0 xl:sticky xl:top-6">
          <div className="min-w-0">
            <RecommendationsPanel key={`recs-${key}`} />
          </div>
          
          {/* Operações Escolares e Agenda */}
          <div className="space-y-6 opacity-90 hover:opacity-100 transition-opacity">
            <EventCalendar key={`calendar-${key}`} />
            <Announcements key={`announcements-${key}`} />
          </div>
        </div>

      </div>
    </div>
  );
}