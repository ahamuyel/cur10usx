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
import EventCalendar from "@/components/ui/EventCalendar";
import Announcements from "@/components/ui/Announcements";

export default function ExecutiveDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const ensureInitialData = async () => {
      try {
        const res = await fetch("/api/analytics/academic-health/history");
        const data = await res.json();
        if (!data.history || data.history.length === 0) {
          await fetch("/api/analytics/academic-health/snapshot", {
            method: "POST",
          });
          setKey((k) => k + 1);
        }
      } catch (err) {
        console.error("Failed to ensure initial data:", err);
      }
    };
    ensureInitialData();
  }, []);

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
    // Mudança: overflow-hidden garante que nada saia da tela principal
    <div className="flex flex-col gap-6 w-full overflow-hidden">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-5 gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon Container com efeito Glassmorphism usando a tua cor Primary */}
          <div className="w-10 h-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20 shrink-0 shadow-2xs">
            <LayoutDashboard
              size={18}
              className="text-primary dark:text-primary-400"
              strokeWidth={2.2}
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 truncate">
              Centro de Decisão Escolar
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
              Painel Executivo de Gestão Académica
            </p>
          </div>
        </div>

        {/* Botão de Refresh Otimizado para Interação */}
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800 shadow-3xs transition-all duration-200 active:scale-98 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw
            size={13}
            className={
              refreshing
                ? "animate-spin text-primary"
                : "text-zinc-400 dark:text-zinc-500"
            }
            strokeWidth={2.2}
          />
          <span className="hidden @[380px]:inline">Actualizar Dados</span>
        </button>
      </div>

      {/* GRID PRINCIPAL: Blocado com min-w-0 para evitar distorções de gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start w-full">
        {/* COLUNA DA ESQUERDA (Analytics/Gráficos) - min-w-0 é CRÍTICO aqui */}
        <div className="xl:col-span-3 flex flex-col gap-6 w-full min-w-0">
          {/* Linha 1: Score + Indicadores */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
            <div className="lg:col-span-2 min-w-0 flex flex-col">
              <AcademicHealthScore key={`score-${key}`} />
            </div>
            <div className="min-w-0">
              <GeneralIndicators />
            </div>
          </div>

          {/* Linha 2: O Gráfico Histórico isolado em um container rígido */}
          <div className="w-full min-w-0 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
            <AcademicHealthHistoryChart key={`history-${key}`} />
          </div>

          {/* Linha 3: Tabelas/Painéis detalhados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            <div className="min-w-0">
              <ClassHealthPanel key={`classes-${key}`} />
            </div>
            <div className="min-w-0">
              <StudentRiskPanel key={`risk-${key}`} />
            </div>
          </div>
        </div>

        {/* COLUNA DA DIREITA (Ações / Alertas) */}
        <div className="xl:col-span-1 flex flex-col gap-6 w-full min-w-0 xl:sticky xl:top-6">
          <div className="min-w-0">
            <AttentionArea key={`attention-${key}`} />
          </div>
          <div className="min-w-0">
            <RecommendationsPanel key={`recs-${key}`} />
          </div>
        </div>
      </div>

      {/* RODAPÉ (Calendário e Avisos) */}
      <hr className="border-zinc-200 dark:border-zinc-800 my-2" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <div className="min-w-0 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Calendário Institucional
          </h3>
          <EventCalendar />
        </div>
        <div className="min-w-0 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
            Comunicados e Avisos
          </h3>
          <Announcements />
        </div>
      </div>
    </div>
  );
}
