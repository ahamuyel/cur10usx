"use client"

import { useEffect, useState } from "react"
import {
  School,
  Users,
  UserCheck,
  GraduationCap,
  FileText,
  Loader2,
  BarChart3,
  TrendingUp,
} from "lucide-react"

interface StatsData {
  totalSchools: number
  activeSchools: number
  pendingSchools: number
  totalUsers: number
  totalTeachers: number
  totalStudents: number
  totalParents: number
  totalApplications: number
  pendingApplications: number
}

interface StatCard {
  icon: React.ElementType
  label: string
  value: number
  color: string
  sub?: string
}

const colorMap: Record<string, { iconBg: string; iconText: string }> = {
  indigo: { iconBg: "bg-indigo-50 dark:bg-indigo-900/20", iconText: "text-indigo-600 dark:text-indigo-400" },
  emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-900/20", iconText: "text-emerald-600 dark:text-emerald-400" },
  amber: { iconBg: "bg-amber-50 dark:bg-amber-900/20", iconText: "text-amber-600 dark:text-amber-400" },
  cyan: { iconBg: "bg-cyan-50 dark:bg-cyan-900/20", iconText: "text-cyan-600 dark:text-cyan-400" },
  violet: { iconBg: "bg-violet-50 dark:bg-violet-900/20", iconText: "text-violet-600 dark:text-violet-400" },
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Erro ao carregar estatísticas:", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const schoolCards: StatCard[] = [
    { icon: School, label: "Total de Escolas", value: data.totalSchools, color: "indigo", sub: `${data.activeSchools} ativas, ${data.pendingSchools} pendentes` },
    { icon: TrendingUp, label: "Escolas Ativas", value: data.activeSchools, color: "emerald", sub: data.totalSchools > 0 ? `${Math.round((data.activeSchools / data.totalSchools) * 100)}% do total` : undefined },
    { icon: BarChart3, label: "Escolas Pendentes", value: data.pendingSchools, color: "amber", sub: data.totalSchools > 0 ? `${Math.round((data.pendingSchools / data.totalSchools) * 100)}% do total` : undefined },
  ]

  const userCards: StatCard[] = [
    { icon: Users, label: "Total Utilizadores", value: data.totalUsers, color: "indigo", sub: `${data.totalTeachers} prof. · ${data.totalStudents} alunos · ${data.totalParents} enc.` },
    { icon: UserCheck, label: "Professores", value: data.totalTeachers, color: "indigo", sub: data.totalUsers > 0 ? `${Math.round((data.totalTeachers / data.totalUsers) * 100)}% dos utilizadores` : undefined },
    { icon: GraduationCap, label: "Alunos", value: data.totalStudents, color: "cyan", sub: data.totalUsers > 0 ? `${Math.round((data.totalStudents / data.totalUsers) * 100)}% dos utilizadores` : undefined },
    { icon: Users, label: "Encarregados", value: data.totalParents, color: "violet", sub: data.totalUsers > 0 ? `${Math.round((data.totalParents / data.totalUsers) * 100)}% dos utilizadores` : undefined },
  ]

  const applicationCards: StatCard[] = [
    { icon: FileText, label: "Total Solicitações", value: data.totalApplications, color: "indigo", sub: `${data.pendingApplications} pendente(s)` },
    { icon: BarChart3, label: "Pendentes", value: data.pendingApplications, color: "amber", sub: data.totalApplications > 0 ? `${Math.round((data.pendingApplications / data.totalApplications) * 100)}% do total` : undefined },
  ]

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Painel de Controlo</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Visão geral das métricas da plataforma em tempo real.</p>
      </div>

      <Section title="Escolas" cards={schoolCards} />
      <Section title="Utilizadores" cards={userCards} />
      <Section title="Solicitações" cards={applicationCards} />
    </div>
  )
}

function Section({ title, cards }: { title: string; cards: StatCard[] }) {
  return (
    <div className="mb-12">
      <h2 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-5 ml-1">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCardComponent key={card.label} card={card} />
        ))}
      </div>
    </div>
  )
}

function StatCardComponent({ card }: { card: StatCard }) {
  const Icon = card.icon
  const colors = colorMap[card.color] ?? colorMap.indigo

  return (
    <div className="group bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm transition-all hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/50">
      <div className="flex items-center justify-between mb-5">
        <div className={`p-3 rounded-2xl ${colors.iconBg} transition-colors`}>
          <Icon className={`w-5 h-5 ${colors.iconText}`} />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
        <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
          {card.value.toLocaleString("pt-PT")}
        </h3>
      </div>
      
      {card.sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 font-medium">
          {card.sub}
        </p>
      )}
    </div>
  )
}