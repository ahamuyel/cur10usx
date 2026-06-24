"use client"

import { useEffect, useState, useMemo, useCallback, Suspense, lazy } from "react"
import {
  Loader2, TrendingUp, TrendingDown, Target,
  BookOpen, Users, Calendar, CheckCircle, XCircle, AlertCircle,
  Clock, Sparkles, BarChart3, AlertTriangle,
  FileText, GraduationCap, ArrowUpRight, ArrowDownRight, Minus,
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

const StudentAcademicAgenda = lazy(() => import("./StudentAcademicAgenda"))
const StudentActivityChart = lazy(() => import("./StudentActivityChart"))

interface SubjectAverage {
  subjectId: string
  subjectName: string
  average: number
  count: number
}

interface ScoreDistribution {
  excelente: number
  bom: number
  suficiente: number
  insuficiente: number
}

interface AttendanceByMonth {
  month: string
  presente: number
  ausente: number
  atrasado: number
  falta_justificada: number
  falta_injustificada: number
}

interface DashboardData {
  student: { id: string; name: string; class: { id: string; name: string; grade: string }; targetAverage: number | null }
  generalAverage: number
  previousAverage: number
  classRank: number | null
  classSize: number | null
  attendanceWarning: boolean
  attendancePercentage: number
  totalAbsences: number
  faltaJustificada: number
  faltaInjustificada: number
  absencesBySubject: { subjectName: string; count: number }[]
  subjectWithMostAbsences: string | null
  totalResults: number
  pendingSubmissions: number
  subjectAverages: SubjectAverage[]
  subjectsNeedingAttention: string[]
  subjectLastScores: Record<string, { score: number; type: string; date: string }>
  subjectTrends: Record<string, { currentAverage: number; previousAverage: number; trend: number }>
  scoreDistribution: ScoreDistribution
  attendance: { total: number; presente: number; ausente: number; atrasado: number; faltaJustificada: number; faltaInjustificada: number; dispensa: number }
  attendanceByMonth: AttendanceByMonth[]
  trimesterEvolution: { trimester: string; label: string; subjects: Record<string, number>; generalAverage: number }[]
  recentResults: { id: string; subjectName: string; score: number; type: string; date: string; trimester: string }[]
  upcomingExams: { id: string; title: string; subjectName: string; date: string }[]
  upcomingAssignments: { id: string; title: string; subjectName: string; dueDate: string }[]
}

export default function ParentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "subjects">("overview")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/students/${studentId}/dashboard`)
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || "Falha ao carregar dados")
      }
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      setError(err.message || "Não foi possível carregar o ecossistema do estudante.")
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => { fetchData() }, [fetchData])

  const alerts = useMemo(() => {
    if (!data) return []
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = []
    const trend = data.generalAverage - data.previousAverage

    if (data.subjectsNeedingAttention.length >= 2) {
      items.push({ type: "critical", title: `${data.subjectsNeedingAttention.length} disciplinas com média abaixo de 10`, description: `${data.subjectsNeedingAttention.slice(0, 3).join(", ")} precisam de atenção urgente.` })
    } else if (data.subjectsNeedingAttention.length === 1) {
      items.push({ type: "warning", title: `${data.subjectsNeedingAttention[0]} precisa de atenção`, description: "Média abaixo de 10 valores — acompanhe de perto." })
    }
    if (data.faltaInjustificada >= 3) {
      items.push({ type: "critical", title: `${data.faltaInjustificada} faltas injustificadas`, description: "Faltas sem justificação podem comprometer o aproveitamento." })
    }
    if (data.totalAbsences >= 5 && data.faltaInjustificada < 3) {
      items.push({ type: "warning", title: `${data.totalAbsences} faltas no total`, description: data.subjectWithMostAbsences ? `A maioria em ${data.subjectWithMostAbsences}.` : "Acompanhe a assiduidade do educando." })
    }
    if (trend < -1.0) {
      items.push({ type: "warning", title: `Queda de ${Math.abs(trend).toFixed(1)} pontos na média`, description: "O desempenho geral diminuiu em relação ao período anterior." })
    }
    if (trend > 1.0 && data.generalAverage >= 14) {
      items.push({ type: "success", title: `Melhoria de +${trend.toFixed(1)} pontos`, description: "Excelente evolução! O educando está a melhorar." })
    }
    if (data.faltaJustificada > 0 && data.faltaInjustificada === 0 && data.totalAbsences < 5) {
      items.push({ type: "info", title: `${data.faltaJustificada} falta${data.faltaJustificada > 1 ? "s" : ""} justificada${data.faltaJustificada > 1 ? "s" : ""}`, description: "Todas as faltas foram devidamente justificadas." })
    }
    if (data.attendancePercentage >= 95 && data.generalAverage >= 14 && items.length === 0) {
      items.push({ type: "success", title: "Tudo dentro do esperado", description: "Bom desempenho académico e assiduidade exemplar." })
    }
    return items.slice(0, 5)
  }, [data])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">A carregar dados do educando...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="max-w-md flex flex-col items-center gap-3">
          <AlertCircle className="text-rose-500" size={32} />
          <h2 className="text-sm font-bold text-zinc-900">Erro de Carregamento</h2>
          <p className="text-xs text-zinc-500">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 underline underline-offset-2"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const trend = data.generalAverage - data.previousAverage
  const trendUp = trend > 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const firstName = data.student.name.split(" ")[0]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-sm"
      >
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
              <GraduationCap size={14} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Painel do Encarregado</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {greeting}
            </h1>
            <p className="text-base text-zinc-500 dark:text-zinc-400">
              Acompanhe o desempenho de <span className="font-semibold text-zinc-700 dark:text-zinc-300">{firstName}</span>
              <span className="text-xs text-zinc-400 ml-2">({data.student.class.name})</span>
            </p>

            {/* Quick summary badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <SummaryBadge
                label="Média Geral"
                value={data.generalAverage.toFixed(1)}
                color={data.generalAverage >= 14 ? "emerald" : data.generalAverage >= 10 ? "amber" : "rose"}
              />
              <SummaryBadge
                label="Assiduidade"
                value={`${data.attendancePercentage}%`}
                color={data.attendancePercentage >= 90 ? "emerald" : data.attendancePercentage >= 75 ? "amber" : "rose"}
              />
              <SummaryBadge
                label="Faltas"
                value={`${data.totalAbsences}`}
                color={data.totalAbsences === 0 ? "emerald" : data.totalAbsences < 5 ? "amber" : "rose"}
              />
              {data.classRank && data.classSize && (
                <SummaryBadge
                  label="Posição na Turma"
                  value={`#${data.classRank}/${data.classSize}`}
                  color={data.classRank && data.classRank <= Math.ceil((data.classSize || 1) / 3) ? "emerald" : "amber"}
                />
              )}
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <HeroMetricCard
              icon={<BarChart3 size={18} className="text-violet-600 dark:text-violet-400" />}
              label="Média"
              value={data.generalAverage.toFixed(1)}
              trend={trend}
              trendUp={trendUp}
            />
            {data.classRank && data.classSize && (
              <HeroMetricCard
                icon={<Target size={18} className="text-indigo-600 dark:text-indigo-400" />}
                label="Posição"
                value={`#${data.classRank}`}
                subtitle={`de ${data.classSize}`}
              />
            )}
            {data.student.targetAverage != null && (
              <HeroMetricCard
                icon={data.generalAverage >= data.student.targetAverage ? <Sparkles size={18} className="text-emerald-600 dark:text-emerald-400" /> : <Target size={18} className="text-amber-600 dark:text-amber-400" />}
                label="Meta"
                value={`${data.student.targetAverage.toFixed(1)}`}
                subtitle={data.generalAverage >= data.student.targetAverage ? "atingida" : `atual: ${data.generalAverage.toFixed(1)}`}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => <InsightCard key={i} {...alert} />)}
        </div>
      )}

      {/* Tab Navigation */}
      <DashboardTabs
        tabs={[
          { id: "overview", label: "Visão Geral", icon: <BarChart3 size={14} /> },
          { id: "attendance", label: "Assiduidade", icon: <Users size={14} /> },
          { id: "subjects", label: "Disciplinas", icon: <BookOpen size={14} /> },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as "overview" | "attendance" | "subjects")}
      />

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab data={data} studentId={studentId} onNavigate={setActiveTab} />
      )}
      {activeTab === "attendance" && (
        <AttendanceTab data={data} />
      )}
      {activeTab === "subjects" && (
        <SubjectsTab data={data} />
      )}
    </div>
  )
}

function HeroMetricCard({ icon, label, value, trend, trendUp, subtitle }: any) {
  return (
    <div className="flex-1 md:w-28 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] shadow-sm">
          {icon}
        </div>
        {trend !== undefined && trendUp !== undefined && (
          <span className={cn(
            "flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md",
            trendUp
              ? "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/10"
              : "text-rose-700 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/10"
          )}>
            {trendUp ? <TrendingUp size={9} className="mr-0.5" /> : <TrendingDown size={9} className="mr-0.5" />}
            {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>
      <div className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{value}</div>
      <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
      {subtitle && (
        <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}

function OverviewTab({ data, studentId, onNavigate }: { data: DashboardData; studentId: string; onNavigate: (tab: "overview" | "attendance" | "subjects") => void }) {
  const sortedSubjects = useMemo(() =>
    [...data.subjectAverages].sort((a, b) => b.average - a.average),
    [data.subjectAverages]
  )

  const bestSubjects = sortedSubjects.slice(0, 3)
  const worstSubjects = [...sortedSubjects].reverse().slice(0, 3)

  const scoreTotal = Object.values(data.scoreDistribution).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      {/* Clickable Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<BarChart3 size={18} />}
          label="Desempenho"
          value={`${data.generalAverage.toFixed(1)}`}
          subtitle={`de 20 valores`}
          trend={data.generalAverage - data.previousAverage}
          trendUp={(data.generalAverage - data.previousAverage) > 0}
          color={data.generalAverage >= 14 ? "emerald" : data.generalAverage >= 10 ? "amber" : "rose"}
          onClick={() => onNavigate("subjects")}
        />
        <MetricCard
          icon={<Users size={18} />}
          label="Assiduidade"
          value={`${data.attendancePercentage}%`}
          subtitle={`${data.attendance.presente} presenças · ${data.totalAbsences} faltas`}
          color={data.attendancePercentage >= 90 ? "emerald" : data.attendancePercentage >= 75 ? "amber" : "rose"}
          onClick={() => onNavigate("attendance")}
        />
        <MetricCard
          icon={<AlertTriangle size={18} />}
          label="Disciplinas em Risco"
          value={`${data.subjectsNeedingAttention.length}`}
          subtitle={data.subjectsNeedingAttention.length > 0
            ? data.subjectsNeedingAttention.slice(0, 2).join(", ")
            : "Nenhuma"}
          color={data.subjectsNeedingAttention.length === 0 ? "emerald" : data.subjectsNeedingAttention.length <= 2 ? "amber" : "rose"}
          onClick={() => onNavigate("subjects")}
        />
        <MetricCard
          icon={<Sparkles size={18} />}
          label="Melhores Disciplinas"
          value={bestSubjects.length > 0 ? `${bestSubjects[0].average.toFixed(1)}` : "-"}
          subtitle={bestSubjects.length > 0 ? bestSubjects.map(s => s.subjectName).join(", ") : "Sem dados"}
          color="emerald"
          trend={undefined}
          onClick={() => onNavigate("subjects")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TrimesterChart trimesterEvolution={data.trimesterEvolution} />
        </div>
        <div className="lg:col-span-5">
          <ScoreDistributionChart scoreDistribution={data.scoreDistribution} total={scoreTotal} />
        </div>
      </div>

      {/* Subjects quick view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-900/20">
              <TrendingDown size={14} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Precisa de Atenção</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Disciplinas com menor desempenho</p>
            </div>
          </div>
          {worstSubjects.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">Sem disciplinas registadas.</p>
          ) : (
            <div className="space-y-2">
              {worstSubjects.map((s, i) => (
                <motion.div key={s.subjectId} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <SubjectRow subjectName={s.subjectName} average={s.average} count={s.count} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/20">
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Destaques</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Disciplinas com melhor desempenho</p>
            </div>
          </div>
          {bestSubjects.length === 0 ? (
            <p className="text-xs text-zinc-400 italic">Sem disciplinas registadas.</p>
          ) : (
            <div className="space-y-2">
              {bestSubjects.map((s, i) => (
                <motion.div key={s.subjectId} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <SubjectRow subjectName={s.subjectName} average={s.average} count={s.count} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming */}
      <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-800" />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentAcademicAgenda exams={data.upcomingExams} assignments={data.upcomingAssignments} />
          <StudentActivityChart results={data.recentResults} />
        </div>
      </Suspense>
    </div>
  )
}

function AttendanceTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      {/* Attendance summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          icon={<CheckCircle size={18} />}
          label="Presenças"
          value={`${data.attendance.presente}`}
          subtitle={`${data.attendancePercentage}% de assiduidade`}
          color={data.attendancePercentage >= 90 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={<Clock size={18} />}
          label="Atrasos"
          value={`${data.attendance.atrasado}`}
          subtitle="Registados no período"
          color={data.attendance.atrasado === 0 ? "emerald" : data.attendance.atrasado <= 3 ? "amber" : "rose"}
        />
        <MetricCard
          icon={<FileText size={18} />}
          label="Faltas Justificadas"
          value={`${data.faltaJustificada}`}
          subtitle="Com justificação válida"
          color={data.faltaJustificada <= 2 ? "emerald" : "amber"}
        />
        <MetricCard
          icon={<XCircle size={18} />}
          label="Faltas Injustificadas"
          value={`${data.faltaInjustificada}`}
          subtitle="Sem justificação"
          color={data.faltaInjustificada === 0 ? "emerald" : data.faltaInjustificada <= 2 ? "amber" : "rose"}
        />
      </div>

      {/* Attendance by month */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/50">
            <Calendar size={14} className="text-zinc-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Assiduidade por Mês</h3>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Presenças, faltas justificadas e injustificadas
            </p>
          </div>
        </div>

        {data.attendanceByMonth.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-8">Nenhum registo de assiduidade disponível.</p>
        ) : (
          <div className="space-y-3">
            {data.attendanceByMonth.map((m) => {
              const totalMonth = m.presente + m.ausente + m.atrasado + m.falta_justificada + m.falta_injustificada
              return (
                <div key={m.month} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">{m.month}</span>
                    <span className="text-[10px] text-zinc-400">{totalMonth} registos</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    {m.presente > 0 && (
                      <div
                        className="bg-emerald-500 transition-all"
                        style={{ width: `${(m.presente / totalMonth) * 100}%` }}
                        title={`${m.presente} presenças`}
                      />
                    )}
                    {m.atrasado > 0 && (
                      <div
                        className="bg-amber-400 transition-all"
                        style={{ width: `${(m.atrasado / totalMonth) * 100}%` }}
                        title={`${m.atrasado} atrasos`}
                      />
                    )}
                    {m.falta_justificada > 0 && (
                      <div
                        className="bg-blue-400 transition-all"
                        style={{ width: `${(m.falta_justificada / totalMonth) * 100}%` }}
                        title={`${m.falta_justificada} faltas justificadas`}
                      />
                    )}
                    {m.falta_injustificada > 0 && (
                      <div
                        className="bg-rose-500 transition-all"
                        style={{ width: `${(m.falta_injustificada / totalMonth) * 100}%` }}
                        title={`${m.falta_injustificada} faltas injustificadas`}
                      />
                    )}
                    {m.ausente > 0 && (
                      <div
                        className="bg-rose-300 transition-all"
                        style={{ width: `${(m.ausente / totalMonth) * 100}%` }}
                        title={`${m.ausente} faltas`}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 text-[9px] text-zinc-400 flex-wrap">
                    {m.presente > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{m.presente} presente</span>}
                    {m.atrasado > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{m.atrasado} atrasado</span>}
                    {m.falta_justificada > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{m.falta_justificada} justificada</span>}
                    {m.falta_injustificada > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{m.falta_injustificada} injustificada</span>}
                    {m.ausente > 0 && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-300" />{m.ausente} falta</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Absences by subject */}
      {data.absencesBySubject.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100 dark:border-rose-900/20">
              <BookOpen size={14} className="text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Faltas por Disciplina</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Total de ausências agrupadas por disciplina</p>
            </div>
          </div>
          <div className="space-y-2">
            {data.absencesBySubject.map((s) => (
              <div key={s.subjectName} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.subjectName}</span>
                <span className={cn(
                  "text-xs font-bold tabular-nums",
                  s.count >= 3 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {s.count} falta{s.count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall summary */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">{data.attendance.total}</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Total Registos</div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{data.attendance.presente}</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Presenças</div>
          </div>
          <div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 tabular-nums">{data.faltaJustificada}</div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Justificadas</div>
          </div>
          <div>
            <div className={cn("text-2xl font-black tabular-nums", data.faltaInjustificada === 0 ? "text-emerald-600" : "text-rose-600")}>
              {data.faltaInjustificada}
            </div>
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Injustificadas</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubjectsTab({ data }: { data: DashboardData }) {
  const sortedSubjects = useMemo(() =>
    [...data.subjectAverages].sort((a, b) => b.average - a.average),
    [data.subjectAverages]
  )

  if (sortedSubjects.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 text-center">
        <p className="text-xs text-zinc-400 italic">Nenhuma disciplina disponível.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSubjects.map((s, i) => (
          <motion.div
            key={s.subjectId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4 hover:border-zinc-200 dark:hover:border-zinc-700/50 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">{s.subjectName}</h4>
              <SubjectScoreBadge score={s.average} />
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  s.average >= 14 ? "bg-emerald-500" : s.average >= 10 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${(s.average / 20) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-zinc-400">{s.count} avaliaç{s.count === 1 ? "ão" : "ões"}</span>
              {data.subjectTrends[s.subjectName] && (
                <SubjectTrendBadge trend={data.subjectTrends[s.subjectName].trend} />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score distribution */}
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4">Distribuição de Notas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Excelente (16-20)", value: data.scoreDistribution.excelente, color: "bg-emerald-500", textColor: "text-emerald-600" },
            { label: "Bom (13-15)", value: data.scoreDistribution.bom, color: "bg-blue-500", textColor: "text-blue-600" },
            { label: "Suficiente (10-12)", value: data.scoreDistribution.suficiente, color: "bg-amber-500", textColor: "text-amber-600" },
            { label: "Insuficiente (<10)", value: data.scoreDistribution.insuficiente, color: "bg-rose-500", textColor: "text-rose-600" },
          ].map((cat) => (
            <div key={cat.label} className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
              <div className={cn("text-2xl font-black tabular-nums", cat.textColor)}>{cat.value}</div>
              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{cat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectScoreBadge({ score }: { score: number }) {
  const color = score >= 14 ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-900/20"
    : score >= 10 ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-900/20"
    : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-900/20"

  return (
    <span className={cn("text-xs font-black tabular-nums px-2 py-0.5 rounded-lg border", color)}>
      {score.toFixed(1)}
    </span>
  )
}

function SubjectTrendBadge({ trend }: { trend: number }) {
  if (trend > 1) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
        <ArrowUpRight size={9} />+{trend.toFixed(1)}
      </span>
    )
  }
  if (trend < -1) {
    return (
      <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.5 rounded-md">
        <ArrowDownRight size={9} />{trend.toFixed(1)}
      </span>
    )
  }
  return (
    <span className="text-[9px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">
      estável
    </span>
  )
}

function TrimesterChart({ trimesterEvolution }: { trimesterEvolution: DashboardData["trimesterEvolution"] }) {
  if (trimesterEvolution.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 h-full flex items-center justify-center">
        <p className="text-xs text-zinc-400 italic">Sem dados trimestrais disponíveis.</p>
      </div>
    )
  }

  const chartData = trimesterEvolution.map((t) => ({
    label: t.label.replace("º Trimestre", "º Trim"),
    fullLabel: t.label,
    average: t.generalAverage,
  }))

  const last = chartData[chartData.length - 1]
  const first = chartData[0]
  const diff = last.average - first.average
  const trendText = diff > 1 ? "Em progresso" : diff < -1 ? "Em queda" : "Estável"
  const trendColor = diff > 1 ? "text-emerald-600" : diff < -1 ? "text-rose-600" : "text-zinc-500"

  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Evolução Trimestral</h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Média geral por período</p>
        </div>
        <span className={cn("text-[10px] font-bold flex items-center gap-1", trendColor)}>
          {diff > 1 ? <TrendingUp size={12} /> : diff < -1 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {trendText}
        </span>
      </div>

      <div className="w-full h-52 mt-4 -ml-4 sm:-ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={50}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              domain={[0, 20]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#a1a1aa", fontSize: 10, className: "tabular-nums font-medium" }}
              dx={-5}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const val = Number(payload[0].value)
                  return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                        {payload[0].payload.fullLabel}
                      </p>
                      <p className="text-sm font-black text-white tabular-nums mt-0.5">
                        {val.toFixed(2)}
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        {payload[0].payload.subjectCount || 0} disciplinas
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="average" radius={[10, 10, 0, 0]} animationDuration={800}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.average >= 14 ? "#10b981" : entry.average >= 10 ? "#f59e0b" : "#f43f5e"}
                  className="transition-all duration-300 hover:opacity-85"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {trimesterEvolution.length >= 2 && (
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/40">
          {trimesterEvolution.slice(-2).map((t) => {
            const subjectEntries = Object.entries(t.subjects)
            return (
              <div key={t.trimester} className="text-center">
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.label}</div>
                <div className="text-lg font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{t.generalAverage.toFixed(1)}</div>
                <div className="text-[9px] text-zinc-400">{subjectEntries.length} disciplinas</div>
                {subjectEntries.slice(0, 3).map(([name, avg]) => (
                  <div key={name} className="flex items-center justify-between text-[9px] text-zinc-500 px-2 py-0.5">
                    <span className="truncate">{name}</span>
                    <span className="font-semibold tabular-nums ml-1">{avg.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScoreDistributionChart({ scoreDistribution, total }: { scoreDistribution: ScoreDistribution; total: number }) {
  if (total === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 h-full flex items-center justify-center">
        <p className="text-xs text-zinc-400 italic">Sem avaliações registadas.</p>
      </div>
    )
  }

  const bars = [
    { label: "Excelente", value: scoreDistribution.excelente, color: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", pct: (scoreDistribution.excelente / total) * 100 },
    { label: "Bom", value: scoreDistribution.bom, color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", pct: (scoreDistribution.bom / total) * 100 },
    { label: "Suficiente", value: scoreDistribution.suficiente, color: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", pct: (scoreDistribution.suficiente / total) * 100 },
    { label: "Insuficiente", value: scoreDistribution.insuficiente, color: "bg-rose-500", textColor: "text-rose-600 dark:text-rose-400", pct: (scoreDistribution.insuficiente / total) * 100 },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-6 h-full">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">Distribuição de Notas</h3>
      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mb-6">{total} avaliações</p>

      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-zinc-600 dark:text-zinc-400">{bar.label}</span>
              <span className={cn("font-bold tabular-nums", bar.textColor)}>{bar.value}</span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", bar.color)}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {scoreDistribution.insuficiente > scoreDistribution.excelente && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/20">
          <p className="text-[10px] font-medium text-rose-700 dark:text-rose-400">
            Mais notas insuficientes do que excelentes. Acompanhe de perto.
          </p>
        </div>
      )}
      {scoreDistribution.excelente > scoreDistribution.insuficiente && scoreDistribution.excelente > scoreDistribution.suficiente && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/20">
          <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            Maioria das notas é excelente. Bom desempenho geral.
          </p>
        </div>
      )}
    </div>
  )
}
