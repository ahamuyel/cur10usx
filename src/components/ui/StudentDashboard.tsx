"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, LayoutGrid, BarChart3 } from "lucide-react";

import StudentHero from "./StudentHero";
import StudentPerformanceBreakdown from "./StudentPerformanceBreakdown";
import StudentActionHub from "./StudentActionHub";
import StudentSubjectCards from "./StudentSubjectCards";
import StudentAcademicJourney from "./StudentAcademicJourney";
import StudentAcademicAgenda from "./StudentAcademicAgenda";
import StudentCalendarExperience from "./StudentCalendarExperience";
import StudentActivityChart from "./StudentActivityChart";

// --- LOGICA DE STATUS (ADICIONADA AQUI) ---
function getStatusPhrase(
  average: number,
  previousAverage: number,
  attendanceWarning: boolean,
  subjectsNeedingAttention: string[],
): string {
  const trend = average - previousAverage;
  const hasIssues = attendanceWarning || subjectsNeedingAttention.length > 0;

  if (hasIssues) {
    if (attendanceWarning && subjectsNeedingAttention.length > 0)
      return `Assiduidade abaixo da meta e ${subjectsNeedingAttention.length} disciplina${subjectsNeedingAttention.length > 1 ? "s" : ""} com média crítica.`;
    if (attendanceWarning)
      return `Assiduidade crítica — abaixo do recomendado.`;
    return `${subjectsNeedingAttention.join(", ")} ${subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atenção imediata.`;
  }

  if (trend > 0.5 && average >= 14) return "Excelente evolução! Mantém o ritmo. 🚀";
  if (trend > 0) return "Estás a melhorar — bom trabalho! Continua assim.";
  return "Desempenho estável. Foca-te nas próximas metas para subir a média.";
}

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/students/${studentId}/dashboard`);
        if (!res.ok) throw new Error("Dados indisponíveis");
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

  // Agora a função é reconhecida pelo escopo
  const statusPhrase = getStatusPhrase(
    data.generalAverage,
    data.previousAverage,
    data.attendanceWarning,
    data.subjectsNeedingAttention
  );

  const totalScores = Object.values(data.scoreDistribution).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-16 px-1 max-w-[1600px] mx-auto">
      <section>
        <StudentHero
          name={data.student.name}
          average={data.generalAverage}
          previousAverage={data.previousAverage}
          // classInfo={data.student.class ? `${data.student.class.grade}ª Classe · ${data.student.class.name}` : undefined}
          // statusPhrase={statusPhrase}
          classRank={data.classRank}
          classSize={data.classSize}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <StudentPerformanceBreakdown 
            subjectAverages={data.subjectAverages} 
            subjectLastScores={data.subjectLastScores} 
            generalAverage={data.generalAverage}
            previousAverage={data.previousAverage}
          />
        </div>
        <div className="lg:col-span-4">
          <StudentActionHub
            average={data.generalAverage}
            attendancePercent={data.attendancePercent}
            attendanceWarning={data.attendanceWarning}
            pendingSubmissions={data.pendingSubmissions}
            subjectsNeedingAttention={data.subjectsNeedingAttention}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          <LayoutGrid size={14} /> Métricas por Disciplina
        </h2>
        <StudentSubjectCards subjects={data.subjectAverages} subjectLastScores={data.subjectLastScores} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4"><StudentAcademicJourney trimesters={data.trimesterEvolution} /></div>
        <div className="xl:col-span-8"><StudentAcademicAgenda exams={data.upcomingExams} assignments={data.upcomingAssignments} /></div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8"><StudentActivityChart results={data.recentResults} /></div>
        <div className="lg:col-span-4"><ScoreDistribution distribution={data.scoreDistribution} total={totalScores} /></div>
      </section>
      
      <StudentCalendarExperience />
    </div>
  );
}

function ScoreDistribution({ distribution, total }: { distribution: any, total: number }) {
  const cats = [
    { label: "Excelente", val: distribution.excelente, color: "bg-emerald-500" },
    { label: "Bom", val: distribution.bom, color: "bg-blue-500" },
    { label: "Suficiente", val: distribution.suficiente, color: "bg-amber-500" },
    { label: "Insuficiente", val: distribution.insuficiente, color: "bg-rose-500" },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 h-full">
      <h3 className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">
        <BarChart3 size={14} /> Distribuição de Notas
      </h3>
      <div className="space-y-4">
        {cats.map((c) => (
          <div key={c.label} className="group flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", c.color)} />
            <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1">{c.label}</span>
            <div className="w-full max-w-[80px] h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={cn("h-full", c.color)} style={{ width: `${total > 0 ? (c.val/total)*100 : 0}%` }} />
            </div>
            <span className="text-xs font-bold tabular-nums w-6 text-right">{c.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">A carregar ecossistema...</span>
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-900/50">
        <AlertCircle className="text-rose-500" size={18} />
        <span className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</span>
      </div>
    </div>
  );
}