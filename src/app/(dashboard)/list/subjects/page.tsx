"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import SubjectForm from "@/components/forms/SubjectForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, Plus, Loader2, BookOpen } from "lucide-react"

type Subject = {
  id: string
  name: string
}

const SubjectListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Subject>({ endpoint: "/api/subjects", limit: 12 })

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Subject | null>(null)
  const [deleteItem, setDeleteItem] = useState<Subject | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/subjects/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Disciplinas</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere as disciplinas que compõem a matriz curricular.</p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
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

      {/* ================= GRELHA DE CARDS EXCLUSIVA ================= */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          Nenhuma disciplina encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 flex items-center justify-between gap-4 shadow-3xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shrink-0">
                  <BookOpen size={14} />
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate">
                  {item.name}
                </span>
              </div>

              {/* Ações Rápidas Modulares */}
              <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
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
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Disciplina">
        <SubjectForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Disciplina">
        {editItem && (
          <SubjectForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />
    </div>
  )
}

export default SubjectListPage