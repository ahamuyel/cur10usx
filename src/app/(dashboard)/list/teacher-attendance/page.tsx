"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FilterPanel from "@/components/ui/FilterPanel"
import { useEntityList } from "@/hooks/useEntityList"
import {
  Loader2, Calendar, CheckCircle, XCircle, AlertCircle, Clock,
  TrendingUp, TrendingDown, Users, BookOpen,
} from "lucide-react"

type TeacherAttendanceRecord = {
  id: string
  date: string
  status: string
  aulasPrevistas: number
  teacher: { id: string; name: string }
}

type DashboardData = {
  teachers: Array<{
    id: string
    name: string
    totalLessons: number
    taughtCount: number
    cancelledCount: number
    lateCount: number
    absentCount: number
    aulasPrevistas: number
    compliancePercentage: number
  }>
  summary: {
    totalTeachers: number
    totalLessonsScheduled: number
    totalAttendanceRecords: number
    totalAulasPrevistas: number
    totalTaught: number
    totalAbsences: number
    totalLates: number
    overallCompliance: number
  }
}

const statusLabels: Record<string, string> = {
  leccionada: "Leccionada",
  cancelada: "Cancelada",
  atrasada: "Atrasada",
  ausente: "Ausente",
}

const statusConfig: Record<string, { class: string }> = {
  leccionada: { class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  cancelada: { class: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700" },
  atrasada: { class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  ausente: { class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800" },
}

const statusOptions = [
  { value: "", label: "Todos" },
  { value: "leccionada", label: "Leccionada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "atrasada", label: "Atrasada" },
  { value: "ausente", label: "Ausente" },
]

const columns = [
  { header: "Data", accessor: "date" },
  { header: "Professor", accessor: "teacher" },
  { header: "Estado", accessor: "status" },
  { header: "Aulas", accessor: "aulas", className: "text-center" },
]

const TeacherAttendancePage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === "school_admin"

  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [dashLoading, setDashLoading] = useState(true)

  const { data, totalPages, page, setPage, filters, setFilters, loading } = useEntityList<TeacherAttendanceRecord>({
    endpoint: "/api/teacher-attendance",
    limit: 10,
  })

  useEffect(() => {
    const loadDashboard = async () => {
      setDashLoading(true)
      try {
        const res = await fetch("/api/teacher-attendance/dashboard")
        if (res.ok) {
          const json = await res.json()
          setDashboard(json)
        }
      } catch {
        // ignore
      } finally {
        setDashLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const filterConfig = [
    { key: "status", label: "Estado", type: "select" as const, options: statusOptions },
  ]

  const renderRow = (item: TeacherAttendanceRecord) => {
    const cfg = statusConfig[item.status] || { class: "bg-zinc-100 text-zinc-700" }
    return (
      <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs font-mono tabular-nums whitespace-nowrap">
          {new Date(item.date).toLocaleDateString("pt-PT")}
        </td>
        <td className="py-3 px-4">
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">
            {item.teacher.name}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.class}`}>
            {statusLabels[item.status] || item.status}
          </span>
        </td>
        <td className="py-3 px-4 text-center text-zinc-700 dark:text-zinc-300 text-sm font-mono">
          {item.aulasPrevistas}
        </td>
      </tr>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Dashboard Summary */}
      {dashLoading ? (
        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-zinc-400" />
        </div>
      ) : dashboard ? (
        <>
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">Assiduidade de Professores</h1>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <MetricCard
                icon={<Users size={16} />}
                label="Professores"
                value={dashboard.summary.totalTeachers}
              />
              <MetricCard
                icon={<BookOpen size={16} />}
                label="Aulas Previstas"
                value={dashboard.summary.totalAulasPrevistas}
              />
              <MetricCard
                icon={<CheckCircle size={16} />}
                label="Aulas Dadas"
                value={dashboard.summary.totalTaught}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <MetricCard
                icon={<TrendingUp size={16} />}
                label="Cumprimento"
                value={`${dashboard.summary.overallCompliance}%`}
                color={
                  dashboard.summary.overallCompliance >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : dashboard.summary.overallCompliance >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                }
              />
            </div>

            {/* Per-Teacher Table */}
            {dashboard.teachers.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-2.5 px-3 font-semibold text-zinc-500 text-xs">Professor</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-zinc-500 text-xs">Total</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-zinc-500 text-xs">Dadas</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-zinc-500 text-xs">Faltas</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-zinc-500 text-xs">Atrasos</th>
                      <th className="text-center py-2.5 px-2 font-semibold text-zinc-500 text-xs">% Cumprimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.teachers.map((t) => {
                      const complianceColor =
                        t.compliancePercentage >= 80
                          ? "text-emerald-600 dark:text-emerald-400"
                          : t.compliancePercentage >= 60
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      return (
                        <tr key={t.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
                          <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 text-sm">{t.name}</td>
                          <td className="py-2.5 px-2 text-center text-zinc-700 dark:text-zinc-300 font-mono">{t.totalLessons}</td>
                          <td className="py-2.5 px-2 text-center text-emerald-600 dark:text-emerald-400 font-mono">{t.taughtCount}</td>
                          <td className="py-2.5 px-2 text-center text-red-600 dark:text-red-400 font-mono">{t.absentCount}</td>
                          <td className="py-2.5 px-2 text-center text-amber-600 dark:text-amber-400 font-mono">{t.lateCount}</td>
                          <td className={`py-2.5 px-2 text-center font-bold font-mono ${complianceColor}`}>
                            {t.compliancePercentage}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detailed Records */}
          <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Registos Detalhados</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Histórico de presenças dos professores.</p>
              </div>
              <div className="flex items-center gap-2">
                <FilterPanel config={filterConfig} filters={filters} onChange={(f) => setFilters(f)} onClear={() => setFilters({})} activeCount={Object.keys(filters).length} />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={20} className="animate-spin text-zinc-400" />
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Calendar size={24} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
                Nenhum registo encontrado.
              </div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Table columns={columns} renderRow={renderRow} data={data} />
              </div>
            )}

            {!loading && data.length > 0 && (
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

function MetricCard({
  icon, label, value, color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
        <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${color || "text-zinc-900 dark:text-zinc-100"}`}>{value}</p>
    </div>
  )
}

export default TeacherAttendancePage
