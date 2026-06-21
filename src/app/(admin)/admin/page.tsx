"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Users,
  Building2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useTheme } from "@/provider/theme";

// --- Helpers ---
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pendente: "#f59e0b",
    aprovada: "#10b981",
    ativa: "#6366f1",
    suspensa: "#71717a",
    rejeitada: "#ef4444",
  };
  return colors[status] || "#a1a1aa";
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-950 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs">
        <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          {label || payload[0].name}
        </p>
        <p className="text-indigo-500 font-semibold">
          {payload[0].value} registos
        </p>
      </div>
    );
  }
  return null;
};

// --- Componente Principal ---
export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((json) => {
        if (json) setData(json);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return null;

  const totalSchoolsGrowth =
    data.schoolsGrowth?.reduce(
      (acc: number, curr: any) => acc + curr.count,
      0,
    ) || 0;

  const kpiCards = [
    {
      label: "Escolas Ativas",
      value: data.activeSchools ?? 0,
      icon: Building2,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      href: "/admin/schools",
    },
    {
      label: "Escolas Pendentes",
      value: data.pendingSchools ?? 0,
      icon: ShieldCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      href: "/admin/schools",
    },
    {
      label: "Total Utilizadores",
      value: data.totalUsers ?? 0,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      href: "/admin/users",
    },
    {
      label: "Solicitações",
      value: data.pendingApplications ?? 0,
      icon: TrendingUp,
      color: "text-sky-500",
      bg: "bg-sky-500/10",
      href: "/admin/applications",
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Painel de Controlo
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {kpiCards.map((card, i) => (
          <MetricCard
            key={i}
            title={card.label}
            value={card.value}
            icon={<card.icon className="w-4 h-4 text-violet-500" />}
            variant={card.label.includes("Pendente") || card.label.includes("Solicitações") ? "warning" : "info"}
            href={card.href}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Crescimento de Escolas"
          metric={`${totalSchoolsGrowth} total`}
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.schoolsGrowth}>
              {/* Ativamos os eixos removendo a prop 'hide' */}
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                dx={-10}
                allowDecimals={false} // Garante que apenas números inteiros apareçam
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ r: 4, fill: "#6366f1" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Card de Distribuição com Legenda */}
        <ChartCard
          title="Distribuição por Status"
          metric={`${data.statusBreakdown?.length} grupos`}
        >
          {/* Ajustamos a altura para ser um pouco mais flexível */}
          <div className="h-[160px] md:h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  dataKey="count"
                  innerRadius={50} // Ligeiramente menor para dar mais espaço
                  outerRadius={70}
                  cornerRadius={10}
                  paddingAngle={5}
                >
                  {data.statusBreakdown.map((e: any, i: number) => (
                    <Cell key={i} fill={getStatusColor(e.status)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legenda Responsiva: Alterna de 1 para 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {data.statusBreakdown.map((e: any) => (
              <div
                key={e.status}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: getStatusColor(e.status) }}
                  />
                  <span className="text-[10px] font-bold uppercase text-zinc-500 truncate">
                    {e.status}
                  </span>
                </div>
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {e.count}
                </span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentList
          title="Escolas Recentes"
          items={data.recentSchools}
          type="school"
        />
        <RecentList
          title="Solicitações Pendentes"
          items={data.recentApplications}
          type="app"
        />
      </div>
    </div>
  );
}

// --- Componentes Auxiliares ---
function RecentList({ title, items, type }: any) {
  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden transition-colors">
      <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <Link
          href="#"
          className="text-xs font-bold text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
        >
          Ver tudo <ArrowRight size={12} />
        </Link>
      </div>

      {/* Lista com hover states ajustados para ambos os modos */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item: any) => (
          <div
            key={item.id}
            className="p-4 md:p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
          >
            <div className="min-w-0 pr-4">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {item.name}
              </p>
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider truncate">
                {type === "school" ? item.city : item.school.name}
              </p>
            </div>
            {/* O StatusBadge deve ter o seu próprio tratamento de tema internamente */}
            <div className="shrink-0">
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, children, metric, className }: any) {
  return (
    <div
      className={cn(
        "p-6 rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-zinc-900 shadow-sm flex flex-col min-h-0", // min-h-0 é crucial
        className,
      )}
    >
      <div className="flex justify-between items-start mb-6 shrink-0">
        {" "}
        {/* shrink-0 para não comprimir o título */}
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {title}
        </h2>
        {metric && (
          <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
            {metric}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0">
        {" "}
        {/* Garante que o conteúdo (gráfico) respeite o espaço */}
        {children}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-3xl bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[300px] rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-[300px] rounded-3xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
