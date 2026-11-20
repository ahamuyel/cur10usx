"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import {
  Loader2, AlertCircle, BarChart3, BookOpen, Users, Target,
  TrendingUp, GraduationCap, Sparkles,
  Building2, CreditCard, ShieldCheck, RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard, SectionCard, SummaryBadge,
} from "@/components/dashboard/shared"

import AdminHero from "../analytics/AdminHero"
import SchoolHealthOverview from "../analytics/SchoolHealthOverview"
import AttentionArea from "../analytics/AttentionArea"
import PedagogicalWatch from "../analytics/PedagogicalWatch"
import AcademicHealthHistoryChart from "../analytics/AcademicHealthHistoryChart"
import LessonValidationQueue from "../analytics/LessonValidationQueue"
import EventCalendar from "@/components/ui/EventCalendar"
import Announcements from "@/components/ui/Announcements"

interface SchoolAdminData {
  schoolInfo: { academicYear: string; schoolName: string }
  academic: {
    totalStudents: number; totalTeachers: number; totalClasses: number
    aproveitamento: number; assiduidade: number; status: string; evolution: number
  }
  risk: {
    totalAtRisk: number; riskPercentage: number
    summary: Record<string, number>
    students: { id: string; name: string; reason: string; level: string }[]
  }
  classes: { totalUnderMonitoring: number; criticalCount: number; atRiskCount: number }
  operational: { score: number; pendingApplications: number }
}

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<SchoolAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [pendingCount, setPendingCount] = useState(0)

  const loadData = useCallback(async () => {
    try {
      const [analyticsRes, pendingRes] = await Promise.all([
        fetch("/api/analytics/executive-briefing"),
        fetch("/api/lessons/records?status=PENDING"),
      ])
      if (!analyticsRes.ok) throw new Error("Erro ao carregar dados")
      setData(await analyticsRes.json())
      if (pendingRes.ok) {
        const pendingList = await pendingRes.json()
        setPendingCount(pendingList.length || 0)
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dashboard")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const insights = useMemo(() => {
    if (!data) return []
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = []
    if (data.risk.totalAtRisk > 0)
      items.push({ type: "critical", title: `${data.risk.totalAtRisk} alunos em risco`, description: `${data.risk.riskPercentage}% dos alunos necessitam de atenção.` })
    if (data.classes.totalUnderMonitoring > 0)
      items.push({ type: "warning", title: `${data.classes.totalUnderMonitoring} turmas em alerta`, description: `${data.classes.criticalCount} críticas, ${data.classes.atRiskCount} em risco.` })
    if (data.operational.pendingApplications > 0)
      items.push({ type: "warning", title: `${data.operational.pendingApplications} solicitações pendentes`, description: "Aguardam aprovação ou revisão." })
    if (data.academic.evolution < -5)
      items.push({ type: "warning", title: `Queda de ${Math.abs(data.academic.evolution)} pontos`, description: "O desempenho académico diminuiu." })
    if (items.length === 0)
      items.push({ type: "success", title: "Tudo dentro do esperado", description: "A escola apresenta indicadores saudáveis." })
    return items.slice(0, 4)
  }, [data])

  const healthStats = useMemo(() => data ? {
    aproveitamento: `${data.academic?.aproveitamento ?? 0}%`,
    assiduidade: `${data.academic?.assiduidade ?? 0}%`,
    risco: data.risk?.totalAtRisk ?? 0,
    turmasAlerta: data.classes?.totalUnderMonitoring ?? 0,
  } : null, [data])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  )
  if (error || !data) return (
    <div className="flex items-center justify-center min-h-[60vh] text-rose-500">
      <AlertCircle size={24} /><p className="ml-2 text-sm">{error}</p>
    </div>
  )

  const a = data.academic

  const tabs = [
    { id: "overview",   label: "Visão Geral",  icon: <BarChart3 size={14} /> },
    { id: "academic",   label: "Académico",    icon: <BookOpen size={14} /> },
    { id: "students",   label: "Alunos",       icon: <Users size={14} />,    badge: a.totalStudents || undefined },
    { id: "finance",    label: "Financeiro",   icon: <CreditCard size={14} /> },
    { id: "insights",   label: "Insights",     icon: <Target size={14} />,   badge: data.risk.totalAtRisk || undefined },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">

      {/* Hero */}
      <AdminHero briefing={data} />

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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Coluna principal */}
          <div className="xl:col-span-3 flex flex-col gap-6">
            <SchoolHealthOverview stats={healthStats} />
            <AttentionArea briefing={data} />
            <div className="bg-white dark:bg-zinc-900 backdrop-blur-md p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-6">Evolução Pedagógica</h3>
              <AcademicHealthHistoryChart />
            </div>
            {pendingCount > 0 && <LessonValidationQueue />}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            <EventCalendar />
            <Announcements />
            <button
              onClick={() => { setRefreshing(true); loadData() }}
              className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-400 flex items-center justify-center gap-1 transition-colors"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
              Actualizar agora
            </button>
          </div>
        </div>
      </DashboardTabContent>

      {/* ── ACADÉMICO ────────────────────────────────────────── */}
      <DashboardTabContent id="academic" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<TrendingUp size={18} />} label="Aproveitamento" value={`${a.aproveitamento}%`} color={a.aproveitamento >= 70 ? "emerald" : "amber"} />
            <MetricCard icon={<Users size={18} />} label="Assiduidade" value={`${a.assiduidade}%`} color={a.assiduidade >= 80 ? "emerald" : "amber"} />
            <MetricCard icon={<Sparkles size={18} />} label="Evolução" value={a.evolution > 0 ? `+${a.evolution}` : `${a.evolution}`} color={a.evolution >= 0 ? "emerald" : "rose"} />
          </MetricCardGrid>

          <SectionCard title="Indicadores Académicos" subtitle="Resumo geral da escola">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Alunos",      value: a.totalStudents,                    color: "text-blue-600" },
                { label: "Professores", value: a.totalTeachers,                    color: "text-emerald-600" },
                { label: "Turmas",      value: a.totalClasses,                     color: "text-violet-600" },
                { label: "Pendentes",   value: data.operational.pendingApplications, color: "text-amber-600" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
                  <div className={cn("text-2xl font-black tabular-nums", item.color)}>{item.value}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white mb-6">Evolução Pedagógica</h3>
            <AcademicHealthHistoryChart />
          </div>
          {pendingCount > 0 && <LessonValidationQueue />}
        </div>
      </DashboardTabContent>

      {/* ── ALUNOS ───────────────────────────────────────────── */}
      <DashboardTabContent id="students" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={2}>
            <MetricCard icon={<Users size={18} />} label="Total Alunos" value={`${a.totalStudents}`} color="blue" />
            <MetricCard icon={<AlertCircle size={18} />} label="Em Risco" value={`${data.risk.totalAtRisk}`} subtitle={`${data.risk.riskPercentage}%`} color={data.risk.totalAtRisk > 0 ? "rose" : "emerald"} />
          </MetricCardGrid>

          <PedagogicalWatch students={data.risk.students} />
        </div>
      </DashboardTabContent>

      {/* ── ADMINISTRATIVO ───────────────────────────────────────── */}
      <DashboardTabContent id="finance" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<CreditCard size={18} />} label="Solicitações" value={`${data.operational.pendingApplications}`} subtitle="Pendentes" color={data.operational.pendingApplications > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<Building2 size={18} />} label="Score Operacional" value={`${data.operational.score}`} color="violet" />
            <MetricCard icon={<ShieldCheck size={18} />} label="Status" value={a.status === "saudável" ? "Saudável" : a.status === "atento" ? "Atenção" : "Crítico"} color={a.status === "saudável" ? "emerald" : a.status === "atento" ? "amber" : "rose"} />
          </MetricCardGrid>

          {/* {pendingCount > 0 && <LessonValidationQueue />} */}

          <SectionCard title="Pendências" subtitle="Ações necessárias">
            <div className="text-center py-6 text-zinc-400">
              <p className="text-xs">Painel financeiro detalhado em desenvolvimento.</p>
            </div>
          </SectionCard>
        </div>
      </DashboardTabContent>

      {/* ── INSIGHTS ─────────────────────────────────────────── */}
      <DashboardTabContent id="insights" activeTab={activeTab}>
        <div className="space-y-6">
          <AttentionArea briefing={data} />
          {data.risk.students.length > 0 && (
            <SectionCard
              title="Risco Académico"
              icon={<AlertCircle size={14} className="text-rose-500" />}
              subtitle="Alunos que precisam de atenção"
            >
              <div className="space-y-2">
                {data.risk.students.slice(0, 8).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{s.name}</span>
                    <span className={cn("text-[10px] font-bold", s.level === "Crítico" ? "text-rose-500" : "text-amber-500")}>
                      {s.reason}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </DashboardTabContent>

    </div>
  )
}