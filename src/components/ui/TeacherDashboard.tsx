"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2, AlertCircle, BarChart3, BookOpen, Users, Target,
  TrendingUp, TrendingDown, Sparkles, FileText, Calendar, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard,
} from "@/components/dashboard/shared";

import TeacherHero from "./TeacherHero";
import TeacherAttentionCenter from "./TeacherAttentionCenter";
import TeacherClassPerformance from "./TeacherClassPerformance";
import TeacherAssessmentCenter from "./TeacherAssessmentCenter";
import TeacherUpcomingLessons from "./TeacherUpcomingLessons";
import TeacherStudentInsights from "./TeacherStudentInsights";
import TeacherCalendarExperience from "./TeacherCalendarExperience";
import TeacherAnnouncements from "./TeacherAnnouncements";
import TeacherLessonTracker from "../teacher/TeacherLessonTracker";

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const { data, error } = useTeacherDashboard(teacherId);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadTeacher() {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json.teacher?.id) setTeacherId(json.teacher.id);
      } catch {}
    }
    loadTeacher();
  }, []);

  const insights = useMemo(() => {
    if (!data) return [];
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = [];
    const s = data.summary;
    if (s.studentsAtRisk > 0)
      items.push({ type: "critical", title: `${s.studentsAtRisk} alunos em risco`, description: "Alunos com desempenho crítico que precisam de atenção imediata." });
    if (s.unjustifiedAbsences > 0)
      items.push({ type: "warning", title: `${s.unjustifiedAbsences} faltas injustificadas`, description: "Faltas por justificar no sistema." });
    if (s.totalExamsToGrade > 0)
      items.push({ type: "warning", title: `${s.totalExamsToGrade} avaliações por corrigir`, description: "Correções pendentes que aguardam lançamento." });
    if (items.length === 0)
      items.push({ type: "success", title: "Tudo dentro do esperado", description: "Nenhum alerta pendente." });
    return items.slice(0, 4);
  }, [data]);

  if (error) return <DashboardError error={error} />;
  if (!data) return <DashboardLoader />;

  const s = data.summary;
  const trend = s.generalAverage - 12;
  const trendUp = trend > 0;

  const tabs = [
    { id: "overview",    label: "Visão Geral", icon: <BarChart3 size={14} /> },
    { id: "classes",     label: "Turmas",      icon: <BookOpen size={14} />,  badge: s.totalClasses },
    { id: "assessments", label: "Avaliações",  icon: <FileText size={14} />,  badge: s.totalExamsToGrade || undefined },
    { id: "lessons",     label: "Aulas",       icon: <Calendar size={14} />,  badge: data.upcomingLessons.length || undefined },
    { id: "insights",    label: "Insights",    icon: <Target size={14} />,    badge: s.studentsAtRisk || undefined },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">

      {/* ZONA 1: Hero */}
      <TeacherHero data={data} />

      {/* ZONA 2: Atenção Imediata */}
      <TeacherAttentionCenter data={data} />

      {/* Insights rápidos */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, i) => <InsightCard key={i} {...insight} />)}
        </div>
      )}

      {/* Tabs */}
      <DashboardTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── VISÃO GERAL ─────────────────────────────────────── */}
      <DashboardTabContent id="overview" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={4}>
            <MetricCard icon={<Users size={18} />}     label="Total Alunos"  value={`${s.totalStudents}`}          subtitle={`${s.totalClasses} turmas`}        color="blue" />
            <MetricCard icon={<FileText size={18} />}  label="Por Corrigir"  value={`${s.totalExamsToGrade}`}      subtitle="Avaliações pendentes"              color={s.totalExamsToGrade > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<AlertCircle size={18} />} label="Alunos em Risco" value={`${s.studentsAtRisk}`}    subtitle="Precisam de atenção"               color={s.studentsAtRisk > 0 ? "rose" : "emerald"} />
            <MetricCard icon={<TrendingUp size={18} />} label="Média Geral"  value={s.generalAverage.toFixed(1)}   subtitle="de 20 valores" trend={trend} trendUp={trendUp} color={s.generalAverage >= 14 ? "emerald" : s.generalAverage >= 10 ? "amber" : "rose"} />
          </MetricCardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <TeacherClassPerformance data={data} />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <TeacherAssessmentCenter data={data} />
            </div>
          </div>
        </div>
      </DashboardTabContent>

      {/* ── TURMAS ───────────────────────────────────────────── */}
      <DashboardTabContent id="classes" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<Users size={18} />}    label="Total Turmas"    value={`${s.totalClasses}`}            subtitle="Atribuídas"  color="blue" />
            <MetricCard icon={<TrendingUp size={18} />} label="Média Geral"   value={s.generalAverage.toFixed(1)}    color={s.generalAverage >= 14 ? "emerald" : s.generalAverage >= 10 ? "amber" : "rose"} />
            <MetricCard icon={<Sparkles size={18} />} label="Taxa Aprovação"  value={`${s.attendanceRate}%`}         color={s.attendanceRate >= 80 ? "emerald" : "amber"} />
          </MetricCardGrid>
          <TeacherClassPerformance data={data} />
        </div>
      </DashboardTabContent>

      {/* ── AVALIAÇÕES ───────────────────────────────────────── */}
      <DashboardTabContent id="assessments" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<FileText size={18} />}    label="Por Corrigir" value={`${s.totalExamsToGrade}`}     color={s.totalExamsToGrade > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<CheckCircle size={18} />} label="Publicadas"   value={`${data.assessments.published}`} color="emerald" />
            <MetricCard icon={<Calendar size={18} />}    label="Agendadas"    value={`${data.assessments.scheduled}`} color="violet" />
          </MetricCardGrid>
          <TeacherAssessmentCenter data={data} />
        </div>
      </DashboardTabContent>

      {/* ── AULAS ────────────────────────────────────────────── */}
      <DashboardTabContent id="lessons" activeTab={activeTab}>
        <div className="space-y-6">
          <TeacherUpcomingLessons data={data} />
          <TeacherLessonTracker />
        </div>
      </DashboardTabContent>

      {/* ── INSIGHTS ─────────────────────────────────────────── */}
      <DashboardTabContent id="insights" activeTab={activeTab}>
        <div className="space-y-6">
          <TeacherStudentInsights data={data} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeacherAnnouncements data={data} />
            <TeacherCalendarExperience />
          </div>
        </div>
      </DashboardTabContent>

    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">Carregando painel...</p>
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center py-24 min-h-[60vh]">
      <div className="flex items-center gap-3 text-rose-600 bg-rose-50 px-6 py-4 rounded-3xl border border-rose-100">
        <AlertCircle size={18} />
        <span className="text-xs font-semibold">{error}</span>
      </div>
    </div>
  );
}