"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import CourseForm from "@/components/forms/CourseForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, Plus, Loader2, List, LayoutGrid, GraduationCap, Layers } from "lucide-react"

type Course = {
  id: string
  name: string
  subjects?: string[]
  subjectIds?: string[]
}

const columns = [
  { header: "Curso", accessor: "name" },
  { header: "Disciplinas", accessor: "subjects" },
  { header: "Ações", accessor: "actions" },
]

const CourseListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Course>({ endpoint: "/api/courses", limit: 10 })

  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Course | null>(null)
  const [deleteItem, setDeleteItem] = useState<Course | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/courses/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Course) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
            <GraduationCap size={15} />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {item.name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1 max-w-[400px]">
          {item.subjects?.slice(0, 3).map((s, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-medium border border-zinc-200/30 dark:border-zinc-700/40 uppercase whitespace-nowrap">
              {s}
            </span>
          ))}
          {(item.subjects?.length ?? 0) > 3 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium self-center pl-0.5">
              +{(item.subjects?.length ?? 0) - 3}
            </span>
          )}
          {(!item.subjects || item.subjects.length === 0) && (
            <span className="text-zinc-400 dark:text-zinc-600 text-xs">—</span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Pencil size={12} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Cursos</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere as especializações e as respetivas grelhas curriculares.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            {/* Alternador de Visualização (Toggle Group) */}
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
                <span>Adicionar</span>
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
          Nenhum curso encontrado.
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM TABELA */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARDS (DESIGN POLIDO) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 shadow-3xs relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Topo do Card: Ícone e Nome do Curso */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-600 dark:text-zinc-400 shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm tracking-tight truncate block">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                    <Layers size={11} />
                    <span>{item.subjects?.length || 0} disciplinas</span>
                  </div>
                </div>
              </div>

              {/* Lista Interna Compacta de Disciplinas */}
              <div className="flex flex-wrap gap-1 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-3 my-0.5 min-h-[58px] content-start">
                {item.subjects && item.subjects.length > 0 ? (
                  item.subjects.slice(0, 4).map((s, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium border border-zinc-200/40 dark:border-zinc-800/60 uppercase max-w-[110px] truncate">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-600 text-[11px] italic self-center">Sem disciplinas associadas</span>
                )}
                {(item.subjects?.length ?? 0) > 4 && (
                  <span className="text-[10px] text-zinc-400 font-medium self-center pl-0.5">
                    +{(item.subjects?.length ?? 0) - 4} mais
                  </span>
                )}
              </div>

              {/* Footer do Card com Botões Operacionais */}
              <div className="flex items-center justify-end gap-1 w-full shrink-0">
                <button
                  onClick={() => setEditItem(item)}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={11} />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-white dark:bg-zinc-950 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 hover:border-red-500/10 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
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
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Curso">
        <CourseForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Curso">
        {editItem && (
          <CourseForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />
    </div>
  )
}

export default CourseListPage