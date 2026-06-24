"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { Loader2, AlertCircle } from "lucide-react";

// Imports de componentes (assumindo que já existem nos seus paths)
import StudentHero from "./StudentHero";
import StudentDailyFocus from "./StudentDailyFocus";
import StudentPrioritySubjects from "./StudentPrioritySubjects";
import StudentPerformanceBreakdown from "./StudentPerformanceBreakdown";
import StudentNavigation from "./StudentNavigation";

// Lazy loading para componentes pesados (gráficos/calendários)
const StudentCalendarExperience = lazy(() => import("./StudentCalendarExperience"));
const StudentAcademicAgenda = lazy(() => import("./StudentAcademicAgenda"));
const StudentAcademicJourney = lazy(() => import("./StudentAcademicJourney"));
const StudentActivityChart = lazy(() => import("./StudentActivityChart"));
const StudentInsights = lazy(() => import("./StudentInsights"));

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/students/${studentId}/dashboard`);
        if (!res.ok) throw new Error("Falha ao carregar dados");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Não foi possível carregar o ecossistema do estudante.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) return <DashboardLoader />;
  if (error || !data) return <DashboardError error={error} />;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <section className="relative">
        <StudentHero
          name={data.student.name}
          average={data.generalAverage}
          previousAverage={data.previousAverage}
          classRank={data.classRank}
          classSize={data.classSize}
          statusPhrase={getDerivedStatusPhrase(data)}
          targetAverage={data.targetAverage}
        />
        <div className="mt-4 flex justify-end">
          <StudentNavigation studentId={studentId} />
        </div>
      </section>

      {/* CORE PERFORMANCE GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <StudentDailyFocus {...data} />
        </div>
        <div className="lg:col-span-4">
          <StudentPrioritySubjects 
            subjectAverages={data.subjectAverages} 
            subjectLastScores={data.subjectLastScores} 
            targetAverage={data.targetAverage} 
          />
        </div>
      </section>

      {/* ANALYTICS LAYER */}
      <section>
        <StudentPerformanceBreakdown
          subjectAverages={data.subjectAverages}
          subjectTrends={data.subjectTrends}
          generalAverage={data.generalAverage}
          previousAverage={data.previousAverage}
        />
      </section>

      {/* DYNAMIC MODULES (SUSPENSE) */}
      <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-zinc-100" />}>
        <section>
          <StudentCalendarExperience />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><StudentAcademicAgenda exams={data.upcomingExams} assignments={data.upcomingAssignments} /></div>
          <div className="lg:col-span-4"><StudentAcademicJourney trimesters={data.trimesterEvolution} /></div>
          <div className="lg:col-span-3"><StudentActivityChart results={data.recentResults} /></div>
        </section>

        <section>
          <StudentInsights
            scoreDistribution={data.scoreDistribution}
            totalAbsences={data.totalAbsences}
            absencesBySubject={data.absencesBySubject}
            attendanceByMonth={data.attendanceByMonth}
          />
        </section>
      </Suspense>
    </div>
  );
}

// Helper para manter o componente principal limpo
function getDerivedStatusPhrase(data: any) {
  const trend = data.generalAverage - data.previousAverage;
  if (data.totalAbsences >= 5) return `Atenção: ${data.totalAbsences} faltas registadas.`;
  if (data.subjectsNeedingAttention.length > 0) return `${data.subjectsNeedingAttention[0]} precisa de foco imediato.`;
  if (trend > 1) return "Excelente evolução académica!";
  return "Desempenho estável, continua o foco.";
}

function DashboardLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sincronizando dados...</p>
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="max-w-md flex flex-col items-center gap-3">
        <AlertCircle className="text-rose-500" size={32} />
        <h2 className="text-sm font-bold text-zinc-900">Erro de Carregamento</h2>
        <p className="text-xs text-zinc-500">{error}</p>
      </div>
    </div>
  );
}