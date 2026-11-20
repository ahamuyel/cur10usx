"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, Plus, Users, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

// Importações de componentes
import AdminHero from "./AdminHero";
import SchoolHealthOverview from "./SchoolHealthOverview";
import AttentionArea from "./AttentionArea";
import PedagogicalWatch from "./PedagogicalWatch";
import AcademicHealthHistoryChart from "./AcademicHealthHistoryChart";
import EventCalendar from "@/components/ui/EventCalendar";
import Announcements from "@/components/ui/Announcements";
import LessonValidationQueue from "./LessonValidationQueue";

export default function ExecutiveDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        fetch("/api/analytics/executive-briefing"),
        fetch("/api/lessons/records?status=PENDING")
      ]);

      const json = await analyticsRes.json();
      setData(json);

      if (pendingRes.ok) {
        const pendingList = await pendingRes.json();
        setPendingCount(pendingList.length || 0);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const healthStats = useMemo(() => data ? {
    aproveitamento: `${data.academic?.aproveitamento ?? 0}%`,
    assiduidade: `${data.academic?.assiduidade ?? 0}%`,
    risco: data.risk?.totalAtRisk ?? 0,
    turmasAlerta: data.classes?.totalUnderMonitoring ?? 0,
  } : null, [data]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-400">A consolidar...</div>;

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Header e Ações */}
      <div className="flex flex-col gap-4">
        <AdminHero briefing={data} />
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 flex flex-col gap-6">
          <SchoolHealthOverview stats={healthStats} />
          <AttentionArea briefing={data} />
          <PedagogicalWatch students={data?.risk?.students} />

          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-6">Evolução Pedagógica</h3>
            <AcademicHealthHistoryChart />
          </div>
        </div>

        {/* Sidebar Lateral */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <EventCalendar />
          {pendingCount > 0 && <LessonValidationQueue />}
          <Announcements />
          
          <button
            onClick={() => { setRefreshing(true); loadData(); }}
            className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 flex items-center justify-center gap-1 transition-colors"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> 
            Actualizar agora
          </button>
        </div>
      </div>
    </div>
  );
}
