"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertCircle, LayoutGrid, BarChart3 } from "lucide-react";

import StudentHero from "./StudentHero";
import StudentPerformanceBreakdown from "./StudentPerformanceBreakdown";
import StudentActionHub from "./StudentActionHub";
import StudentSubjectCards from "./StudentSubjectCards";
import StudentAcademicJourney from "./StudentAcademicJourney";
import StudentActivityChart from "./StudentActivityChart";
import StudentAcademicAgenda from "./StudentAcademicAgenda";
import StudentCalendarExperience from "./StudentCalendarExperience";

type DashboardData = {
  student: {
    id: string;
    name: string;
    class: { name: string; grade: number } | null;
  };
  generalAverage: number;
  previousAverage: number;
  classRank?: number;
  classSize?: number;
  attendancePercent: number;
  attendanceWarning: boolean;
  pendingSubmissions: number;
  subjectsNeedingAttention: string[];

  subjectAverages: {
    subjectId: string;
    subjectName: string;
    average: number;
    count: number;
  }[];

  subjectLastScores: Record<
    string,
    { score: number; type: string; date: string }
  >;

  scoreDistribution: {
    excelente: number;
    bom: number;
    suficiente: number;
    insuficiente: number;
  };

  trimesterEvolution: {
    label: string;
    subjects: Record<string, number>;
    generalAverage: number;
  }[];

  recentResults: {
    id: string;
    subjectName: string;
    score: number;
    type: string;
    date: string;
    trimester: string | null;
  }[];

  upcomingExams: {
    id: string;
    title: string;
    subjectName: string;
    date: string;
  }[];

  upcomingAssignments: {
    id: string;
    title: string;
    subjectName: string;
    dueDate: string;
  }[];
};

interface Props {
  studentId: string;
}

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
      return `Assiduidade abaixo da meta escolar e ${subjectsNeedingAttention.length} disciplina${subjectsNeedingAttention.length > 1 ? "s" : ""} com média crítica. Precisas de agir.`;
    if (attendanceWarning)
      return `Assiduidade crítica em ${average.toFixed(0)}% — abaixo do recomendado. As faltas podem comprometer os teus resultados.`;
    return `${subjectsNeedingAttention.join(", ")} ${subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atenção imediata. Organiza o teu plano para recuperar.`;
  }

  if (trend > 0.5 && average >= 14)
    return "Estás a evoluir bem! Mantém o ritmo que vais superar as tuas metas. 🚀";
  if (trend > 0) return "Estás a melhorar — bom trabalho! Continua assim.";
  if (Math.abs(trend) <= 0.5)
    return average >= 14
      ? "Tudo estável e com boa margem de progressão. Mantém o foco."
      : "Tudo estável. Ainda há margem para subir e pontuar.";

  if (average >= 10)
    return `A tua média geral baixou ${Math.abs(trend).toFixed(1)} valores. Revê o método de estudo para recuperar.`;
  return "Média abaixo de 10 valores. Conversa com os teus professores e organiza um plano de estudo urgente.";
}

export default function StudentDashboard({ studentId }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/students/${studentId}/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setData)
      .catch(() =>
        setError("Não foi possível carregar o ecossistema do estudante."),
      );
  }, [studentId]);

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 min-h-[60vh]">
        <div className="flex items-center gap-3 text-rose-500 bg-rose-50/40 dark:bg-rose-950/10 px-6 py-4 rounded-3xl border border-rose-100 dark:border-rose-900/30 shadow-2xs backdrop-blur-md">
          <AlertCircle size={18} className="shrink-0" />
          <span className="text-xs font-semibold tracking-tight">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] gap-4">
        <div className="relative flex items-center justify-center">
          <Loader2
            className="w-7 h-7 animate-spin text-violet-600 dark:text-violet-400"
            strokeWidth={2.5}
          />
          <div className="absolute w-12 h-12 rounded-full border border-violet-500/10 animate-ping opacity-25" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-widest uppercase">
          Cur10usX · Engine
        </p>
      </div>
    );
  }

  const statusPhrase = getStatusPhrase(
    data.generalAverage,
    data.previousAverage,
    data.attendanceWarning,
    data.subjectsNeedingAttention,
  );

  const totalScores =
    data.scoreDistribution.excelente +
    data.scoreDistribution.bom +
    data.scoreDistribution.suficiente +
    data.scoreDistribution.insuficiente;

  return (
    <div className="w-full space-y-10 animate-fade-in pb-16 px-1 max-w-[1600px] mx-auto">
      {/* ═══════════════════════════════════════════════
          LAYER 1 — ESTADO EMOCIONAL / GERAL (HERÓI)
          ═══════════════════════════════════════════════ */}
      <section>
        <StudentHero
          name={data.student.name}
          average={data.generalAverage}
          previousAverage={data.previousAverage}
          classInfo={
            data.student.class
              ? `${data.student.class.grade}ª Classe · ${data.student.class.name}`
              : undefined
          }
          statusPhrase={statusPhrase} // 👈 Passa a variável dinâmica aqui
          classRank={data.classRank}
          classSize={data.classSize}
          criticalSubjects={data.subjectsNeedingAttention}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          LAYER 2 & 3 — PORQUÊ (Métricas) & ACÇÃO (Tarefas)
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8">
            <StudentPerformanceBreakdown
              subjectAverages={data.subjectAverages}
              subjectLastScores={data.subjectLastScores}
              generalAverage={data.generalAverage}
              previousAverage={data.previousAverage}
            />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <StudentActionHub
              average={data.generalAverage}
              previousAverage={data.previousAverage}
              attendancePercent={data.attendancePercent}
              attendanceWarning={data.attendanceWarning}
              pendingSubmissions={data.pendingSubmissions}
              subjectsNeedingAttention={data.subjectsNeedingAttention}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          LAYER 4 — CONTEXTO DE APOIO & RENDIMENTO
          ═══════════════════════════════════════════════ */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1 text-zinc-400 dark:text-zinc-500">
          <LayoutGrid size={14} />
          <h2 className="text-[10px] font-bold tracking-widest uppercase">
            Métricas por Disciplina
          </h2>
        </div>
        <StudentSubjectCards
          subjects={data.subjectAverages}
          subjectLastScores={data.subjectLastScores}
        />
      </section>

      {/* ═══════════════════════════════════════════════
          LAYER 5 — AGENDA NATIVA & JORNADA
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-4">
            <StudentAcademicJourney trimesters={data.trimesterEvolution} />
          </div>
          <div className="xl:col-span-8">
            <StudentAcademicAgenda
              exams={data.upcomingExams}
              assignments={data.upcomingAssignments}
            />
          </div>
        </div>
      </section>

      <section className="mt-4">
        <StudentCalendarExperience />
      </section>
      {/* ═══════════════════════════════════════════════
          LAYER 6 — HISTÓRICO VOLUMÉTRICO & DISTRIBUIÇÃO
          ═══════════════════════════════════════════════ */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 xl:col-span-8">
            <StudentActivityChart results={data.recentResults} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 text-zinc-400 dark:text-zinc-500">
                  <BarChart3 size={14} />
                  <h3 className="text-[10px] font-bold tracking-widest uppercase">
                    Distribuição de Notas
                  </h3>
                </div>
                <div className="space-y-3.5">
                  {[
                    {
                      label: "Excelente (16-20)",
                      value: data.scoreDistribution.excelente,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Bom (13-15)",
                      value: data.scoreDistribution.bom,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Suficiente (10-12)",
                      value: data.scoreDistribution.suficiente,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Insuficiente (<10)",
                      value: data.scoreDistribution.insuficiente,
                      color: "bg-rose-500",
                    },
                  ].map((cat) => {
                    const percent =
                      totalScores > 0
                        ? Math.round((cat.value / totalScores) * 100)
                        : 0;
                    return (
                      <div
                        key={cat.label}
                        className="flex items-center gap-3 group"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125",
                            cat.color,
                          )}
                        />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1 font-medium">
                          {cat.label}
                        </span>
                        <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              cat.color,
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums w-6 text-right">
                          {cat.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-6 pt-3 border-t border-zinc-100 dark:border-zinc-800/40 font-medium">
                Universo total de{" "}
                <span className="font-bold text-zinc-600 dark:text-zinc-300 tabular-nums">
                  {totalScores}
                </span>{" "}
                avaliações registadas.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
