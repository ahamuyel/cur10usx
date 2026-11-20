"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ClassForm from "@/components/forms/ClassForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, Plus, Loader2, Calendar, LayoutGrid, List, GraduationCap, Users } from "lucide-react"

type Class = {
  id: string
  name: string
  grade: number
  capacity: number
  period?: string
  courseId?: string | null
  supervisorId?: string | null
  course?: { id: string; name: string } | null
  academicYear?: { id: string; name: string } | null
  _count?: { students: number }
}

const periodLabels: Record<string, string> = {
  regular: "Regular",
  pos_laboral: "Pós-laboral",
}

const columns = [
  { header: "Turma", accessor: "name" },
  { header: "Classe", accessor: "grade" },
  { header: "Período", accessor: "period", className: "hidden md:table-cell" },
  { header: "Ano Letivo", accessor: "academicYear", className: "hidden lg:table-cell" },
  { header: "Curso", accessor: "course", className: "hidden lg:table-cell" },
  { header: "Alunos", accessor: "students" },
  { header: "Ações", accessor: "actions" },
]

const ClassListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch, filters, setFilters } = useEntityList<Class>({ endpoint: "/api/classes", limit: 10 })

  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Class | null>(null)
  const [deleteItem, setDeleteItem] = useState<Class | null>(null)
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/academic-years")
      .then(r => r.json())
      .then(d => setAcademicYears(d.data || []))
      .catch(() => {})
  }, [])

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/classes/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  // Atualiza os filtros e força o reset para a primeira página para evitar desfasamento
  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const renderRow = (item: Class) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-55 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</span>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[11px] font-medium border border-zinc-200/50 dark:border-zinc-700/30">
          {item.grade}.ª classe
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400">
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${item.period === "pos_laboral" ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10" : "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10"}`}>
          {periodLabels[item.period || "regular"] || "Regular"}
        </span>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar size={13} className="text-zinc-400 shrink-0" />
          <span className="truncate">{item.academicYear?.name || "\u2014"}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-[150px]">
        {item.course?.name || "\u2014"}
      </td>
      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 tabular-nums text-xs font-medium">
        {item._count?.students ?? 0}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 transition-colors cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Turmas</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere e monitorize as turmas ativas na instituição.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 justify-between sm:justify-end">
            <select
              value={filters.academicYearId || ""}
              onChange={(e) => handleFilterChange({ ...filters, academicYearId: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer"
            >
              <option value="">Todos os anos</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>

            <select
              value={filters.period || ""}
              onChange={(e) => handleFilterChange({ ...filters, period: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer"
            >
              <option value="">Todos os períodos</option>
              <option value="regular">Regular</option>
              <option value="pos_laboral">Pós-laboral</option>
            </select>

            {/* Alternador de Visualização (Toggle Group Shadcn Style) */}
            <div className="h-9 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg inline-flex items-center border border-zinc-200/50 dark:border-zinc-800/50 select-none shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "list" 
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="Visualização em lista"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "card" 
                    ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                )}
                title="Visualização em cards"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Nova Turma</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= ÁREA DE CONTEÚDO MUTÁVEL ================= */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          Nenhuma turma encontrada.
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM TABELA (NATIVA DO SHADCN) */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARDS (GRID TOTALMENTE RESPONSIVO) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id} 
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 shadow-3xs relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                    {item.name}
                  </h3>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0",
                    item.period === "pos_laboral" ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10" : "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10"
                  )}>
                    {periodLabels[item.period || "regular"] || "Regular"}
                  </span>
                </div>
                
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate font-medium">
                  {item.course?.name || "Curso não definido"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-100 dark:border-zinc-900 py-2.5 my-0.5">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 min-w-0">
                  <GraduationCap size={13} className="text-zinc-400 shrink-0" />
                  <span className="text-[11px] font-medium truncate">{item.grade}.ª classe</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 min-w-0">
                  <Users size={13} className="text-zinc-400 shrink-0" />
                  <span className="text-[11px] font-mono tabular-nums truncate">{item._count?.students ?? 0} alunos</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 truncate min-w-0">
                  <Calendar size={11} className="shrink-0" />
                  <span className="truncate">{item.academicYear?.name || "\u2014"}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 hover:border-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= PAGINAÇÃO ================= */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= MODAIS DE FLUXO ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Turma">
        <ClassForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Turma">
        {editItem && (
          <ClassForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />
    </div>
  )
}

export default ClassListPage