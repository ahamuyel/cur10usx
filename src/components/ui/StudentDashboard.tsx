"use client"

import { useEffect, useState, useMemo, useCallback, Suspense, lazy } from "react"
import {
  Loader2, AlertCircle, BarChart3, BookOpen, Users, Target,
  TrendingUp, TrendingDown, GraduationCap, Award, Sparkles,
  Calendar, Clock, FileText, CheckCircle, XCircle, Minus, History,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard, SectionCard, SubjectRow, SummaryBadge,
} from "@/components/dashboard/shared"
import ShaderBackground from "./shader-background"

const StudentAcademicAgenda = lazy(() => import("./StudentAcademicAgenda"))
const StudentActivityChart = lazy(() => import("./StudentActivityChart"))
const AcademicHistoryTab = lazy(() => import("./AcademicHistoryTab"))

interface SubjectAverage { subjectId: string; subjectName: string; average: number; count: number }
interface ScoreDistribution { excelente: number; bom: number; suficiente: number; insuficiente: number }
interface DashboardData {
  student: { id: string; name: string; class: { id: string; name: string; grade: string }; targetAverage: number | null }
  generalAverage: number; previousAverage: number; classRank: number | null; classSize: number | null
  attendanceWarning: boolean; attendancePercentage: number; totalAbsences: number
  faltaJustificada: number; faltaInjustificada: number
  absencesBySubject: { subjectName: string; count: number }[]; subjectWithMostAbsences: string | null
  totalResults: number; pendingSubmissions: number; subjectAverages: SubjectAverage[]
  subjectsNeedingAttention: string[]; subjectLastScores: Record<string, { score: number; type: string; date: string }>
  subjectTrends: Record<string, { currentAverage: number; previousAverage: number; trend: number }>
  scoreDistribution: ScoreDistribution
  attendance: { total: number; presente: number; ausente: number; atrasado: number; faltaJustificada: number; faltaInjustificada: number; dispensa: number }
  attendanceByMonth: { month: string; presente: number; ausente: number; atrasado: number; falta_justificada: number; falta_injustificada: number }[]
  trimesterEvolution: { trimester: string; label: string; subjects: Record<string, number>; generalAverage: number }[]
  recentResults: { id: string; subjectName: string; score: number; type: string; date: string; trimester: string }[]
  upcomingExams: { id: string; title: string; subjectName: string; date: string }[]
  upcomingAssignments: { id: string; title: string; subjectName: string; dueDate: string }[]
}

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  const fetchData = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const res = await fetch(`/api/students/${studentId}/dashboard`)
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Falha ao carregar dados") }
      setData(await res.json())
    } catch (err: any) { setError(err.message || "Erro ao carregar dados") }
    finally { setLoading(false) }
  }, [studentId])

  useEffect(() => { fetchData() }, [fetchData])

  const insights = useMemo(() => {
    if (!data) return []
    const trend = data.generalAverage - data.previousAverage
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = []
    if (data.subjectsNeedingAttention.length >= 2) items.push({ type: "critical", title: `${data.subjectsNeedingAttention.length} disciplinas em risco`, description: `${data.subjectsNeedingAttention.slice(0, 3).join(", ")} com média abaixo de 10.` })
    if (data.subjectsNeedingAttention.length === 1) items.push({ type: "warning", title: `${data.subjectsNeedingAttention[0]} precisa de atenção`, description: "Média abaixo de 10 valores." })
    if (data.faltaInjustificada >= 3) items.push({ type: "critical", title: `${data.faltaInjustificada} faltas injustificadas`, description: "Faltas sem justificação podem comprometer o aproveitamento." })
    if (data.totalAbsences >= 5 && data.faltaInjustificada < 3) items.push({ type: "warning", title: `${data.totalAbsences} faltas no total`, description: data.subjectWithMostAbsences ? `A maioria em ${data.subjectWithMostAbsences}.` : "Acompanhe a assiduidade." })
    if (trend < -1) items.push({ type: "warning", title: `Queda de ${Math.abs(trend).toFixed(1)} pontos`, description: "O desempenho geral diminuiu." })
    if (trend > 1 && data.generalAverage >= 14) items.push({ type: "success", title: `Melhoria de +${trend.toFixed(1)} pontos`, description: "Excelente evolução!" })
    if (items.length === 0) items.push({ type: "success", title: "Tudo dentro do esperado", description: "Bom desempenho académico." })
    return items.slice(0, 4)
  }, [data])

  if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /><p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">A carregar...</p></div>
  if (error || !data) return <div className="flex items-center justify-center min-h-[60vh] p-4 text-center"><AlertCircle className="text-rose-500" size={32} /><p className="text-xs text-zinc-500 mt-2">{error}</p></div>

  const trend = data.generalAverage - data.previousAverage
  const trendUp = trend > 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const firstName = data.student.name.split(" ")[0]

  const sortedSubjects = [...data.subjectAverages].sort((a, b) => b.average - a.average)
  const worstSubjects = [...sortedSubjects].reverse().slice(0, 3)
  const bestSubjects = sortedSubjects.slice(0, 3)

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: <BarChart3 size={14} /> },
    { id: "subjects", label: "Disciplinas", icon: <BookOpen size={14} />, badge: data.subjectAverages.length },
    { id: "attendance", label: "Assiduidade", icon: <Users size={14} />, badge: data.totalAbsences || undefined },
    { id: "evaluations", label: "Avaliações", icon: <FileText size={14} />, badge: data.totalResults || undefined },
    { id: "goals", label: "Metas", icon: <Target size={14} /> },
    { id: "history", label: "Histórico", icon: <History size={14} /> },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-sm"
      >
        <ShaderBackground />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
              <GraduationCap size={14} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Dashboard Académico</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {greeting}, <span className="text-zinc-500 dark:text-zinc-400 font-medium">{firstName}</span>
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {data.student.class?.name && <span className="text-xs text-zinc-400">{data.student.class.name}</span>}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <SummaryBadge label="Média" value={data.generalAverage.toFixed(1)} color={data.generalAverage >= 14 ? "emerald" : data.generalAverage >= 10 ? "amber" : "rose"} />
              <SummaryBadge label="Assiduidade" value={`${data.attendancePercentage}%`} color={data.attendancePercentage >= 90 ? "emerald" : data.attendancePercentage >= 75 ? "amber" : "rose"} />
              <SummaryBadge label="Faltas" value={`${data.totalAbsences}`} color={data.totalAbsences === 0 ? "emerald" : data.totalAbsences < 5 ? "amber" : "rose"} />
              {data.classRank && data.classSize && <SummaryBadge label="Posição" value={`#${data.classRank}/${data.classSize}`} color={data.classRank <= Math.ceil((data.classSize || 1) / 3) ? "emerald" : "amber"} />}
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <HeroMetric icon={<Award size={18} className="text-violet-600 dark:text-violet-400" />} label="Média" value={data.generalAverage.toFixed(1)} trend={trend} trendUp={trendUp} />
            {data.classRank && data.classSize && <HeroMetric icon={<Target size={18} className="text-indigo-600 dark:text-indigo-400" />} label="Posição" value={`#${data.classRank}`} subtitle={`de ${data.classSize}`} />}
            {data.student.targetAverage != null && (
              <HeroMetric icon={data.generalAverage >= data.student.targetAverage ? <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Target size={18} className="text-amber-600 dark:text-amber-400" />}
                label="Meta" value={`${data.student.targetAverage.toFixed(1)}`} subtitle={data.generalAverage >= data.student.targetAverage ? "atingida" : `atual: ${data.generalAverage.toFixed(1)}`} />
            )}
          </div>
        </div>
      </motion.div>

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
            <MetricCard icon={<BarChart3 size={18} />} label="Média Geral" value={data.generalAverage.toFixed(1)} subtitle="de 20 valores"
              trend={trend} trendUp={trendUp} color={data.generalAverage >= 14 ? "emerald" : data.generalAverage >= 10 ? "amber" : "rose"} />
            <MetricCard icon={<Users size={18} />} label="Assiduidade" value={`${data.attendancePercentage}%`}
              subtitle={`${data.attendance.presente} presenças · ${data.totalAbsences} faltas`}
              color={data.attendancePercentage >= 90 ? "emerald" : data.attendancePercentage >= 75 ? "amber" : "rose"} />
            <MetricCard icon={<AlertCircle size={18} />} label="Disciplinas em Risco" value={`${data.subjectsNeedingAttention.length}`}
              subtitle={data.subjectsNeedingAttention.length > 0 ? data.subjectsNeedingAttention.slice(0, 2).join(", ") : "Nenhuma"}
              color={data.subjectsNeedingAttention.length === 0 ? "emerald" : "rose"} />
            <MetricCard icon={<FileText size={18} />} label="Trabalhos Pendentes" value={`${data.pendingSubmissions}`}
              subtitle={data.pendingSubmissions > 0 ? "Por entregar" : "Tudo em dia"}
              color={data.pendingSubmissions === 0 ? "emerald" : "amber"} />
          </MetricCardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TrimesterChart trimesterEvolution={data.trimesterEvolution} />
            </div>
            <div className="lg:col-span-5">
              <ScoreDistributionChart scoreDistribution={data.scoreDistribution} total={data.totalResults} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Precisa de Atenção" icon={<TrendingDown size={14} className="text-rose-500" />}
              subtitle="Disciplinas com menor desempenho">
              {worstSubjects.map(s => <SubjectRow key={s.subjectId} subjectName={s.subjectName} average={s.average} count={s.count} />)}
            </SectionCard>
            <SectionCard title="Destaques" icon={<TrendingUp size={14} className="text-emerald-500" />}
              subtitle="Disciplinas com melhor desempenho">
              {bestSubjects.map(s => <SubjectRow key={s.subjectId} subjectName={s.subjectName} average={s.average} count={s.count} />)}
            </SectionCard>
          </div>

          {/* Upcoming */}
          <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudentAcademicAgenda exams={data.upcomingExams} assignments={data.upcomingAssignments} />
              <StudentActivityChart results={data.recentResults} />
            </div>
          </Suspense>
        </div>
      </DashboardTabContent>

      {/* Subjects */}
      <DashboardTabContent id="subjects" activeTab={activeTab}>
        <SubjectsTab data={data} />
      </DashboardTabContent>

      {/* Attendance */}
      <DashboardTabContent id="attendance" activeTab={activeTab}>
        <AttendanceTab data={data} />
      </DashboardTabContent>

      {/* Evaluations */}
      <DashboardTabContent id="evaluations" activeTab={activeTab}>
        <EvaluationsTab data={data} />
      </DashboardTabContent>

      {/* Goals */}
      <DashboardTabContent id="goals" activeTab={activeTab}>
        <GoalsTab data={data} />
      </DashboardTabContent>

      {/* History */}
      <DashboardTabContent id="history" activeTab={activeTab}>
        <Suspense fallback={<div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>}>
          <AcademicHistoryTab studentId={studentId} />
        </Suspense>
      </DashboardTabContent>
    </div>
  )
}

function HeroMetric({ icon, label, value, trend, trendUp, subtitle }: any) {
  return (
    <div className="flex-1 md:w-28 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] shadow-sm">{icon}</div>
        {trend !== undefined && <span className={cn("flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md", trendUp ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" : "text-rose-700 bg-rose-500/10 dark:text-rose-400")}>
          {trendUp ? <TrendingUp size={9} className="mr-0.5" /> : <TrendingDown size={9} className="mr-0.5" />}{Math.abs(trend).toFixed(1)}
        </span>}
      </div>
      <div className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{value}</div>
      <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
      {subtitle && <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">{subtitle}</div>}
    </div>
  )
}

function AttendanceTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <MetricCardGrid cols={4}>
        <MetricCard icon={<CheckCircle size={18} />} label="Presenças" value={`${data.attendance.presente}`} subtitle={`${data.attendancePercentage}%`} color="emerald" />
        <MetricCard icon={<Clock size={18} />} label="Atrasos" value={`${data.attendance.atrasado}`} subtitle="Registados" color={data.attendance.atrasado === 0 ? "emerald" : "amber"} />
        <MetricCard icon={<FileText size={18} />} label="Faltas Justificadas" value={`${data.faltaJustificada}`} subtitle="Com justificação" color={data.faltaJustificada <= 2 ? "emerald" : "amber"} />
        <MetricCard icon={<XCircle size={18} />} label="Faltas Injustificadas" value={`${data.faltaInjustificada}`} subtitle="Sem justificação" color={data.faltaInjustificada === 0 ? "emerald" : "rose"} />
      </MetricCardGrid>

      <SectionCard title="Assiduidade por Mês" icon={<Calendar size={14} />} subtitle="Presenças, atrasos, faltas justificadas e injustificadas">
        {data.attendanceByMonth.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-8">Nenhum registo disponível.</p>
        ) : (
          <div className="space-y-3">
            {data.attendanceByMonth.map((m) => {
              const total = m.presente + m.ausente + m.atrasado + m.falta_justificada + m.falta_injustificada
              return (
                <div key={m.month} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs"><span className="font-semibold text-zinc-700 dark:text-zinc-300">{m.month}</span><span className="text-[10px] text-zinc-400">{total} registos</span></div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {m.presente > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(m.presente / total) * 100}%` }} />}
                    {m.atrasado > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(m.atrasado / total) * 100}%` }} />}
                    {m.falta_justificada > 0 && <div className="bg-blue-400 transition-all" style={{ width: `${(m.falta_justificada / total) * 100}%` }} />}
                    {m.falta_injustificada > 0 && <div className="bg-rose-500 transition-all" style={{ width: `${(m.falta_injustificada / total) * 100}%` }} />}
                    {m.ausente > 0 && <div className="bg-rose-300 transition-all" style={{ width: `${(m.ausente / total) * 100}%` }} />}
                  </div>
                  <div className="flex gap-3 text-[9px] text-zinc-400 flex-wrap">
                    {m.presente > 0 && <span><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />{m.presente} presente</span>}
                    {m.atrasado > 0 && <span><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block mr-1" />{m.atrasado} atrasado</span>}
                    {m.falta_justificada > 0 && <span><span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block mr-1" />{m.falta_justificada} justificada</span>}
                    {m.falta_injustificada > 0 && <span><span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block mr-1" />{m.falta_injustificada} injustificada</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {data.absencesBySubject.length > 0 && (
        <SectionCard title="Faltas por Disciplina" icon={<BookOpen size={14} className="text-rose-500" />} subtitle="Total de ausências agrupadas por disciplina">
          <div className="space-y-2">
            {data.absencesBySubject.map((s) => (
              <div key={s.subjectName} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.subjectName}</span>
                <span className={cn("text-xs font-bold tabular-nums", s.count >= 3 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400")}>
                  {s.count} falta{s.count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function SubjectsTab({ data }: { data: DashboardData }) {
  const sorted = useMemo(() => [...data.subjectAverages].sort((a, b) => b.average - a.average), [data.subjectAverages])
  if (sorted.length === 0) return <SectionCard title="Disciplinas"><p className="text-xs text-zinc-400 italic">Nenhuma disciplina disponível.</p></SectionCard>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map((s, i) => {
          const trend = data.subjectTrends[s.subjectName]?.trend
          return (
            <motion.div key={s.subjectId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{s.subjectName}</h4>
                <ScoreBadge score={s.average} />
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", s.average >= 14 ? "bg-emerald-500" : s.average >= 10 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${(s.average / 20) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-400">{s.count} avaliaç{s.count === 1 ? "ão" : "ões"}</span>
                {trend !== undefined && (
                  trend > 1 ? <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md"><TrendingUp size={9} />+{trend.toFixed(1)}</span>
                    : trend < -1 ? <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md"><TrendingDown size={9} />{trend.toFixed(1)}</span>
                    : <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">estável</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      <ScoreDistributionChart scoreDistribution={data.scoreDistribution} total={data.totalResults} />
    </div>
  )
}

function EvaluationsTab({ data }: { data: DashboardData }) {
  if (data.recentResults.length === 0) {
    return <SectionCard title="Avaliações"><p className="text-xs text-zinc-400 italic text-center py-8">Nenhuma avaliação registada.</p></SectionCard>
  }

  return (
    <div className="space-y-6">
      <MetricCardGrid cols={4}>
        <MetricCard icon={<Award size={18} />} label="Excelente (16-20)" value={`${data.scoreDistribution.excelente}`} color="emerald" />
        <MetricCard icon={<TrendingUp size={18} />} label="Bom (13-15)" value={`${data.scoreDistribution.bom}`} color="blue" />
        <MetricCard icon={<AlertCircle size={18} />} label="Suficiente (10-12)" value={`${data.scoreDistribution.suficiente}`} color="amber" />
        <MetricCard icon={<XCircle size={18} />} label="Insuficiente (<10)" value={`${data.scoreDistribution.insuficiente}`} color="rose" />
      </MetricCardGrid>

      <SectionCard title="Últimas Avaliações" icon={<FileText size={14} />} subtitle="Registo das avaliações mais recentes">
        <div className="space-y-2">
          {data.recentResults.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{r.subjectName}</span>
                <span className="text-[9px] text-zinc-400 uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">{r.type}</span>
                {r.trimester && <span className="text-[9px] text-zinc-400">{r.trimester}</span>}
              </div>
              <ScoreBadge score={r.score} />
            </div>
          ))}
        </div>
      </SectionCard>

      {data.upcomingExams.length > 0 && (
        <SectionCard title="Próximas Provas" icon={<Calendar size={14} />} subtitle="Avaliações agendadas">
          <div className="space-y-2">
            {data.upcomingExams.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{e.subjectName}: {e.title}</span>
                <span className="text-[10px] text-zinc-400">{new Date(e.date).toLocaleDateString("pt-PT")}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function GoalsTab({ data }: { data: DashboardData }) {
  const target = data.student.targetAverage
  const current = data.generalAverage
  const progress = target && target > 0 ? Math.min(100, (current / target) * 100) : 0
  const remaining = target ? Math.max(0, target - current) : 0
  const trend = current - data.previousAverage

  return (
    <div className="space-y-6">
      <SectionCard title="Progresso para a Meta" icon={<Target size={14} />} subtitle={target ? `Meta definida: ${target.toFixed(1)} valores` : "Nenhuma meta definida"}>
        {target ? (
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{current.toFixed(1)}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Média Atual</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-violet-600 dark:text-violet-400 tabular-nums">{target.toFixed(1)}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Meta</div>
              </div>
            </div>
            <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-1000", current >= target ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{progress.toFixed(0)}% concluído</span>
              {remaining > 0 && <span>Faltam {remaining.toFixed(1)} valores</span>}
              {current >= target && <span className="text-emerald-600 font-bold">Meta atingida!</span>}
            </div>
          </div>
        ) : (
          <p className="text-xs text-zinc-400 italic">O estudante ainda não definiu uma meta académica.</p>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <MetricCard icon={<Award size={18} />} label="Média Atual" value={current.toFixed(1)} color={current >= 14 ? "emerald" : current >= 10 ? "amber" : "rose"} trend={trend} trendUp={trend > 0} />
        <MetricCard icon={<Target size={18} />} label="Progresso" value={`${progress.toFixed(0)}%`} color={progress >= 80 ? "emerald" : progress >= 50 ? "amber" : "rose"} />
        <MetricCard icon={<TrendingUp size={18} />} label="Tendência" value={trend > 0 ? `+${trend.toFixed(1)}` : trend < 0 ? trend.toFixed(1) : "Estável"} color={trend > 0 ? "emerald" : trend < 0 ? "rose" : "blue"} />
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 14 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/20"
    : score >= 10 ? "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/20"
    : "text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-900/20"
  return <span className={cn("text-xs font-black tabular-nums px-2 py-0.5 rounded-lg border", color)}>{score.toFixed(1)}</span>
}

function TrimesterChart({ trimesterEvolution }: { trimesterEvolution: DashboardData["trimesterEvolution"] }) {
  if (trimesterEvolution.length === 0) return <SectionCard title="Evolução Trimestral"><p className="text-xs text-zinc-400 italic">Sem dados.</p></SectionCard>
  const chartData = trimesterEvolution.map(t => ({ label: t.label.replace("º Trimestre", "º Trim"), fullLabel: t.label, average: t.generalAverage }))
  const last = chartData[chartData.length - 1]; const first = chartData[0]; const diff = last.average - first.average

  return (
    <SectionCard title="Evolução Trimestral" subtitle="Média geral por período"
      action={<span className={cn("text-[10px] font-bold flex items-center gap-1", diff > 1 ? "text-emerald-600" : diff < -1 ? "text-rose-600" : "text-zinc-500")}>
        {diff > 1 ? <TrendingUp size={12} /> : diff < -1 ? <TrendingDown size={12} /> : <Minus size={12} />}
        {diff > 1 ? "Progresso" : diff < -1 ? "Queda" : "Estável"}
      </span>}
    >
      <div className="w-full h-52 mt-2 -ml-4 sm:-ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={50}>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }} dy={8} />
            <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10, className: "tabular-nums font-medium" }} dx={-5} />
            <Tooltip cursor={{ fill: "transparent" }} content={({ active, payload }) => {
              if (active && payload?.length) return <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl"><p className="text-[9px] font-bold text-zinc-400 uppercase">{payload[0].payload.fullLabel}</p><p className="text-sm font-black text-white tabular-nums mt-0.5">{(Number(payload[0].value)).toFixed(2)}</p></div>
              return null
            }} />
            <Bar dataKey="average" radius={[10, 10, 0, 0]} animationDuration={800}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.average >= 14 ? "#10b981" : entry.average >= 10 ? "#f59e0b" : "#f43f5e"} className="hover:opacity-85" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {trimesterEvolution.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
          {trimesterEvolution.slice(-2).map((t) => (
            <div key={t.trimester} className="text-center">
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.label}</div>
              <div className="text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{t.generalAverage.toFixed(1)}</div>
              <div className="text-[9px] text-zinc-400">{Object.entries(t.subjects).length} disciplinas</div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function ScoreDistributionChart({ scoreDistribution, total }: { scoreDistribution: ScoreDistribution; total: number }) {
  if (total === 0) return <SectionCard title="Distribuição de Notas"><p className="text-xs text-zinc-400 italic">Sem avaliações.</p></SectionCard>
  const bars = [
    { label: "Excelente", value: scoreDistribution.excelente, color: "bg-emerald-500", pct: (scoreDistribution.excelente / total) * 100 },
    { label: "Bom", value: scoreDistribution.bom, color: "bg-blue-500", pct: (scoreDistribution.bom / total) * 100 },
    { label: "Suficiente", value: scoreDistribution.suficiente, color: "bg-amber-500", pct: (scoreDistribution.suficiente / total) * 100 },
    { label: "Insuficiente", value: scoreDistribution.insuficiente, color: "bg-rose-500", pct: (scoreDistribution.insuficiente / total) * 100 },
  ]
  return (
    <SectionCard title="Distribuição de Notas" subtitle={`${total} avaliações`}>
      <div className="space-y-4">
        {bars.map(bar => (
          <div key={bar.label}>
            <div className="flex items-center justify-between text-xs mb-1"><span className="font-medium text-zinc-600 dark:text-zinc-400">{bar.label}</span><span className="font-bold tabular-nums">{bar.value}</span></div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all duration-700", bar.color)} style={{ width: `${bar.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
