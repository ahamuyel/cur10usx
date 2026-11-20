"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import { useEntityList } from "@/hooks/useEntityList"
import { Eye, Plus, Loader2, SlidersHorizontal, ArrowUpDown } from "lucide-react"

type Enrollment = {
  id: string
  status: "ativa" | "transferida" | "cancelada" | "concluida" | "aprovada" | "reprovada" | "em_recurso"
  finalAverage: number | null
  failedSubjects: number | null
  observation: string | null
  enrolledAt: string
  decidedAt: string | null
  student: { id: string; name: string; email: string }
  class: { id: string; name: string; grade: number }
  academicYear: { id: string; name: string }
}

type SelectOption = { id: string; name: string }

const statusLabels: Record<string, string> = {
  ativa: "Ativa",
  transferida: "Transferida",
  cancelada: "Cancelada",
  concluida: "Concluída",
  aprovada: "Aprovada",
  reprovada: "Reprovada",
  em_recurso: "Em Recurso",
}

const statusColors: Record<string, string> = {
  ativa: "bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-emerald-500/10",
  aprovada: "bg-zinc-100 dark:bg-zinc-900 text-blue-600 dark:text-blue-400 border-blue-500/10",
  reprovada: "bg-zinc-100 dark:bg-zinc-900 text-rose-600 dark:text-rose-400 border-rose-500/10",
  em_recurso: "bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-amber-500/10",
  transferida: "bg-zinc-100 dark:bg-zinc-900 text-violet-600 dark:text-violet-400 border-violet-500/10",
  cancelada: "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 dark:border-zinc-800",
  concluida: "bg-zinc-100 dark:bg-zinc-900 text-cyan-600 dark:text-cyan-400 border-cyan-500/10",
}

const allStatuses = ["ativa", "transferida", "cancelada", "concluida", "aprovada", "reprovada", "em_recurso"]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const columns = [
  { header: "Aluno", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Ano Letivo", accessor: "academicYear", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
  { header: "Média Final", accessor: "finalAverage", className: "hidden lg:table-cell" },
  { header: "Data Matrícula", accessor: "enrolledAt", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const EnrollmentListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const { data, totalPages, page, search, setSearch, setPage, loading, refetch, filters, setFilters } =
    useEntityList<Enrollment>({ endpoint: "/api/enrollments", limit: 10 })

  const [createOpen, setCreateOpen] = useState(false)
  const [viewItem, setViewItem] = useState<Enrollment | null>(null)

  const [academicYears, setAcademicYears] = useState<SelectOption[]>([])
  const [students, setStudents] = useState<(SelectOption & { email: string })[]>([])
  const [classes, setClasses] = useState<(SelectOption & { grade: number })[]>([])

  const [createForm, setCreateForm] = useState({ studentId: "", classId: "", academicYearId: "", status: "ativa", observation: "" })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    fetch("/api/academic-years?limit=100")
      .then((r) => r.json())
      .then((j) => setAcademicYears(j.data || []))
      .catch(() => {})
  }, [])

  const loadCreateOptions = () => {
    if (students.length === 0) {
      fetch("/api/students?limit=500")
        .then((r) => r.json())
        .then((j) => setStudents(j.data || []))
        .catch(() => {})
    }
    if (classes.length === 0) {
      fetch("/api/classes?limit=500")
        .then((r) => r.json())
        .then((j) => setClasses(j.data || []))
        .catch(() => {})
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createForm.studentId || !createForm.classId || !createForm.academicYearId) {
      setCreateError("Preencha todos os campos obrigatórios.")
      return
    }
    setCreateLoading(true)
    setCreateError("")
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.error || "Erro ao criar matrícula")
      }
      setCreateOpen(false)
      setCreateForm({ studentId: "", classId: "", academicYearId: "", status: "ativa", observation: "" })
      refetch()
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar matrícula")
    } finally {
      setCreateLoading(false)
    }
  }

  const renderRow = (item: Enrollment) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.student.name}</span>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">{item.student.email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded md:text-xs font-medium border border-transparent">
          {item.class.name}
        </span>
      </td>
      <td className="hidden md:table-cell text-zinc-600 dark:text-zinc-400 text-xs px-4 py-3">
        {item.academicYear.name}
      </td>
      <td className="py-3 px-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[item.status] || ""}`}>
          {statusLabels[item.status] || item.status}
        </span>
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs px-4 py-3 font-mono tracking-tight">
        {item.finalAverage !== null ? item.finalAverage.toFixed(1) : "\u2014"}
      </td>
      <td className="hidden lg:table-cell text-zinc-600 dark:text-zinc-400 text-xs px-4 py-3 font-mono tracking-tight">
        {formatDate(item.enrolledAt)}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setViewItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer"
            title="Ver detalhes"
          >
            <Eye size={12} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Matrículas</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerencie e acompanhe a distribuição do histórico escolar dos alunos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            <select
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
            >
              <option value="">Todos os estados</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>

            <select
              value={filters.academicYearId || ""}
              onChange={(e) => setFilters({ ...filters, academicYearId: e.target.value })}
              className="h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
            >
              <option value="">Todos os anos</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>{ay.name}</option>
              ))}
            </select>

            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
              <SlidersHorizontal size={14} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors">
              <ArrowUpDown size={14} />
            </button>

            {isAdmin && (
              <button
                onClick={() => { setCreateOpen(true); loadCreateOptions() }}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Nova Matrícula</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= DATA GRID / TABELA ================= */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10">
            Nenhuma matrícula encontrada no sistema.
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {/* ================= PAGINAÇÃO ================= */}
      {!loading && data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= MODAL: CRIAÇÃO ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Matrícula">
        <form onSubmit={handleCreate} className="mt-2">
          {createError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/10">
              {createError}
            </div>
          )}
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Aluno *</label>
              <select
                value={createForm.studentId}
                required
                onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
              >
                <option value="">Selecione um aluno</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Turma *</label>
                <select
                  value={createForm.classId}
                  required
                  onChange={(e) => setCreateForm({ ...createForm, classId: e.target.value })}
                  className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
                >
                  <option value="">Selecione a turma</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.grade}ª classe)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Ano Letivo *</label>
                <select
                  value={createForm.academicYearId}
                  required
                  onChange={(e) => setCreateForm({ ...createForm, academicYearId: e.target.value })}
                  className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
                >
                  <option value="">Selecione o ano letivo</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>{ay.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Estado Inicial</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition cursor-pointer"
              >
                {allStatuses.map((s) => (
                  <option key={s} value={s}>{statusLabels[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Observações</label>
              <textarea
                value={createForm.observation}
                onChange={(e) => setCreateForm({ ...createForm, observation: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition resize-none placeholder:text-zinc-400"
                placeholder="Notas suplementares opcionais..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="h-8 px-3 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="h-8 px-3 rounded-md text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {createLoading && <Loader2 size={12} className="animate-spin" />}
              {createLoading ? "A processar..." : "Confirmar Matrícula"}
            </button>
          </div>
        </form>
      </FormModal>

      {/* ================= MODAL: DETALHES ================= */}
      <FormModal open={!!viewItem} onClose={() => setViewItem(null)} title="Detalhes da Matrícula">
        {viewItem && (
          <div className="flex flex-col gap-5 mt-2">
            <div className="grid grid-cols-2 gap-y-4 gap-x-3 border-b border-zinc-100 dark:border-zinc-900 pb-4">
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Aluno</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{viewItem.student.name}</span>
                <p className="text-[11px] font-mono tracking-tight text-zinc-400 dark:text-zinc-500">{viewItem.student.email}</p>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Turma atribuída</span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{viewItem.class.name}</span>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">{viewItem.class.grade}ª classe</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-3">
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Ciclo Letivo</span>
                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{viewItem.academicYear.name}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Estado Vigente</span>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${statusColors[viewItem.status] || ""}`}>
                    {statusLabels[viewItem.status] || viewItem.status}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Média Final Global</span>
                <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                  {viewItem.finalAverage !== null ? viewItem.finalAverage.toFixed(1) : "\u2014"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Cadeiras em Atraso</span>
                <span className="text-xs font-mono text-zinc-800 dark:text-zinc-200">
                  {viewItem.failedSubjects !== null ? viewItem.failedSubjects : "0"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Data de Registo</span>
                <span className="text-xs font-mono tracking-tight text-zinc-600 dark:text-zinc-400">{formatDate(viewItem.enrolledAt)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">Data de Despacho</span>
                <span className="text-xs font-mono tracking-tight text-zinc-600 dark:text-zinc-400">{formatDate(viewItem.decidedAt)}</span>
              </div>
            </div>

            {viewItem.observation && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Notas de Observação</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/60 rounded-lg p-2.5 leading-relaxed">
                  {viewItem.observation}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => setViewItem(null)}
                className="h-8 px-3 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

export default EnrollmentListPage