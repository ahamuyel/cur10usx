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
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">
        {item.day}
      </td>
      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tabular-nums">
        {item.startTime} - {item.endTime}
      </td>
      <td className="py-3 px-4">
        <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-medium border border-zinc-200/30 dark:border-zinc-700/40 uppercase whitespace-nowrap">
          {item.subject?.name}
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs truncate max-w-[150px]">
        {item.class?.name}
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs truncate max-w-[180px]">
        {item.teacher?.name}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          {item.materials && (item.materials as Material[]).length > 0 && (
            <button
              onClick={() => setMaterialsLesson(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
              title="Materiais de apoio"
            >
              <Paperclip size={12} />
            </button>
          )}
          {canManage && (
            <>
              <button
                onClick={() => setAttendanceLesson(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors cursor-pointer"
                title="Registar Presença / Sumário"
              >
                <ClipboardCheck size={12} />
              </button>
              <button
                onClick={() => setEditItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Horário de Aulas</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere as sessões diárias, sumários e distribuição de salas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            
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

            {canManage && (
              <button
                onClick={() => router.push("/list/lessons/new")}
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
          Nenhuma aula agendada encontrada.
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM TABELA */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARDS (CRANOGRAMA VISUAL) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 shadow-3xs relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Topo: Disciplina e Bloco Horário */}
              <div className="flex flex-col gap-1.5 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded text-[10px] font-semibold border border-zinc-200/20 uppercase tracking-wide truncate max-w-[160px]">
                    {item.subject?.name}
                  </span>
                  {item.room && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 shrink-0 font-medium">
                      <MapPin size={11} />
                      <span>{item.room}</span>
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-base flex items-center gap-1.5 mt-1">
                  <Calendar size={14} className="text-zinc-400" />
                  {item.day}
                </h3>
              </div>

              {/* Informações da Aula (Horário, Turma e Docente) */}
              <div className="flex flex-col gap-1.5 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-2.5 my-0.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
                <div className="flex items-center gap-2 font-mono tracking-tight tabular-nums">
                  <Clock size={12} className="text-zinc-400 shrink-0" />
                  <span>{item.startTime} - {item.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-400 shrink-0">Turma:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold truncate">{item.class?.name || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-400 shrink-0">Prof:</span>
                  <span className="text-zinc-600 dark:text-zinc-400 truncate">{item.teacher?.name || "—"}</span>
                </div>
              </div>

              {/* Footer: Indicadores e Painel Operacional */}
              <div className="flex items-center justify-between gap-2 w-full shrink-0">
                <div className="min-w-0">
                  {item.materials && (item.materials as Material[]).length > 0 ? (
                    <button
                      onClick={() => setMaterialsLesson(item)}
                      className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer min-w-0"
                    >
                      <Paperclip size={11} className="shrink-0" />
                      <span className="truncate">{(item.materials as Material[]).length} ficheiros</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-700 select-none">Sem anexos</span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {canManage && (
                    <button
                      onClick={() => setAttendanceLesson(item)}
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/10 transition-colors cursor-pointer"
                      title="Registar Presença / Sumário"
                    >
                      <ClipboardCheck size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {canManage && (
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 hover:border-red-500/10 transition-colors cursor-pointer"
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

      {/* ================= MODAIS DE SUPORTE E FLUXO ================= */}
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
                className="flex items-center gap-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group/link"
              >
                <div className="w-7 h-7 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/link:text-zinc-900 dark:group-hover/link:text-zinc-100 shrink-0">
                  <Paperclip size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{m.title}</p>
                  {m.type && <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{m.type}</span>}
                </div>
                <ExternalLink size={12} className="text-zinc-400 shrink-0" />
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