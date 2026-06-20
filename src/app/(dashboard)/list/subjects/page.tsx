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
    <div className="w-full bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Disciplinas</h1>
          <p className="text-xs text-muted-foreground">Gere as disciplinas que compõem a matriz curricular.</p>
        </div>
        
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <div className="flex-1 sm:w-56 md:w-64">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-xl">
          Nenhuma disciplina encontrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-card rounded-xl border border-border p-3.5 flex items-center justify-between gap-4 shadow-card hover:border-foreground/20 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg border border-border/60 bg-accent/50 flex items-center justify-center text-muted-foreground shrink-0">
                  <BookOpen size={14} />
                </div>
                <span className="font-semibold text-foreground text-sm truncate">
                  {item.name}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditItem(item)}
                  className="w-7 h-7 flex items-center justify-center rounded bg-card hover:bg-accent border border-border text-muted-foreground transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={11} />
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-card text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border border-border hover:border-red-500/10 transition-colors cursor-pointer"
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

      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

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
