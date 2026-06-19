"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AnnouncementForm from "@/components/forms/AnnouncementForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, Eye, EyeOff, LayoutGrid, List, Calendar, Megaphone, User } from "lucide-react"

type Announcement = {
  id: string
  title: string
  description: string
  priority: string
  classId?: string | null
  courseId?: string | null
  targetUserId?: string | null
  scheduledAt?: string | null
  class?: { id: string; name: string } | null
  course?: { id: string; name: string } | null
  author?: { id: string; name: string } | null
  readCount: number
  isRead: boolean
  createdAt: string
}

const priorityBadge: Record<string, string> = {
  informativo: "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
  importante: "border-amber-200 bg-amber-50/50 dark:border-amber-950/30 dark:bg-amber-950/10 text-amber-600 dark:text-amber-500",
  urgente: "border-rose-200 bg-rose-50/50 dark:border-rose-950/30 dark:bg-rose-950/10 text-rose-600 dark:text-rose-400",
}

const columns = [
  { header: "Título", accessor: "title" },
  { header: "Prioridade", accessor: "priority" },
  { header: "Destino", accessor: "target" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const AnnouncementListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const canManage = role === "school_admin" || role === "teacher"

  // Estado para alternância de visualização
  const [view, setView] = useState<"table" | "card">("table")

  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Announcement>({ 
    endpoint: "/api/announcements", 
    limit: 6 
  })

  const filterConfig = [
    { key: "priority", label: "Prioridade", type: "select" as const, options: [{ value: "informativo", label: "Informativo" }, { value: "importante", label: "Importante" }, { value: "urgente", label: "Urgente" }] },
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
  ]
  const sortOptions = [
    { field: "createdAt", label: "Data" },
    { field: "priority", label: "Prioridade" },
    { field: "title", label: "Título" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Announcement | null>(null)
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null)
  const [detailItem, setDetailItem] = useState<Announcement | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/announcements/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const handleRead = async (item: Announcement) => {
    setDetailItem(item)
    if (!item.isRead) {
      await fetch(`/api/announcements/${item.id}/read`, { method: "POST" })
      refetch()
    }
  }

  // Row Renderer para Visualização em Tabela
  const renderRow = (item: Announcement) => (
    <tr key={item.id} className={`border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors ${!item.isRead ? "bg-zinc-50/50 dark:bg-zinc-900/20 font-medium" : ""}`}>
      <td className="py-3 px-4">
        <button onClick={() => handleRead(item)} className="text-left block w-full focus:outline-hidden cursor-pointer group">
          <div className="flex items-center gap-2">
            {!item.isRead && <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-50 shrink-0" />}
            <span className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:underline decoration-zinc-400">{item.title}</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-md mt-0.5 font-normal">
            {item.description}
          </p>
        </button>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-tight ${priorityBadge[item.priority] || priorityBadge.informativo}`}>
          {item.priority}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium font-mono">
          {item.class?.name || item.course?.name || "Geral / Escola"}
        </span>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight">
        {new Date(item.createdAt).toLocaleDateString("pt")}
      </td>
      <td className="py-3 px-4 text-right">
        {canManage && (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => setEditItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Editar Aviso"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Eliminar Aviso"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Megaphone size={18} className="text-zinc-400 dark:text-zinc-500" />
            Mural de Avisos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Comunicações institucionais, diretivas e alertas globais ou por turmas.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />

            {data.length > 0 && (
              /* Seletor Dual View */
              <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 select-none">
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
            )}

            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Anunciar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= DATA RENDER LIST CONTAINER ================= */}
      <div className="w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
            Nenhum comunicado escolar localizado sob os critérios de pesquisa ativos.
          </div>
        ) : view === "table" ? (
          /* TABLE CORE VIEW */
          <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Table columns={columns} renderRow={renderRow} data={data} />
          </div>
        ) : (
          /* CARD CORE VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <div
                key={item.id}
                onClick={() => handleRead(item)}
                className={`flex flex-col justify-between p-4 rounded-xl border bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer group relative ${!item.isRead ? "border-zinc-400 dark:border-zinc-500 ring-1 ring-zinc-100 dark:ring-zinc-800/30" : "border-zinc-200 dark:border-zinc-800"}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-start gap-1.5 min-w-0">
                      {!item.isRead && (
                        <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-50 shrink-0 mt-1.5" />
                      )}
                      <h3 className={`text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1 group-hover:underline decoration-zinc-400 ${!item.isRead ? "font-bold" : ""}`}>
                        {item.title}
                      </h3>
                    </div>
                    <span className={`shrink-0 inline-flex items-center px-1.5 py-0.2 rounded border text-[9px] font-medium uppercase tracking-tight ${priorityBadge[item.priority] || priorityBadge.informativo}`}>
                      {item.priority}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                {/* Painel Inferior de Metadados / Ações */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                  <div className="flex items-center gap-3 font-mono tracking-tight min-w-0 pr-2">
                    <div className="flex items-center gap-1 shrink-0">
                      <Calendar size={11} />
                      <span>{new Date(item.createdAt).toLocaleDateString("pt")}</span>
                    </div>
                    <div className="border-l border-zinc-200 dark:border-zinc-800 h-2.5" />
                    <span className="truncate border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.2 rounded bg-zinc-50 dark:bg-zinc-900/50">
                      {item.class?.name || item.course?.name || "Geral"}
                    </span>
                  </div>

                  {canManage ? (
                    <div className="flex items-center gap-0.5 shrink-0 pl-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] font-mono shrink-0">
                      {item.isRead ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{item.isRead ? "Lido" : "Novo"}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sistema de Paginação */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= DIALOG FORM MODAL SYSTEM ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Criar Novo Aviso Coletivo">
        <AnnouncementForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Estrutura do Aviso">
        {editItem && (
          <AnnouncementForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      {/* Detail Modal */}
      <FormModal open={!!detailItem} onClose={() => setDetailItem(null)} title={detailItem?.title || "Leitura de Aviso"}>
        {detailItem && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800 text-xs">
              <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium uppercase tracking-tight ${priorityBadge[detailItem.priority] || priorityBadge.informativo}`}>
                {detailItem.priority}
              </span>
              <span className="text-zinc-400 font-mono flex items-center gap-1">
                <Calendar size={11} />
                {new Date(detailItem.createdAt).toLocaleDateString("pt")}
              </span>
              {detailItem.author && (
                <span className="text-zinc-400 flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                  <User size={11} />
                  <span>Emissor: {detailItem.author.name}</span>
                </span>
              )}
            </div>
            
            <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {detailItem.description}
            </div>
            
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800 font-mono">
              <span className="flex items-center gap-1"><Eye size={12} /> {detailItem.readCount} confirmações de abertura</span>
            </div>
          </div>
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.title || ""} />
    </div>
  )
}

export default AnnouncementListPage