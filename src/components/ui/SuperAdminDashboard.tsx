"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Loader2, AlertCircle, BarChart3, BookOpen, Users,
  TrendingUp, GraduationCap, Sparkles, FileText,
  Building2, Globe, Shield, CreditCard, Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell,
} from "recharts"

import {
  DashboardTabs, DashboardTabContent, MetricCardGrid, MetricCard,
  InsightCard, SectionCard, SummaryBadge,
} from "@/components/dashboard/shared"
import ShaderBackground from "./shader-background"

interface SuperAdminData {
  totalSchools: number
  activeSchools: number
  pendingSchools: number
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalParents: number
  totalApplications: number
  pendingApplications: number
  schoolsGrowth: { month: string; count: number }[]
  statusBreakdown: { status: string; count: number }[]
  recentSchools: { id: string; name: string; city: string; status: string }[]
  recentApplications: { id: string; name: string; email: string; school: { name: string }; status: string }[]
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard")
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
    if (data.pendingSchools > 0) items.push({ type: "warning", title: `${data.pendingSchools} escolas pendentes`, description: "Escolas aguardam aprovação." })
    if (data.pendingApplications > 0) items.push({ type: "warning", title: `${data.pendingApplications} solicitações pendentes`, description: "Precisam de revisão." })
    if (data.activeSchools < data.totalSchools * 0.5) items.push({ type: "critical", title: "Menos de 50% escolas ativas", description: "Muitas escolas estão com status inativo." })
    if (items.length === 0) items.push({ type: "success", title: "Plataforma saudável", description: "Todos os indicadores estão dentro do esperado." })
    return items.slice(0, 4)
  }, [data])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>
  if (error || !data) return <div className="flex items-center justify-center min-h-[60vh] text-rose-500"><AlertCircle size={24} /><p className="ml-2 text-sm">{error}</p></div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"
  const activePct = data.totalSchools > 0 ? Math.round((data.activeSchools / data.totalSchools) * 100) : 0

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: <BarChart3 size={14} /> },
    { id: "schools", label: "Escolas", icon: <Building2 size={14} />, badge: data.totalSchools || undefined },
    { id: "users", label: "Utilizadores", icon: <Users size={14} />, badge: data.totalUsers || undefined },
    { id: "analytics", label: "Analytics", icon: <Activity size={14} /> },
    { id: "security", label: "Segurança", icon: <Shield size={14} /> },
  ]

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-20 px-4 space-y-6 animate-in fade-in duration-700">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden w-full bg-white dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] rounded-3xl p-6 md:p-8 shadow-sm"
      >
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500 mb-1">
              <Globe size={14} />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Super Admin</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              {greeting}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {data.totalSchools} escolas · {data.totalUsers} utilizadores
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <SummaryBadge label="Escolas Ativas" value={`${data.activeSchools}`} color={activePct >= 80 ? "emerald" : activePct >= 50 ? "amber" : "rose"} />
              <SummaryBadge label="Utilizadores" value={`${data.totalUsers}`} color="blue" />
              <SummaryBadge label="Professores" value={`${data.totalTeachers}`} color="violet" />
              <SummaryBadge label="Alunos" value={`${data.totalStudents}`} color="emerald" />
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <HeroMetric icon={<Building2 size={18} className="text-violet-600" />} label="Escolas" value={`${data.activeSchools}`} subtitle={`${data.pendingSchools} pendentes`} />
            <HeroMetric icon={<Users size={18} className="text-indigo-600" />} label="Utilizadores" value={`${data.totalUsers}`} subtitle={`${data.totalTeachers} profs`} />
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
            <MetricCard icon={<Building2 size={18} />} label="Escolas Ativas" value={`${data.activeSchools}`} subtitle={`${activePct}% do total`} color={activePct >= 80 ? "emerald" : "amber"} />
            <MetricCard icon={<Users size={18} />} label="Utilizadores" value={`${data.totalUsers}`} subtitle={`${data.totalStudents} alunos · ${data.totalTeachers} profs`} color="blue" />
            <MetricCard icon={<FileText size={18} />} label="Solicitações" value={`${data.pendingApplications}`} subtitle="Pendentes" color={data.pendingApplications > 0 ? "amber" : "emerald"} />
            <MetricCard icon={<GraduationCap size={18} />} label="Alunos" value={`${data.totalStudents}`} subtitle={data.totalParents > 0 ? `${data.totalParents} encarregados` : undefined} color="emerald" />
          </MetricCardGrid>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <SectionCard title="Crescimento de Escolas" subtitle="Novas escolas nos últimos 6 meses"
                action={<span className="text-[10px] font-bold text-zinc-500">{data.schoolsGrowth.reduce((a, b) => a + b.count, 0)} total</span>}
              >
                <div className="w-full h-52 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.schoolsGrowth}>
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} dy={8} />
                      <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} dx={-5} allowDecimals={false} />
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload?.length) return <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl"><p className="text-[9px] text-zinc-400">{payload[0].payload.month}</p><p className="text-sm font-black text-white">{payload[0].value} escolas</p></div>
                        return null
                      }} />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
            <div className="lg:col-span-5">
              <SectionCard title="Distribuição por Status" subtitle="Estado das escolas">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.statusBreakdown} dataKey="count" innerRadius={45} outerRadius={65} cornerRadius={6} paddingAngle={4}>
                        {data.statusBreakdown.map((e, i) => {
                          const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a1a1aa"]
                          return <Cell key={i} fill={colors[i % colors.length]} />
                        })}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (active && payload?.length) return <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl"><p className="text-[9px] text-zinc-400 uppercase">{payload[0].name}</p><p className="text-sm font-black text-white">{payload[0].value}</p></div>
                        return null
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {data.statusBreakdown.map((e) => {
                    const colors: Record<string, string> = { ativa: "bg-indigo-500", pendente: "bg-amber-500", suspensa: "bg-zinc-400", rejeitada: "bg-rose-500" }
                    return (
                      <div key={e.status} className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", colors[e.status] || "bg-zinc-400")} />
                          <span className="text-[10px] font-bold uppercase text-zinc-500">{e.status}</span>
                        </div>
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums">{e.count}</span>
                      </div>
                    )
                  })}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Escolas Recentes" subtitle="Últimas escolas registadas">
              {data.recentSchools.length > 0 ? (
                <div className="space-y-2">
                  {data.recentSchools.map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{s.name}</span>
                        <p className="text-[9px] text-zinc-400">{s.city}</p>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", s.status === "ativa" ? "bg-emerald-50 text-emerald-600" : s.status === "pendente" ? "bg-amber-50 text-amber-600" : "bg-zinc-100 text-zinc-500")}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-zinc-400 italic text-center py-4">Nenhuma escola recente.</p>}
            </SectionCard>
            <SectionCard title="Solicitações Pendentes" subtitle="Aguardam revisão">
              {data.recentApplications.length > 0 ? (
                <div className="space-y-2">
                  {data.recentApplications.map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{a.name}</span>
                        <p className="text-[9px] text-zinc-400 truncate">{a.school?.name}</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">{a.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-zinc-400 italic text-center py-4">Nenhuma solicitação pendente.</p>}
            </SectionCard>
          </div>
        </div>
      </DashboardTabContent>

      {/* Schools */}
      <DashboardTabContent id="schools" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<Building2 size={18} />} label="Total" value={`${data.totalSchools}`} color="blue" />
            <MetricCard icon={<Sparkles size={18} />} label="Ativas" value={`${data.activeSchools}`} color="emerald" />
            <MetricCard icon={<AlertCircle size={18} />} label="Pendentes" value={`${data.pendingSchools}`} color={data.pendingSchools > 0 ? "amber" : "emerald"} />
          </MetricCardGrid>
          <SectionCard title="Escolas Recentes" subtitle="Últimas 5 escolas">
            {data.recentSchools.length > 0 ? (
              <div className="space-y-2">
                {data.recentSchools.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                    <div>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{s.name}</span>
                      <p className="text-[10px] text-zinc-400">{s.city}</p>
                    </div>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-md", s.status === "ativa" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400")}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-zinc-400 italic text-center py-8">Sem escolas registadas.</p>}
          </SectionCard>
        </div>
      </DashboardTabContent>

      {/* Users */}
      <DashboardTabContent id="users" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={4}>
            <MetricCard icon={<Users size={18} />} label="Total" value={`${data.totalUsers}`} color="blue" />
            <MetricCard icon={<GraduationCap size={18} />} label="Alunos" value={`${data.totalStudents}`} color="emerald" />
            <MetricCard icon={<BookOpen size={18} />} label="Professores" value={`${data.totalTeachers}`} color="violet" />
            <MetricCard icon={<Users size={18} />} label="Encarregados" value={`${data.totalParents}`} color="amber" />
          </MetricCardGrid>
        </div>
      </DashboardTabContent>

      {/* Analytics */}
      <DashboardTabContent id="analytics" activeTab={activeTab}>
        <div className="space-y-6">
          <MetricCardGrid cols={3}>
            <MetricCard icon={<Activity size={18} />} label="Escolas" value={`${data.totalSchools}`} color="blue" />
            <MetricCard icon={<TrendingUp size={18} />} label="Taxa Ativa" value={`${activePct}%`} color={activePct >= 80 ? "emerald" : "amber"} />
            <MetricCard icon={<CreditCard size={18} />} label="Solicitações" value={`${data.totalApplications}`} color="violet" />
          </MetricCardGrid>
          <SectionCard title="Crescimento Mensal" subtitle="Novas escolas por mês">
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.schoolsGrowth}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#a1a1aa" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </DashboardTabContent>

      {/* Security */}
      <DashboardTabContent id="security" activeTab={activeTab}>
        <div className="space-y-6">
          <SectionCard title="Segurança" icon={<Shield size={14} />} subtitle="Painel de segurança em desenvolvimento">
            <div className="text-center py-12 text-zinc-400">
              <Shield size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs">Logs de segurança, auditorias e eventos críticos serão exibidos aqui.</p>
            </div>
          </SectionCard>
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
