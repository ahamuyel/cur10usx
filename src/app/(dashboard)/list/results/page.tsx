"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ResultForm from "@/components/forms/ResultForm"
import StudentGradeSummary from "@/components/ui/StudentGradeSummary"
import ClassGradeSummary from "@/components/ui/ClassGradeSummary"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, BarChart3, LayoutGrid, List, Calendar, BookOpen, User } from "lucide-react"

type Result = {
  id: string
  score: number
  type: string
  date: string
  trimester?: string | null
  academicYear?: string | null
  studentId: string
  subjectId: string
  examId?: string | null
  assignmentId?: string | null
  student?: { id: string; name: string }
  subject?: { id: string; name: string }
  exam?: { id: string; title?: string | null }
  assignment?: { id: string; title?: string | null }
}

const getScoreColor = (score: number) => {
  if (score >= 14) return "text-emerald-600 dark:text-emerald-400 font-bold"
  if (score >= 10) return "text-amber-600 dark:text-amber-500 font-bold"
  return "text-rose-600 dark:text-rose-400 font-bold"
}

const trimesterLabels: Record<string, string> = { primeiro: "1.º Trim.", segundo: "2.º Trim.", terceiro: "3.º Trim." }

const columns = [
  { header: "Aluno(a)", accessor: "student" },
  { header: "Disciplina", accessor: "subject" },
  { header: "Nota", accessor: "score" },
  { header: "Componente", accessor: "type" },
  { header: "Trimestre", accessor: "trimester", className: "hidden md:table-cell" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const ResultListPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"

  // Estado para alternância de visualização
  const [view, setView] = useState<"table" | "card">("table")

  const { data, total, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Result>({
    endpoint: "/api/results",
    limit: view === "table" ? 8 : 6, // Limites adaptados à estrutura visual de cada view
  })

  const filterConfig = [
    { key: "academicYearId", label: "Ano Letivo", type: "select" as const, optionsEndpoint: "/api/academic-years?limit=100" },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
    ...(role === "school_admin" ? [{ key: "teacherId", label: "Professor", type: "select" as const, optionsEndpoint: "/api/teachers?limit=100" }] : []),
    { key: "type", label: "Tipo", type: "select" as const, options: [{ value: "Prova", label: "Prova" }, { value: "Tarefa", label: "Tarefa" }, { value: "Trabalho", label: "Trabalho" }, { value: "Participação", label: "Participação" }] },
    { key: "trimester", label: "Trimestre", type: "select" as const, options: [{ value: "primeiro", label: "1.º Trimestre" }, { value: "segundo", label: "2.º Trimestre" }, { value: "terceiro", label: "3.º Trimestre" }] },
    ...(role === "school_admin" || role === "teacher" ? [{ key: "studentId", label: "Estudante", type: "select" as const, optionsEndpoint: "/api/students?limit=100" }] : []),
  ]
  
  const sortOptions = [
    { field: "date", label: "Data" },
    { field: "score", label: "Nota" },
  ]

  const [editItem, setEditItem] = useState<Result | null>(null)
  const [deleteItem, setDeleteItem] = useState<Result | null>(null)
  const [summaryStudent, setSummaryStudent] = useState<string | null>(null)
  const [classSummary, setClassSummary] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/results/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) { setDeleteItem(null); refetch() }
  }

  // Renderizador de linhas para Table View
  const renderRow = (item: Result) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <button 
          onClick={() => setSummaryStudent(item.studentId)} 
          className="font-semibold text-zinc-900 dark:text-zinc-50 hover:underline text-left cursor-pointer outline-none"
        >
          {item.student?.name}
        </button>
      </td>
      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">{item.subject?.name}</td>
      <td className="py-3 px-4">
        <span className={`text-sm font-mono tracking-tight ${getScoreColor(item.score)}`}>
          {item.score.toFixed(1)}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium border border-transparent">
          {item.type}
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
        {item.trimester ? trimesterLabels[item.trimester] || item.trimester : "—"}
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight tabular-nums">
        {new Date(item.date).toLocaleDateString("pt-PT")}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          {canManage && (
            <>
              <button
                onClick={() => setEditItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Resultados</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pauta de aproveitamento académico {total > 0 && `(${total} ${total === 1 ? "lançamento" : "lançamentos"})`}.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            
            {/* Seletor de Views (Table / Card) */}
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={() => setView("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${view === "table" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" : "text-zinc-400 hover:text-zinc-600"}`}
                title="Visualização em Lista"
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

            {canManage && (
              <>
                <button
                  onClick={() => setClassSummary(filters.classId || "")}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                  title="Painel Estatístico da Turma"
                >
                  <BarChart3 size={14} />
                </button>
                <button
                  onClick={() => router.push("/list/results/new")}
                  className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus size={14} />
                  <span>Lançar Nota</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= CONDITIONAL CONTENT CONTAINER ================= */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10 rounded-lg border border-zinc-200 dark:border-zinc-800">
          Nenhum registo de avaliação encontrado para as especificações atuais.
        </div>
      ) : view === "table" ? (
        /* TABLE VIEW RENDER */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* CARD VIEW RENDER */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => (
            <div 
              key={item.id}
              className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <button
                  onClick={() => setSummaryStudent(item.studentId)}
                  className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 hover:underline text-left outline-none flex items-center gap-1.5 group"
                >
                  <User size={13} className="text-zinc-400 group-hover:text-zinc-600" />
                  <span className="line-clamp-1">{item.student?.name}</span>
                </button>
                <span className={`text-base font-mono tracking-tight ${getScoreColor(item.score)}`}>
                  {item.score.toFixed(1)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded text-[11px] font-medium border border-transparent">
                  <BookOpen size={11} className="text-zinc-400" />
                  {item.subject?.name}
                </span>
                <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 rounded text-[11px] font-medium border border-zinc-200/40 dark:border-zinc-800/40">
                  {item.type}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-tight">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-zinc-400" />
                  <span>{new Date(item.date).toLocaleDateString("pt-PT")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{item.trimester ? trimesterLabels[item.trimester] || item.trimester : "—"}</span>
                  
                  {canManage && (
                    <div className="flex items-center gap-0.5 ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                      <button
                        onClick={() => setEditItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINAÇÃO ================= */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= MODAIS ================= */}
      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Resultado">
        {editItem && <ResultForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />}
      </FormModal>

      <FormModal open={!!summaryStudent} onClose={() => setSummaryStudent(null)} title="Histórico e Médias Parciais">
        {summaryStudent && <StudentGradeSummary studentId={summaryStudent} trimester={filters.trimester || ""} academicYear={filters.academicYear || ""} />}
      </FormModal>

      <FormModal open={!!classSummary} onClose={() => setClassSummary(null)} title="Desempenho Geral da Turma">
        {classSummary && <ClassGradeSummary classId={classSummary} trimester={filters.trimester || ""} academicYear={filters.academicYear || ""} />}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.student?.name || ""} />
    </div>
  )
}

export default ResultListPage