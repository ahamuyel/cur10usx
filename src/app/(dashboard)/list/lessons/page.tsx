"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import LessonForm from "@/components/forms/LessonForm"
import LessonAttendanceForm from "@/components/forms/LessonAttendanceForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, ClipboardCheck, Paperclip, ExternalLink, List, LayoutGrid, Calendar, Clock, MapPin } from "lucide-react"

type Material = { title: string; url: string; type?: string }

type Lesson = {
  id: string
  day: string
  startTime: string
  endTime: string
  room?: string
  materials?: Material[] | null
  subjectId: string
  classId: string
  teacherId: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  teacher?: { id: string; name: string }
}

const columns = [
  { header: "Dia", accessor: "day" },
  { header: "Horário", accessor: "time" },
  { header: "Disciplina", accessor: "subject" },
  { header: "Turma", accessor: "class", className: "hidden md:table-cell" },
  { header: "Professor", accessor: "teacher", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const LessonListPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"
  
  const { 
    data, totalPages, page, search, setSearch, setPage, 
    filters, setFilters, sort, setSort, clearFilters, 
    activeFilterCount, loading, refetch 
  } = useEntityList<Lesson>({ endpoint: "/api/lessons", limit: 10 })

  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [editItem, setEditItem] = useState<Lesson | null>(null)
  const [deleteItem, setDeleteItem] = useState<Lesson | null>(null)
  const [attendanceLesson, setAttendanceLesson] = useState<Lesson | null>(null)
  const [materialsLesson, setMaterialsLesson] = useState<Lesson | null>(null)

  const filterConfig = [
    { key: "day", label: "Dia", type: "select" as const, options: [{ value: "Segunda", label: "Segunda" }, { value: "Terça", label: "Terça" }, { value: "Quarta", label: "Quarta" }, { value: "Quinta", label: "Quinta" }, { value: "Sexta", label: "Sexta" }] },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
  ]
  
  const sortOptions = [
    { field: "day", label: "Dia" },
    { field: "startTime", label: "Hora de início" },
  ]

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/lessons/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Lesson) => (
    <tr key={item.id} className="border-b border-border/50 text-sm hover:bg-accent transition-colors">
      <td className="py-3 px-4 font-semibold text-foreground">
        {item.day}
      </td>
      <td className="py-3 px-4 text-muted-foreground text-xs font-mono tabular-nums">
        {item.startTime} - {item.endTime}
      </td>
      <td className="py-3 px-4">
        <span className="px-1.5 py-0.5 bg-accent text-foreground rounded text-[10px] font-medium border border-border/40 uppercase whitespace-nowrap">
          {item.subject?.name}
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-muted-foreground text-xs truncate max-w-[150px]">
        {item.class?.name}
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-muted-foreground text-xs truncate max-w-[180px]">
        {item.teacher?.name}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          {item.materials && (item.materials as Material[]).length > 0 && (
            <button
              onClick={() => setMaterialsLesson(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
              title="Materiais de apoio"
            >
              <Paperclip size={12} />
            </button>
          )}
          {canManage && (
            <>
              <button
                onClick={() => setAttendanceLesson(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"
                title="Registar Presença / Sumário"
              >
                <ClipboardCheck size={12} />
              </button>
              <button
                onClick={() => setEditItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
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
    <div className="w-full bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
      
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Horário de Aulas</h1>
          <p className="text-xs text-muted-foreground">Gere as sessões diárias, sumários e distribuição de salas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            
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

            {canManage && (
              <button
                onClick={() => router.push("/list/lessons/new")}
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-colors cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>Adicionar</span>
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
          Nenhuma aula agendada encontrada.
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
                  <span className="px-2 py-0.5 bg-accent text-foreground rounded text-[10px] font-semibold border border-border/20 uppercase tracking-wide truncate max-w-[160px]">
                    {item.subject?.name}
                  </span>
                  {item.room && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-medium">
                      <MapPin size={11} />
                      <span>{item.room}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-foreground text-base flex items-center gap-1.5 mt-1">
                  <Calendar size={14} className="text-muted-foreground" />
                  {item.day}
                </h3>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-b border-border/60 py-2.5 my-0.5 text-muted-foreground text-[11px]">
                <div className="flex items-center gap-2 font-mono tracking-tight tabular-nums">
                  <Clock size={12} className="text-muted-foreground shrink-0" />
                  <span>{item.startTime} - {item.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground shrink-0">Turma:</span>
                  <span className="text-foreground font-semibold truncate">{item.class?.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-muted-foreground shrink-0">Prof:</span>
                  <span className="text-muted-foreground truncate">{item.teacher?.name || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 w-full shrink-0">
                <div className="min-w-0">
                  {item.materials && (item.materials as Material[]).length > 0 ? (
                    <button
                      onClick={() => setMaterialsLesson(item)}
                      className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-w-0"
                    >
                      <Paperclip size={11} className="shrink-0" />
                      <span className="truncate">{(item.materials as Material[]).length} ficheiros</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-muted-foreground/30 select-none">Sem anexos</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {canManage && (
                    <button
                      onClick={() => setAttendanceLesson(item)}
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 border border-border hover:border-emerald-500/10 transition-colors cursor-pointer"
                      title="Registar Presença / Sumário"
                    >
                      <ClipboardCheck size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent hover:bg-accent border border-border text-muted-foreground transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {canManage && (
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border border-border hover:border-red-500/10 transition-colors cursor-pointer"
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

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Aula">
        {editItem && (
          <LessonForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <FormModal open={!!attendanceLesson} onClose={() => setAttendanceLesson(null)} title={`Presença — ${attendanceLesson?.subject?.name || ""} (${attendanceLesson?.class?.name || ""})`}>
        {attendanceLesson && (
          <LessonAttendanceForm
            lessonId={attendanceLesson.id}
            classId={attendanceLesson.classId}
            onSuccess={() => { setAttendanceLesson(null); refetch() }}
            onCancel={() => setAttendanceLesson(null)}
          />
        )}
      </FormModal>

      <FormModal open={!!materialsLesson} onClose={() => setMaterialsLesson(null)} title={`Materiais — ${materialsLesson?.subject?.name || ""}`}>
        {materialsLesson?.materials && (
          <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-0.5">
            {(materialsLesson.materials as Material[]).map((m, i) => (
              <a
                key={i}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg bg-accent border border-border hover:border-foreground/20 transition-colors group/link"
              >
                <div className="w-7 h-7 rounded bg-card border border-border flex items-center justify-center text-muted-foreground group-hover/link:text-foreground shrink-0">
                  <Paperclip size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{m.title}</p>
                  {m.type && <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{m.type}</span>}
                </div>
                <ExternalLink size={12} className="text-muted-foreground shrink-0" />
              </a>
            ))}
          </div>
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.subject?.name || deleteItem?.day || ""} />
    </div>
  )
}

export default LessonListPage
