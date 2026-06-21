"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";

import TeacherHero from "./TeacherHero";
import TeacherAttentionCenter from "./TeacherAttentionCenter";
import TeacherClassPerformance from "./TeacherClassPerformance";
import TeacherAssessmentCenter from "./TeacherAssessmentCenter";
import TeacherUpcomingLessons from "./TeacherUpcomingLessons";
import TeacherStudentInsights from "./TeacherStudentInsights";
import TeacherCalendarExperience from "./TeacherCalendarExperience";
import TeacherAnnouncements from "./TeacherAnnouncements";

export default function TeacherDashboard() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const { data, error } = useTeacherDashboard(teacherId);

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

  if (error) return <DashboardError error={error} />;
  if (!data) return <DashboardLoader />;

  return (
    <div className="w-full space-y-6 pb-16 px-4 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* ZONA 1: Hoje e Ações (Hero fundido com métricas e ações) */}
      <section>
        <TeacherHero data={data} />
      </section>

      {/* ZONA 2: Atenção Imediata */}
      <section>
        <TeacherAttentionCenter data={data} />
      </section>

      {/* ZONA 3: Gestão de Turmas e Avaliações */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8">
          <TeacherClassPerformance data={data} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <TeacherAssessmentCenter data={data} />
        </div>
      </section>

      {/* ZONA 4: Secundário */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <TeacherUpcomingLessons data={data} />
          <TeacherStudentInsights data={data} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <TeacherCalendarExperience /> 
          <TeacherAnnouncements data={data} />
        </div>
      </section>
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