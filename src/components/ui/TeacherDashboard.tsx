"use client";

import { useEffect, useState, useMemo } from "react";
import { Loader2, AlertCircle, BarChart3, BookOpen, Users, Target, TrendingUp, TrendingDown, GraduationCap, Sparkles, FileText, Clock, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard, SectionCard, SummaryBadge,
} from "@/components/dashboard/shared"

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
    if (!data) return []
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = []
    const s = data.summary
    if (s.studentsAtRisk > 0) items.push({ type: "critical", title: `${s.studentsAtRisk} alunos em risco`, description: "Alunos com desempenho crítico que precisam de atenção imediata." })
    if (s.unjustifiedAbsences > 0) items.push({ type: "warning", title: `${s.unjustifiedAbsences} faltas injustificadas`, description: "Faltas por justificar no sistema." })
    if (s.totalExamsToGrade > 0) items.push({ type: "warning", title: `${s.totalExamsToGrade} avaliações por corrigir`, description: "Correções pendentes que aguardam lançamento." })
    if (items.length === 0) items.push({ type: "success", title: "Tudo dentro do esperado", description: "Nenhum alerta pendente." })
    return items.slice(0, 4)
  }, [data])

  if (error) return <DashboardError error={error} />;
  if (!data) return <DashboardLoader />;

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const s = data.summary
  const trend = s.generalAverage - 12
  const trendUp = trend > 0

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: <BarChart3 size={14} /> },
    { id: "classes", label: "Turmas", icon: <BookOpen size={14} />, badge: s.totalClasses },
    { id: "assessments", label: "Avaliações", icon: <FileText size={14} />, badge: s.totalExamsToGrade || undefined },
    { id: "lessons", label: "Aulas", icon: <Calendar size={14} />, badge: data.upcomingLessons.length || undefined },
    { id: "insights", label: "Insights", icon: <Target size={14} />, badge: s.studentsAtRisk || undefined },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Hero */}
      <div className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
              <GraduationCap size={14} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Dashboard do Professor</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {greeting}, <span className="text-zinc-500 dark:text-zinc-400 font-medium">Prof. {data.teacher.name.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {s.totalClasses} turma{s.totalClasses > 1 ? "s" : ""} · {s.totalStudents} aluno{s.totalStudents > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <SummaryBadge label="Média Geral" value={s.generalAverage.toFixed(1)} color={s.generalAverage >= 14 ? "emerald" : s.generalAverage >= 10 ? "amber" : "rose"} />
              <SummaryBadge label="Assiduidade" value={`${s.attendanceRate}%`} color={s.attendanceRate >= 80 ? "emerald" : s.attendanceRate >= 60 ? "amber" : "rose"} />
              <SummaryBadge label="Alunos" value={`${s.totalStudents}`} color="blue" />
              <SummaryBadge label="Avaliações" value={`${s.assessmentsCompleted}`} color="violet" />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <HeroMetric icon={<BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />} label="Média" value={s.generalAverage.toFixed(1)} />
            <HeroMetric icon={<Users size={18} className="text-indigo-600 dark:text-indigo-400" />} label="Turmas" value={`${s.totalClasses}`} subtitle={`${s.totalStudents} alunos`} />
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, i) => <InsightCard key={i} {...insight} />)}
        </div>
      )}

      {/* Tabs */}
      <DashboardTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Overview */}
      <DashboardTabContent id="overview" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={4}>
            <MetricCard icon={<Users size={18} />} label="Total Alunos" value={`${s.totalStudents}`} subtitle={`${s.totalClasses} turmas`} color="blue" />
            <MetricCard icon={<FileText size={18} />} label="Por Corrigir" value={`${s.totalExamsToGrade}`} subtitle="Avaliações pendentes" color={s.totalExamsToGrade > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<AlertCircle size={18} />} label="Alunos em Risco" value={`${s.studentsAtRisk}`} subtitle="Precisam de atenção" color={s.studentsAtRisk > 0 ? "rose" : "emerald"} />
            <MetricCard icon={<TrendingUp size={18} />} label="Média Geral" value={s.generalAverage.toFixed(1)} subtitle="de 20 valores" trend={trend} trendUp={trendUp} color={s.generalAverage >= 14 ? "emerald" : s.generalAverage >= 10 ? "amber" : "rose"} />
          </MetricCardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 xl:col-span-8">
              <TeacherClassPerformance data={data} />
            </div>
            <div className="lg:col-span-5 xl:col-span-4">
              <TeacherAssessmentCenter data={data} />
            </div>
          </div>

          <TeacherHero data={data} />
        </div>
      </DashboardTabContent>

      {/* Classes */}
      <DashboardTabContent id="classes" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<Users size={18} />} label="Total Turmas" value={`${s.totalClasses}`} subtitle="Atribuídas" color="blue" />
            <MetricCard icon={<TrendingUp size={18} />} label="Média Geral" value={s.generalAverage.toFixed(1)} color={s.generalAverage >= 14 ? "emerald" : s.generalAverage >= 10 ? "amber" : "rose"} />
            <MetricCard icon={<Sparkles size={18} />} label="Taxa Aprovação" value={`${s.attendanceRate}%`} color={s.attendanceRate >= 80 ? "emerald" : "amber"} />
          </MetricCardGrid>
          <TeacherClassPerformance data={data} />
        </div>
      </DashboardTabContent>

      {/* Assessments */}
      <DashboardTabContent id="assessments" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<FileText size={18} />} label="Por Corrigir" value={`${s.totalExamsToGrade}`} color={s.totalExamsToGrade > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<CheckCircle size={18} />} label="Publicadas" value={`${data.assessments.published}`} color="emerald" />
            <MetricCard icon={<Calendar size={18} />} label="Agendadas" value={`${data.assessments.scheduled}`} color="violet" />
          </MetricCardGrid>
          <TeacherAssessmentCenter data={data} />
        </div>
      </DashboardTabContent>

      {/* Lessons */}
      <DashboardTabContent id="lessons" activeTab={activeTab}>
        <div className="space-y-6">
          <TeacherUpcomingLessons data={data} />
          <TeacherLessonTracker />
        </div>
      </DashboardTabContent>

      {/* Insights */}
      <DashboardTabContent id="insights" activeTab={activeTab}>
        <div className="space-y-6">
          <TeacherAttentionCenter data={data} />
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

function HeroMetric({ icon, label, value, trend, trendUp, subtitle }: any) {
  return (
    <div className="flex-1 md:w-28 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] shadow-sm">{icon}</div>
        {trend !== undefined && (
          <span className={cn("flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md", trendUp ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" : "text-rose-700 bg-rose-500/10 dark:text-rose-400")}>
            {trendUp ? <TrendingUp size={9} className="mr-0.5" /> : <TrendingDown size={9} className="mr-0.5" />}{Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>
      <div className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{value}</div>
      <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
      {subtitle && <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">{subtitle}</div>}
    </div>
  )
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
