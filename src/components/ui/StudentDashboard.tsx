"use client";

import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  Suspense,
  lazy,
} from "react";
import {
  Loader2,
  AlertCircle,
  BarChart3,
  BookOpen,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import {
  DashboardTabs,
  DashboardTabContent,
  MetricCardGrid,
  MetricCard,
  InsightCard,
  SectionCard,
} from "@/components/dashboard/shared";

import StudentHero from "./StudentHero";
import StudentDailyFocus from "./StudentDailyFocus";
import StudentPerformanceBreakdown from "./StudentPerformanceBreakdown";
import StudentPrioritySubjects from "./StudentPrioritySubjects";
import StudentAcademicJourney from "./StudentAcademicJourney";
import StudentInsights from "./StudentInsights";
import StudentCalendarExperience from "./StudentCalendarExperience";
import StudentNavigation from "./StudentNavigation";

const StudentAcademicAgenda = lazy(() => import("./StudentAcademicAgenda"));
const StudentActivityChart = lazy(() => import("./StudentActivityChart"));
const AcademicHistoryTab = lazy(() => import("./AcademicHistoryTab"));

interface SubjectAverage {
  subjectId: string;
  subjectName: string;
  average: number;
  count: number;
}
interface ScoreDistribution {
  excelente: number;
  bom: number;
  suficiente: number;
  insuficiente: number;
}
interface DashboardData {
  student: {
    id: string;
    name: string;
    class: { id: string; name: string; grade: string };
    targetAverage: number | null;
  };
  generalAverage: number;
  previousAverage: number;
  classRank: number | null;
  classSize: number | null;
  attendanceWarning: boolean;
  attendancePercentage: number;
  totalAbsences: number;
  faltaJustificada: number;
  faltaInjustificada: number;
  absencesBySubject: { subjectName: string; count: number }[];
  subjectWithMostAbsences: string | null;
  totalResults: number;
  pendingSubmissions: number;
  subjectAverages: SubjectAverage[];
  subjectsNeedingAttention: string[];
  subjectLastScores: Record<
    string,
    { score: number; type: string; date: string }
  >;
  subjectTrends: Record<
    string,
    { currentAverage: number; previousAverage: number; trend: number }
  >;
  scoreDistribution: ScoreDistribution;
  attendance: {
    total: number;
    presente: number;
    ausente: number;
    atrasado: number;
    faltaJustificada: number;
    faltaInjustificada: number;
    dispensa: number;
  };
  attendanceByMonth: {
    month: string;
    presente: number;
    ausente: number;
    atrasado: number;
    falta_justificada: number;
    falta_injustificada: number;
  }[];
  trimesterEvolution: {
    trimester: string;
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
    trimester: string;
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
}

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/students/${studentId}/dashboard`);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Falha ao carregar dados");
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insights = useMemo(() => {
    if (!data) return [];
    const trend = data.generalAverage - data.previousAverage;
    const items: {
      type: "critical" | "warning" | "success" | "info";
      title: string;
      description: string;
    }[] = [];
    if (data.subjectsNeedingAttention.length >= 2)
      items.push({
        type: "critical",
        title: `${data.subjectsNeedingAttention.length} disciplinas em risco`,
        description: `${data.subjectsNeedingAttention.slice(0, 3).join(", ")} com media abaixo de 10.`,
      });
    if (data.subjectsNeedingAttention.length === 1)
      items.push({
        type: "warning",
        title: `${data.subjectsNeedingAttention[0]} precisa de atencao`,
        description: "Media abaixo de 10 valores.",
      });
    if (data.faltaInjustificada >= 3)
      items.push({
        type: "critical",
        title: `${data.faltaInjustificada} faltas injustificadas`,
        description:
          "Faltas sem justificacao podem comprometer o aproveitamento.",
      });
    if (data.totalAbsences >= 5 && data.faltaInjustificada < 3)
      items.push({
        type: "warning",
        title: `${data.totalAbsences} faltas no total`,
        description: data.subjectWithMostAbsences
          ? `A maioria em ${data.subjectWithMostAbsences}.`
          : "Acompanhe a assiduidade.",
      });
    if (trend < -1)
      items.push({
        type: "warning",
        title: `Queda de ${Math.abs(trend).toFixed(1)} pontos`,
        description: "O desempenho geral diminuiu.",
      });
    if (trend > 1 && data.generalAverage >= 14)
      items.push({
        type: "success",
        title: `Melhoria de +${trend.toFixed(1)} pontos`,
        description: "Excelente evolucao!",
      });
    if (items.length === 0)
      items.push({
        type: "success",
        title: "Tudo dentro do esperado",
        description: "Bom desempenho academico.",
      });
    return items.slice(0, 4);
  }, [data]);

  if (loading) return <DashboardLoader />;
  if (error || !data) return <DashboardError error={error} />;

  const trend = data.generalAverage - data.previousAverage;
  const hasAbsenceIssues = data.totalAbsences >= 5;
  const hasSubjectIssues = data.subjectsNeedingAttention.length > 0;

  const statusPhrase = (() => {
    if (hasAbsenceIssues && hasSubjectIssues)
      return `Tens ${data.totalAbsences} faltas e ${data.subjectsNeedingAttention.length} disciplina${data.subjectsNeedingAttention.length > 1 ? "s" : ""} com media critica.`;
    if (hasAbsenceIssues)
      return `Tens ${data.totalAbsences} faltas este periodo.${data.subjectWithMostAbsences ? ` A maioria em ${data.subjectWithMostAbsences}.` : ""}`;
    if (hasSubjectIssues)
      return `${data.subjectsNeedingAttention.join(", ")} ${data.subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atencao.`;
    if (data.totalAbsences === 0 && trend > 1.0 && data.generalAverage >= 14)
      return "Presenca perfeita e excelente evolucao.";
    if (trend > 1.0 && data.generalAverage >= 14)
      return "Excelente evolucao. Mantem o ritmo.";
    if (trend > 0) return "Estas a melhorar. Continua assim.";
    if (data.totalAbsences === 0)
      return "Sem faltas registadas. Desempenho estavel.";
    return "Desempenho estavel. Foca-te nas proximas metas.";
  })();

  const sortedSubjects = [...data.subjectAverages].sort(
    (a, b) => b.average - a.average,
  );
  const bestSubjects = sortedSubjects.slice(0, 4);
  const worstSubjects = [...sortedSubjects].reverse().slice(0, 4);

  const tabs = [
    { id: "overview", label: "Visao Geral", icon: <BarChart3 size={14} /> },
    {
      id: "subjects",
      label: "Disciplinas",
      icon: <BookOpen size={14} />,
      badge: data.subjectAverages.length,
    },
    {
      id: "attendance",
      label: "Assiduidade",
      icon: <Users size={14} />,
      badge: data.totalAbsences || undefined,
    },
    {
      id: "evaluations",
      label: "Avaliacoes",
      icon: <FileText size={14} />,
      badge: data.totalResults || undefined,
    },
    { id: "goals", label: "Metas", icon: <Target size={14} /> },
    { id: "history", label: "Historico", icon: <History size={14} /> },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Hero */}
      <section>
        <StudentHero
          name={data.student.name}
          average={data.generalAverage}
          previousAverage={data.previousAverage}
          classRank={data.classRank}
          classSize={data.classSize}
          statusPhrase={statusPhrase}
          targetAverage={data.student.targetAverage}
        />
        <div className="flex justify-end mt-2">
          <StudentNavigation studentId={studentId} />
        </div>
      </section>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((insight, i) => (
            <InsightCard key={i} {...insight} />
          ))}
        </div>
      )}

      {/* Tabs */}
      <DashboardTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── VISAO GERAL ──────────────────────────────────────── */}
      <DashboardTabContent id="overview" activeTab={activeTab}>
        {/* Ajuste de grid: do mobile ao desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Coluna Principal: ocupa 100% no mobile, 2/2 no tablet, 3/4 no desktop */}
          <div className="md:col-span-2 xl:col-span-3 flex flex-col gap-6">
            <StudentCalendarExperience />

            <StudentDailyFocus
              subjectsNeedingAttention={data.subjectsNeedingAttention}
              pendingSubmissions={data.pendingSubmissions}
              upcomingExams={data.upcomingExams}
              totalAbsences={data.totalAbsences}
              absencesBySubject={data.absencesBySubject}
              subjectWithMostAbsences={data.subjectWithMostAbsences}
              generalAverage={data.generalAverage}
              previousAverage={data.previousAverage}
              subjectAverages={data.subjectAverages}
              targetAverage={data.student.targetAverage}
            />

            <StudentAcademicAgenda
              exams={data.upcomingExams}
              assignments={data.upcomingAssignments}
            />

            <StudentInsights
              scoreDistribution={data.scoreDistribution}
              totalAbsences={data.totalAbsences}
              absencesBySubject={data.absencesBySubject}
              attendanceByMonth={data.attendanceByMonth}
            />
          </div>

          {/* Sidebar: agora sobe para o lado no desktop */}
          <div className="md:col-span-2 xl:col-span-1 flex flex-col gap-6">
            {/* Container de Destaques mantido, mas com altura adaptável */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              <SectionCard
                title="Destaques"
                icon={<TrendingUp size={14} className="text-emerald-500" />}
              >
                <div className="space-y-2">
                  {bestSubjects.map((s) => (
                    <div
                      key={s.subjectId}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
                        {s.subjectName}
                      </span>
                      <ScoreBadge score={s.average} />
                    </div>
                  ))}
                  {worstSubjects.length > 0 && (
                    <>
                      <div className="border-t border-zinc-100 dark:border-zinc-800/50 pt-2 mt-2">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          A melhorar
                        </span>
                      </div>
                      {worstSubjects.map((s) => (
                        <div
                          key={s.subjectId}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate pr-2">
                            {s.subjectName}
                          </span>
                          <ScoreBadge score={s.average} />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </SectionCard>

              <StudentPerformanceBreakdown
                subjectAverages={data.subjectAverages}
                subjectTrends={data.subjectTrends}
                generalAverage={data.generalAverage}
                previousAverage={data.previousAverage}
              />
            </div>

            <StudentAcademicJourney trimesters={data.trimesterEvolution} />

            <StudentActivityChart results={data.recentResults} />
          </div>
        </div>
      </DashboardTabContent>
      {/* ── DISCIPLINAS ──────────────────────────────────────── */}
      <DashboardTabContent id="subjects" activeTab={activeTab}>
        <SubjectsTab data={data} />
      </DashboardTabContent>

      {/* ── ASSIDUIDADE ──────────────────────────────────────── */}
      <DashboardTabContent id="attendance" activeTab={activeTab}>
        <AttendanceTab data={data} />
      </DashboardTabContent>

      {/* ── AVALIACOES ───────────────────────────────────────── */}
      <DashboardTabContent id="evaluations" activeTab={activeTab}>
        <EvaluationsTab data={data} />
      </DashboardTabContent>

      {/* ── METAS ────────────────────────────────────────────── */}
      <DashboardTabContent id="goals" activeTab={activeTab}>
        <GoalsTab data={data} />
      </DashboardTabContent>

      {/* ── HISTORICO ────────────────────────────────────────── */}
      <DashboardTabContent id="history" activeTab={activeTab}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[30vh]">
              <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            </div>
          }
        >
          <AcademicHistoryTab studentId={studentId} />
        </Suspense>
      </DashboardTabContent>
    </div>
  );
}

// ── SUB-TABS ────────────────────────────────────────────────────────────────

function SubjectsTab({ data }: { data: DashboardData }) {
  const sorted = useMemo(
    () => [...data.subjectAverages].sort((a, b) => b.average - a.average),
    [data.subjectAverages],
  );
  if (sorted.length === 0)
    return (
      <SectionCard title="Disciplinas">
        <p className="text-xs text-zinc-400 italic">
          Nenhuma disciplina disponivel.
        </p>
      </SectionCard>
    );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((s, i) => {
          const trend = data.subjectTrends[s.subjectName]?.trend;
          return (
            <motion.div
              key={s.subjectId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700/50 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {s.subjectName}
                </h4>
                <ScoreBadge score={s.average} />
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    s.average >= 14
                      ? "bg-emerald-500"
                      : s.average >= 10
                        ? "bg-amber-500"
                        : "bg-rose-500",
                  )}
                  style={{ width: `${(s.average / 20) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-400">
                  {s.count} avaliac{s.count === 1 ? "ao" : "oes"}
                </span>
                {trend !== undefined &&
                  (trend > 1 ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      <TrendingUp size={9} />+{trend.toFixed(1)}
                    </span>
                  ) : trend < -1 ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                      <TrendingDown size={9} />
                      {trend.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
                      estavel
                    </span>
                  ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      <ScoreDistributionChart
        scoreDistribution={data.scoreDistribution}
        total={data.totalResults}
      />
    </div>
  );
}

function AttendanceTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <MetricCardGrid cols={4}>
        <MetricCard
          icon={<CheckCircle size={18} />}
          label="Presencas"
          value={`${data.attendance.presente}`}
          subtitle={`${data.attendancePercentage}%`}
          color="emerald"
        />
        <MetricCard
          icon={<Calendar size={18} />}
          label="Atrasos"
          value={`${data.attendance.atrasado}`}
          subtitle="Registados"
          color={data.attendance.atrasado === 0 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={<FileText size={18} />}
          label="Faltas Justificadas"
          value={`${data.faltaJustificada}`}
          subtitle="Com justificacao"
          color={data.faltaJustificada <= 2 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={<XCircle size={18} />}
          label="Faltas Injustificadas"
          value={`${data.faltaInjustificada}`}
          subtitle="Sem justificacao"
          color={data.faltaInjustificada === 0 ? "emerald" : "rose"}
        />
      </MetricCardGrid>
      <SectionCard
        title="Assiduidade por Mes"
        icon={<Calendar size={14} />}
        subtitle="Presencas, atrasos e faltas mensais"
      >
        {data.attendanceByMonth.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-8">
            Nenhum registo disponivel.
          </p>
        ) : (
          <div className="space-y-3">
            {data.attendanceByMonth.map((m) => {
              const total =
                m.presente +
                m.ausente +
                m.atrasado +
                m.falta_justificada +
                m.falta_injustificada;
              return (
                <div key={m.month} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                      {m.month}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {total} registos
                    </span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {m.presente > 0 && (
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{ width: `${(m.presente / total) * 100}%` }}
                      />
                    )}
                    {m.atrasado > 0 && (
                      <div
                        className="bg-amber-400 transition-all"
                        style={{ width: `${(m.atrasado / total) * 100}%` }}
                      />
                    )}
                    {m.falta_justificada > 0 && (
                      <div
                        className="bg-blue-400 transition-all"
                        style={{
                          width: `${(m.falta_justificada / total) * 100}%`,
                        }}
                      />
                    )}
                    {m.falta_injustificada > 0 && (
                      <div
                        className="bg-rose-500 transition-all"
                        style={{
                          width: `${(m.falta_injustificada / total) * 100}%`,
                        }}
                      />
                    )}
                    {m.ausente > 0 && (
                      <div
                        className="bg-rose-300 transition-all"
                        style={{ width: `${(m.ausente / total) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 text-[9px] text-zinc-400 flex-wrap">
                    {m.presente > 0 && (
                      <span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
                        {m.presente} presente
                      </span>
                    )}
                    {m.atrasado > 0 && (
                      <span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mr-1" />
                        {m.atrasado} atrasado
                      </span>
                    )}
                    {m.falta_justificada > 0 && (
                      <span>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1" />
                        {m.falta_justificada} justificada
                      </span>
                    )}
                    {m.falta_injustificada > 0 && (
                      <span>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block mr-1" />
                        {m.falta_injustificada} injustificada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
      {data.absencesBySubject.length > 0 && (
        <SectionCard
          title="Faltas por Disciplina"
          icon={<BookOpen size={14} className="text-rose-500" />}
          subtitle="Total de ausencias por disciplina"
        >
          <div className="space-y-2">
            {data.absencesBySubject.map((s) => (
              <div
                key={s.subjectName}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30"
              >
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {s.subjectName}
                </span>
                <span
                  className={cn(
                    "text-xs font-bold tabular-nums",
                    s.count >= 3
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {s.count} falta{s.count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function EvaluationsTab({ data }: { data: DashboardData }) {
  if (data.recentResults.length === 0)
    return (
      <SectionCard title="Avaliacoes">
        <p className="text-xs text-zinc-400 italic text-center py-8">
          Nenhuma avaliacao registada.
        </p>
      </SectionCard>
    );
  return (
    <div className="space-y-6">
      <MetricCardGrid cols={4}>
        <MetricCard
          icon={<Award size={18} />}
          label="Excelente (16-20)"
          value={`${data.scoreDistribution.excelente}`}
          color="emerald"
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Bom (13-15)"
          value={`${data.scoreDistribution.bom}`}
          color="blue"
        />
        <MetricCard
          icon={<AlertCircle size={18} />}
          label="Suficiente (10-12)"
          value={`${data.scoreDistribution.suficiente}`}
          color="amber"
        />
        <MetricCard
          icon={<XCircle size={18} />}
          label="Insuficiente (<10)"
          value={`${data.scoreDistribution.insuficiente}`}
          color="rose"
        />
      </MetricCardGrid>
      <SectionCard
        title="Ultimas Avaliacoes"
        icon={<FileText size={14} />}
        subtitle="Registo das avaliacoes mais recentes"
      >
        <div className="space-y-2">
          {data.recentResults.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {r.subjectName}
                </span>
                <span className="text-[9px] text-zinc-400 uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                  {r.type}
                </span>
                {r.trimester && (
                  <span className="text-[9px] text-zinc-400">
                    {r.trimester}
                  </span>
                )}
              </div>
              <ScoreBadge score={r.score} />
            </div>
          ))}
        </div>
      </SectionCard>
      {data.upcomingExams.length > 0 && (
        <SectionCard
          title="Proximas Provas"
          icon={<Calendar size={14} />}
          subtitle="Avaliacoes agendadas"
        >
          <div className="space-y-2">
            {data.upcomingExams.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30"
              >
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {e.subjectName}: {e.title}
                </span>
                <span className="text-[10px] text-zinc-400">
                  {new Date(e.date).toLocaleDateString("pt-PT")}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function GoalsTab({ data }: { data: DashboardData }) {
  const target = data.student.targetAverage;
  const current = data.generalAverage;
  const progress =
    target && target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const remaining = target ? Math.max(0, target - current) : 0;
  const trend = current - data.previousAverage;
  return (
    <div className="space-y-6">
      <SectionCard
        title="Progresso para a Meta"
        icon={<Target size={14} />}
        subtitle={
          target
            ? `Meta definida: ${target.toFixed(1)} valores`
            : "Nenhuma meta definida"
        }
      >
        {target ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">
                  {current.toFixed(1)}
                </div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Media Atual
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400 tabular-nums">
                  {target.toFixed(1)}
                </div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Meta
                </div>
              </div>
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  current >= target ? "bg-emerald-500" : "bg-violet-500",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{progress.toFixed(0)}% concluido</span>
              {remaining > 0 && (
                <span>Faltam {remaining.toFixed(1)} valores</span>
              )}
              {current >= target && (
                <span className="text-emerald-600 font-bold">
                  Meta atingida!
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">
            O estudante ainda nao definiu uma meta academica.
          </p>
        )}
      </SectionCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard
          icon={<Award size={18} />}
          label="Media Atual"
          value={current.toFixed(1)}
          trend={trend}
          trendUp={trend > 0}
          color={current >= 14 ? "emerald" : current >= 10 ? "amber" : "rose"}
        />
        <MetricCard
          icon={<Target size={18} />}
          label="Progresso"
          value={`${progress.toFixed(0)}%`}
          color={progress >= 80 ? "emerald" : progress >= 50 ? "amber" : "rose"}
        />
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="Tendencia"
          value={
            trend > 0
              ? `+${trend.toFixed(1)}`
              : trend < 0
                ? trend.toFixed(1)
                : "Estavel"
          }
          color={trend > 0 ? "emerald" : trend < 0 ? "rose" : "blue"}
        />
      </div>
    </div>
  );
}

// ── HELPERS ─────────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 14
      ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/20"
      : score >= 10
        ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/20"
        : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-900/20";
  return (
    <span
      className={cn(
        "text-xs font-black tabular-nums px-2 py-0.5 rounded-lg border",
        color,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}

function ScoreDistributionChart({
  scoreDistribution,
  total,
}: {
  scoreDistribution: ScoreDistribution;
  total: number;
}) {
  if (total === 0)
    return (
      <SectionCard title="Distribuicao de Notas">
        <p className="text-xs text-zinc-400 italic">Sem avaliacoes.</p>
      </SectionCard>
    );
  const bars = [
    {
      label: "Excelente",
      value: scoreDistribution.excelente,
      color: "bg-emerald-500",
      pct: (scoreDistribution.excelente / total) * 100,
    },
    {
      label: "Bom",
      value: scoreDistribution.bom,
      color: "bg-blue-500",
      pct: (scoreDistribution.bom / total) * 100,
    },
    {
      label: "Suficiente",
      value: scoreDistribution.suficiente,
      color: "bg-amber-500",
      pct: (scoreDistribution.suficiente / total) * 100,
    },
    {
      label: "Insuficiente",
      value: scoreDistribution.insuficiente,
      color: "bg-rose-500",
      pct: (scoreDistribution.insuficiente / total) * 100,
    },
  ];
  return (
    <SectionCard title="Distribuicao de Notas" subtitle={`${total} avaliacoes`}>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {bar.label}
              </span>
              <span className="font-bold tabular-nums">{bar.value}</span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  bar.color,
                )}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function DashboardLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
        A carregar ecossistema...
      </p>
    </div>
  );
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-900/50">
        <AlertCircle className="text-rose-500" size={18} />
        <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
          {error}
        </span>
      </div>
    </div>
  );
}
