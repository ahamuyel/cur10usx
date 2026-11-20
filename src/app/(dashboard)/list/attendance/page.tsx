"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import AttendanceForm from "@/components/forms/AttendanceForm"
import AttendanceStatsPanel from "@/components/ui/AttendanceStatsPanel"
import StudentAttendanceCard from "@/components/ui/StudentAttendanceCard"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { useEntityList } from "@/hooks/useEntityList"
import { Plus, Loader2, BarChart3, LayoutGrid, List, Calendar, User, Clock, CheckCircle, XCircle } from "lucide-react"

type Attendance = {
  id: string
  date: string
  status: string
  studentId: string
  classId: string
  lessonId?: string | null
  student?: { id: string; name: string }
  class?: { id: string; name: string }
  lesson?: { id: string; subject?: { name: string }; startTime?: string; endTime?: string } | null
}

const statusBadge: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  presente: { label: "Presente", class: "text-emerald-600 dark:text-emerald-400 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: CheckCircle },
  ausente: { label: "Ausente", class: "text-rose-600 dark:text-rose-400 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: XCircle },
  atrasado: { label: "Atrasado", class: "text-amber-600 dark:text-amber-500 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: Clock },
}

const columns = [
  { header: "Aluno(a)", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Data", accessor: "date" },
  { header: "Aula / Disciplina", accessor: "lesson", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
]

const AttendanceListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"

  // Estado de alternância de layout
  const [view, setView] = useState<"table" | "card">("table")

  const { data, total, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Attendance>({
    endpoint: "/api/attendance",
    limit: view === "table" ? 10 : 6,
  })

  const filterConfig = [
    { key: "academicYearId", label: "Ano Letivo", type: "select" as const, optionsEndpoint: "/api/academic-years?limit=100" },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
    ...(role === "school_admin" ? [{ key: "teacherId", label: "Professor", type: "select" as const, optionsEndpoint: "/api/teachers?limit=100" }] : []),
    { key: "status", label: "Estado", type: "select" as const, options: [{ value: "presente", label: "Presente" }, { value: "ausente", label: "Ausente" }, { value: "atrasado", label: "Atrasado" }] },
    { key: "date", label: "Data", type: "date" as const },
  ]
  
  const sortOptions = [
    { field: "date", label: "Data" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [statsClass, setStatsClass] = useState<string | null>(null)
  const [statsStudent, setStatsStudent] = useState<string | null>(null)

  // Renderizador de linhas para Tabela (Compact View)
  const renderRow = (item: Attendance) => {
    const statusKey = item.status.toLowerCase()
    const badge = statusBadge[statusKey] || { label: item.status, class: "text-zinc-600 bg-zinc-100", icon: CheckCircle }
    const BadgeIcon = badge.icon

    return (
      <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
        <td className="py-3 px-4">
          <button 
            onClick={() => setStatsStudent(item.studentId)} 
            className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline text-left cursor-pointer outline-none"
          >
            {item.student?.name}
          </button>
        </td>
        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">{item.class?.name}</td>
        <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight tabular-nums">
          {new Date(item.date).toLocaleDateString("pt-PT")}
        </td>
        <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
          {item.lesson ? (
            <span className="inline-flex flex-col">
              <span>{item.lesson.subject?.name}</span>
              {item.lesson.startTime && <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">{item.lesson.startTime}</span>}
            </span>
          ) : "—"}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${badge.class}`}>
            <BadgeIcon size={11} />
            <span>{badge.label}</span>
          </span>
        </td>
      </tr>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Assiduidade</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Controlo de presenças, faltas e atrasos {total > 0 && `(${total} ${total === 1 ? "registo" : "registos"})`}.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            
            {/* Seletor Dual View */}
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={() => setView("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${view === "table" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" : "text-zinc-400 hover:text-zinc-600"}`}
                title="Visualização em Tabela"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setView("card")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${view === "card" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" : "text-zinc-400 hover:text-zinc-600"}`}
                title="Visualização em Grelha"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {canManage && filters.classId && (
              <button
                onClick={() => setStatsClass(filters.classId)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                title="Estatísticas Rápidas da Turma"
              >
                <BarChart3 size={14} />
              </button>
            )}
            
            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Registar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= CONTENT CONTAINER ================= */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10 rounded-lg border border-zinc-200 dark:border-zinc-800">
          Nenhum registo de assiduidade encontrado sob os critérios atuais.
        </div>
      ) : view === "table" ? (
        /* TABLE VIEW SYSTEM */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* CARD VIEW SYSTEM */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const statusKey = item.status.toLowerCase()
            const badge = statusBadge[statusKey] || { label: item.status, class: "text-zinc-600 bg-zinc-100", icon: CheckCircle }
            const BadgeIcon = badge.icon

            return (
              <div 
                key={item.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <button
                    onClick={() => setStatsStudent(item.studentId)}
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline text-left outline-none flex items-center gap-1.5 group"
                  >
                    <User size={13} className="text-zinc-400 group-hover:text-zinc-600" />
                    <span className="line-clamp-1">{item.student?.name}</span>
                  </button>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${badge.class}`}>
                    <BadgeIcon size={10} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Subtítulo ou Contexto da Aula */}
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-4 font-medium min-h-[1.5rem]">
                  {item.lesson ? (
                    <span className="line-clamp-1">
                      {item.lesson.subject?.name} {item.lesson.startTime && `— ${item.lesson.startTime}`}
                    </span>
                  ) : (
                    <span className="italic text-zinc-300 dark:text-zinc-600">Registo diário global</span>
                  )}
                </div>

                {/* Metadados Rodapé */}
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-tight">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-zinc-400" />
                    <span>{new Date(item.date).toLocaleDateString("pt-PT")}</span>
                  </div>
                  <span className="bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded text-[11px] font-sans font-medium text-zinc-600 dark:text-zinc-400 border border-transparent">
                    {item.class?.name}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= PAGINAÇÃO ================= */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= PAINÉIS LATERAIS / MODAIS ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Registar Assiduidade">
        <AttendanceForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      {/* Painel Estatístico de Turma */}
      <FormModal open={!!statsClass} onClose={() => setStatsClass(null)} title="Métricas Gerais da Turma">
        {statsClass && <AttendanceStatsPanel classId={statsClass} />}
      </FormModal>

      {/* Histórico Consolidado do Aluno */}
      <FormModal open={!!statsStudent} onClose={() => setStatsStudent(null)} title="Perfil de Assiduidade do Aluno">
        {statsStudent && <StudentAttendanceCard studentId={statsStudent} />}
      </FormModal>
    </div>
  )
}

export default AttendanceListPage