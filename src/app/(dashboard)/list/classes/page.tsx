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

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  const renderRow = (item: Class) => (
    <tr key={item.id} className="border-b border-border/50 text-sm hover:bg-accent transition-colors">
      <td className="py-3 px-4">
        <span className="font-semibold text-foreground">{item.name}</span>
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 bg-accent text-foreground rounded text-[11px] font-medium border border-border/50">
          {item.grade}.ª classe
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-muted-foreground">
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${item.period === "pos_laboral" ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10" : "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10"}`}>
          {periodLabels[item.period || "regular"] || "Regular"}
        </span>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground">
        <div className="flex items-center gap-1.5 text-xs">
          <Calendar size={13} className="text-muted-foreground shrink-0" />
          <span className="truncate">{item.academicYear?.name || "\u2014"}</span>
        </div>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground text-xs truncate max-w-[150px]">
        {item.course?.name || "\u2014"}
      </td>
      <td className="py-3 px-4 text-muted-foreground tabular-nums text-xs font-medium">
        {item._count?.students ?? 0}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors cursor-pointer"
          >
            <Pencil size={13} />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
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
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Turmas</h1>
          <p className="text-xs text-muted-foreground">Gere e monitorize as turmas ativas na instituição.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 justify-between sm:justify-end">
            <select
              value={filters.academicYearId || ""}
              onChange={(e) => handleFilterChange({ ...filters, academicYearId: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Todos os anos</option>
              {academicYears.map(y => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>

            <select
              value={filters.period || ""}
              onChange={(e) => handleFilterChange({ ...filters, period: e.target.value })}
              className="h-9 px-2.5 rounded-lg border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="">Todos os períodos</option>
              <option value="regular">Regular</option>
              <option value="pos_laboral">Pós-laboral</option>
            </select>

            <div className="h-9 p-1 bg-accent rounded-lg inline-flex items-center border border-border/50 select-none shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "list" 
                    ? "bg-card text-foreground shadow-card" 
                    : "text-muted-foreground hover:text-foreground"
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
                    ? "bg-card text-foreground shadow-card" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Visualização em cards"
              >
                <LayoutGrid size={14} />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Nova Turma</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs border border-dashed border-border rounded-xl">
          Nenhuma turma encontrada.
        </div>
      ) : viewMode === "list" ? (
        <div className="w-full overflow-x-auto rounded-lg border border-border">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id} 
              className="bg-card rounded-xl border border-border p-4 flex flex-col justify-between gap-4 shadow-card relative group hover:border-foreground/20 transition-colors"
            >
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground text-sm truncate">
                    {item.name}
                  </h3>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0",
                    item.period === "pos_laboral" ? "bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/10" : "bg-blue-500/5 text-blue-600 dark:text-blue-400 border-blue-500/10"
                  )}>
                    {periodLabels[item.period || "regular"] || "Regular"}
                  </span>
                </div>
                
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  {item.course?.name || "Curso não definido"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-b border-border/60 py-2.5 my-0.5">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <GraduationCap size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-medium truncate">{item.grade}.ª classe</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <Users size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-[11px] font-mono tabular-nums truncate">{item._count?.students ?? 0} alunos</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground truncate min-w-0">
                  <Calendar size={11} className="shrink-0" />
                  <span className="truncate">{item.academicYear?.name || "\u2014"}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-7 h-7 flex items-center justify-center rounded bg-accent hover:bg-accent border border-border text-muted-foreground transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="w-7 h-7 flex items-center justify-center rounded bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border border-border hover:border-red-500/10 transition-colors cursor-pointer"
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

      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

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
