"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ExamForm from "@/components/forms/ExamForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, SlidersHorizontal, ArrowUpDown, Plus, Loader2 } from "lucide-react"

type Exam = {
  id: string
  title?: string | null
  date: string
  subjectId: string
  classId: string
  teacherId: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  teacher?: { id: string; name: string }
}

const columns = [
  { header: "Título / Avaliação", accessor: "title" },
  { header: "Data", accessor: "date" },
  { header: "Disciplina", accessor: "subject" },
  { header: "Turma", accessor: "class", className: "hidden md:table-cell" },
  { header: "Professor(a)", accessor: "teacher", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const ExamListPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Exam>({ endpoint: "/api/exams", limit: 5 })

  const [editItem, setEditItem] = useState<Exam | null>(null)
  const [deleteItem, setDeleteItem] = useState<Exam | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/exams/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Exam) => (
    <tr key={item.id} className="border-b border-border/50 text-sm hover:bg-accent transition-colors">
      <td className="py-3 px-4">
        <span className="font-semibold text-foreground">{item.title || "Avaliação Sem Título"}</span>
      </td>
      <td className="py-3 px-4 text-muted-foreground text-xs font-mono tracking-tight tabular-nums">
        {new Date(item.date).toLocaleDateString("pt-PT")}
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-accent text-foreground rounded md:text-xs font-medium border border-transparent">
          {item.subject?.name}
        </span>
      </td>
      <td className="hidden md:table-cell text-muted-foreground text-xs px-4 py-3">
        {item.class?.name}
      </td>
      <td className="hidden lg:table-cell text-muted-foreground text-xs px-4 py-3">
        {item.teacher?.name}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            title="Editar prova"
          >
            <Pencil size={12} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
              title="Eliminar prova"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Provas</h1>
          <p className="text-xs text-muted-foreground">Gerencie o calendário de exames e avaliações contínuas.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          
          <div className="flex items-center gap-2 justify-end">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
              <SlidersHorizontal size={14} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
              <ArrowUpDown size={14} />
            </button>
            {isAdmin && (
              <button
                onClick={() => router.push("/list/exams/new")}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Nova Prova</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs bg-accent/40">
            Nenhuma prova ou avaliação mapeada para este critério.
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/60 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Prova">
        {editItem && (
          <ExamForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.title || deleteItem?.subject?.name || ""} />
    </div>
  )
}

export default ExamListPage
