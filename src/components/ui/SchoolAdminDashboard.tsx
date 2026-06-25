"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Loader2, AlertCircle, BarChart3, BookOpen, Users, Target,
  TrendingUp, GraduationCap, Sparkles,
  Building2, CreditCard, ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from "recharts"

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard, SectionCard, SummaryBadge,
} from "@/components/dashboard/shared"
import ShaderBackground from "./shader-background"

import AdminHero from "../analytics/AdminHero"

interface SchoolAdminData {
  schoolInfo: { academicYear: string; schoolName: string }
  academic: { totalStudents: number; totalTeachers: number; totalClasses: number; aproveitamento: number; assiduidade: number; status: string; evolution: number }
  risk: { totalAtRisk: number; riskPercentage: number; summary: Record<string, number>; students: { id: string; name: string; reason: string; level: string }[] }
  classes: { totalUnderMonitoring: number; criticalCount: number; atRiskCount: number }
  operational: { score: number; pendingApplications: number }
}

export default function SchoolAdminDashboard() {
  const [data, setData] = useState<SchoolAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics/executive-briefing")
        if (!res.ok) throw new Error("Erro ao carregar dados")
        setData(await res.json())
      } catch (err: any) {
        setError(err.message || "Erro ao carregar dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const insights = useMemo(() => {
    if (!data) return []
    const items: { type: "critical" | "warning" | "success" | "info"; title: string; description: string }[] = []
    if (data.risk.totalAtRisk > 0) items.push({ type: "critical", title: `${data.risk.totalAtRisk} alunos em risco`, description: `${data.risk.riskPercentage}% dos alunos necessitam de atenção.` })
    if (data.classes.totalUnderMonitoring > 0) items.push({ type: "warning", title: `${data.classes.totalUnderMonitoring} turmas em alerta`, description: `${data.classes.criticalCount} críticas, ${data.classes.atRiskCount} em risco.` })
    if (data.operational.pendingApplications > 0) items.push({ type: "warning", title: `${data.operational.pendingApplications} solicitações pendentes`, description: "Aguardam aprovação ou revisão." })
    if (data.academic.evolution < -5) items.push({ type: "warning", title: `Queda de ${Math.abs(data.academic.evolution)} pontos`, description: "O desempenho académico diminuiu." })
    if (items.length === 0) items.push({ type: "success", title: "Tudo dentro do esperado", description: "A escola apresenta indicadores saudáveis." })
    return items.slice(0, 4)
  }, [data])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
  if (error || !data) return <div className="flex items-center justify-center min-h-[60vh] text-rose-500"><AlertCircle size={24} /><p className="ml-2 text-sm">{error}</p></div>

  const a = data.academic
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: <BarChart3 size={14} /> },
    { id: "academic", label: "Académico", icon: <BookOpen size={14} /> },
    { id: "students", label: "Alunos", icon: <Users size={14} />, badge: a.totalStudents || undefined },
    { id: "finance", label: "Financeiro", icon: <CreditCard size={14} /> },
    { id: "insights", label: "Insights", icon: <Target size={14} />, badge: data.risk.totalAtRisk || undefined },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Hero */}
      {/* <AdminHero /> */}
      {/* <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-sm"
      >
        <ShaderBackground />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
              <Building2 size={14} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Painel Executivo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {greeting}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {data.schoolInfo.schoolName} · <span className="text-xs">{data.schoolInfo.academicYear}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <SummaryBadge label="Aproveitamento" value={`${a.aproveitamento}%`} color={a.aproveitamento >= 70 ? "emerald" : a.aproveitamento >= 50 ? "amber" : "rose"} />
              <SummaryBadge label="Assiduidade" value={`${a.assiduidade}%`} color={a.assiduidade >= 80 ? "emerald" : a.assiduidade >= 60 ? "amber" : "rose"} />
              <SummaryBadge label="Alunos" value={`${a.totalStudents}`} color="blue" />
              <SummaryBadge label="Turmas" value={`${a.totalClasses}`} color="violet" />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <HeroMetric icon={<Sparkles size={18} className="text-violet-600" />} label="Score" value={`${a.aproveitamento}%`} />
            <HeroMetric icon={<Users size={18} className="text-indigo-600" />} label="Professores" value={`${a.totalTeachers}`} />
          </div>
        </div>
      </motion.div> */}

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
            <MetricCard icon={<GraduationCap size={18} />} label="Alunos" value={`${a.totalStudents}`} subtitle={`${a.totalClasses} turmas`} color="blue" />
            <MetricCard icon={<Users size={18} />} label="Professores" value={`${a.totalTeachers}`} subtitle="Corpo docente" color="emerald" />
            <MetricCard icon={<AlertCircle size={18} />} label="Em Risco" value={`${data.risk.totalAtRisk}`} subtitle={`${data.risk.riskPercentage}% dos alunos`} color={data.risk.totalAtRisk > 0 ? "rose" : "emerald"} />
            <MetricCard icon={<TrendingUp size={18} />} label="Aproveitamento" value={`${a.aproveitamento}%`} subtitle={a.evolution !== 0 ? `${a.evolution > 0 ? "+" : ""}${a.evolution} pts` : "Estável"} trend={a.evolution} trendUp={a.evolution > 0} color={a.aproveitamento >= 70 ? "emerald" : "amber"} />
          </MetricCardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Distribuição de Risco" icon={<Target size={14} />} subtitle="Alunos por nível de risco">
              {Object.entries(data.risk.summary).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.risk.summary).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{level}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", level === "Crítico" ? "bg-rose-500" : level === "Alto Risco" ? "bg-amber-500" : "bg-blue-500")}
                            style={{ width: `${data.risk.totalAtRisk > 0 ? (Number(count) / data.risk.totalAtRisk) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-bold tabular-nums text-zinc-700 dark:text-zinc-300">{String(count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-zinc-400 italic">Sem dados de risco.</p>}
            </SectionCard>
            <SectionCard title="Turmas em Alerta" icon={<BookOpen size={14} />} subtitle="Monitorização de turmas">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10">
                  <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Críticas</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">{data.classes.criticalCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">Em Risco</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 tabular-nums">{data.classes.atRiskCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-400">Total</span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400 tabular-nums">{data.classes.totalUnderMonitoring}</span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </DashboardTabContent>

      {/* Academic */}
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
                { label: "Alunos", value: a.totalStudents, color: "text-blue-600" },
                { label: "Professores", value: a.totalTeachers, color: "text-emerald-600" },
                { label: "Turmas", value: a.totalClasses, color: "text-violet-600" },
                { label: "Pendentes", value: data.operational.pendingApplications, color: "text-amber-600" },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
                  <div className={cn("text-2xl font-black tabular-nums", item.color)}>{item.value}</div>
                  <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{item.label}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </DashboardTabContent>

      {/* Students */}
      <DashboardTabContent id="students" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={2}>
            <MetricCard icon={<Users size={18} />} label="Total Alunos" value={`${a.totalStudents}`} color="blue" />
            <MetricCard icon={<AlertCircle size={18} />} label="Em Risco" value={`${data.risk.totalAtRisk}`} subtitle={`${data.risk.riskPercentage}%`} color={data.risk.totalAtRisk > 0 ? "rose" : "emerald"} />
          </MetricCardGrid>
          {data.risk.students.length > 0 && (
            <SectionCard title="Alunos em Risco" icon={<AlertCircle size={14} className="text-rose-500" />} subtitle="Principais casos">
              <div className="space-y-2">
                {data.risk.students.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.name}</span>
                      <p className="text-[9px] text-zinc-400 truncate">{s.reason}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", s.level === "Crítico" ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400")}>
                      {s.level}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </DashboardTabContent>

      {/* Finance */}
      <DashboardTabContent id="finance" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<CreditCard size={18} />} label="Solicitações" value={`${data.operational.pendingApplications}`} subtitle="Pendentes" color={data.operational.pendingApplications > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<Building2 size={18} />} label="Score Operacional" value={`${data.operational.score}`} color="violet" />
            <MetricCard icon={<ShieldCheck size={18} />} label="Status" value={a.status === "saudável" ? "Saudável" : a.status === "atento" ? "Atenção" : "Crítico"} color={a.status === "saudável" ? "emerald" : a.status === "atento" ? "amber" : "rose"} />
          </MetricCardGrid>
          <SectionCard title="Pendências" subtitle="Ações necessárias">
            <div className="text-center py-6 text-zinc-400">
              <p className="text-xs">Painel financeiro detalhado em desenvolvimento.</p>
            </div>
          </SectionCard>
        </div>
      </DashboardTabContent>

      {/* Insights */}
      <DashboardTabContent id="insights" activeTab={activeTab}>
        <div className="space-y-6">
          {data.risk.students.length > 0 && (
            <SectionCard title="Risco Académico" icon={<AlertCircle size={14} className="text-rose-500" />} subtitle="Alunos que precisam de atenção">
              <div className="space-y-2">
                {data.risk.students.slice(0, 8).map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{s.name}</span>
                    <span className={cn("text-[10px] font-bold", s.level === "Crítico" ? "text-rose-500" : "text-amber-500")}>{s.reason}</span>
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

function HeroMetric({ icon, label, value, subtitle }: any) {
  return (
    <div className="flex-1 md:w-28 bg-zinc-50/50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] backdrop-blur-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="p-1.5 bg-white dark:bg-zinc-950/50 rounded-lg border border-black/[0.05] dark:border-white/[0.05] shadow-sm">{icon}</div>
      </div>
      <div className="text-xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums">{value}</div>
      <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{label}</div>
      {subtitle && <div className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium mt-0.5">{subtitle}</div>}
    </div>
  )
}
