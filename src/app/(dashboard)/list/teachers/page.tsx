"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import TeacherForm from "@/components/forms/TeacherForm"
import { useEntityList } from "@/hooks/useEntityList"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, UserPlus, UserX, Loader2, List, LayoutGrid, Mail, Phone, BookOpen, Presentation } from "lucide-react"

type Teacher = {
  id: string
  name: string
  email: string
  foto: string | null
  phone: string
  subjects: string[]
  subjectIds: string[]
  classes: string[]
  classIds: string[]
  address: string
  hasAccount?: boolean
  userActive?: boolean | null
}

const columns = [
  { header: "Professor", accessor: "info" },
  { header: "E-mail", accessor: "email", className: "hidden md:table-cell" },
  { header: "Disciplinas", accessor: "subjects" },
  { header: "Turmas", accessor: "classes", className: "hidden lg:table-cell" },
  { header: "Telefone", accessor: "phone", className: "hidden xl:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const TeacherListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, sort, setSort, loading, refetch } = useEntityList<Teacher>({ endpoint: "/api/teachers", limit: 10 })

  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Teacher | null>(null)
  const [deleteItem, setDeleteItem] = useState<Teacher | null>(null)
  const [deactivateItem, setDeactivateItem] = useState<Teacher | null>(null)
  const [deactivateError, setDeactivateError] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const sortOptions = [
    { field: "name", label: "Nome" },
    { field: "createdAt", label: "Data de registo" },
  ]

  const handleDeactivate = async () => {
    if (!deactivateItem) return
    setDeactivateError("")
    const res = await fetch(`/api/teachers/${deactivateItem.id}/deactivate`, { method: "POST" })
    const resData = await res.json().catch(() => ({}))
    if (res.ok) {
      setDeactivateItem(null)
      refetch()
    } else {
      setDeactivateError(resData.error || "Erro ao desativar conta")
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    setDeleteError("")
    const res = await fetch(`/api/teachers/${deleteItem.id}`, { method: "DELETE" })
    const resData = await res.json().catch(() => ({}))
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    } else {
      setDeleteError(resData.error || "Erro ao eliminar professor")
    }
  }

  const renderRow = (item: Teacher) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 shrink-0 select-none">
            {item.foto ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={item.foto} alt={item.name} className="w-full h-full rounded-full object-cover border border-zinc-200/60 dark:border-zinc-800" />
            ) : (
              <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-700/30 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-xs font-semibold">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {item.name}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
        {item.email}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1 max-w-[220px]">
          {item.subjects?.slice(0, 2).map((s, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-medium border border-zinc-200/30 dark:border-zinc-700/40 uppercase whitespace-nowrap">
              {s}
            </span>
          ))}
          {item.subjects?.length > 2 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium self-center pl-0.5">+{item.subjects.length - 2}</span>
          )}
        </div>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs truncate max-w-[180px]">
        {item.classes?.length ? item.classes.join(", ") : "—"}
      </td>
      <td className="hidden xl:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs tabular-nums">
        {item.phone}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <Pencil size={12} />
          </button>
          {isAdmin && item.hasAccount && item.userActive !== false && (
            <button
              onClick={() => setDeactivateItem(item)}
              title="Desativar conta"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-colors cursor-pointer"
            >
              <UserX size={12} />
            </button>
          )}
          {isAdmin && item.hasAccount && item.userActive === false && (
            <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 rounded text-[10px] font-medium border border-zinc-200/20 select-none">Inativo</span>
          )}
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Professores</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere e analise os registos do corpo docente da instituição.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
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

            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
              >
                <UserPlus size={14} />
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
          Nenhum professor encontrado.
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM TABELA NATIVA */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARDS (DESIGN ALINHADO COM O DA TURMA/ALUNO) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 shadow-3xs relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Topo do Card: Avatar, Nome e badge de Inativo */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative w-10 h-10 shrink-0 select-none">
                  {item.foto ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.foto} alt={item.name} className="w-full h-full rounded-full object-cover border border-zinc-200/60 dark:border-zinc-800" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-700/30 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-sm font-semibold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="min-w-0 flex flex-col gap-1">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate block">
                    {item.name}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.hasAccount && item.userActive === false && (
                      <span className="px-1.5 py-0.5 bg-red-500/5 text-red-600 dark:text-red-400 rounded text-[10px] font-medium border border-red-500/10">Inativo</span>
                    )}
                    {item.subjects?.slice(0, 1).map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[10px] font-medium uppercase border border-zinc-200/30 truncate max-w-[90px]">
                        {s}
                      </span>
                    ))}
                    {item.subjects?.length > 1 && (
                      <span className="text-[10px] text-zinc-400 font-medium self-center pl-0.5">+{item.subjects.length - 1}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações Académicas e de Contacto */}
              <div className="flex flex-col gap-1.5 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-2.5 my-0.5 text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2 text-[11px] min-w-0">
                  <Mail size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] min-w-0 font-mono">
                  <Phone size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate tabular-nums">{item.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] min-w-0 mt-0.5">
                  <Presentation size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate text-zinc-600 dark:text-zinc-300 font-medium">
                    {item.classes?.length ? item.classes.join(", ") : "Sem turmas atribuídas"}
                  </span>
                </div>
              </div>

              {/* Footer do Card */}
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 min-w-0">
                  <BookOpen size={11} className="shrink-0" />
                  <span className="truncate">{item.subjects?.join(", ") || "Sem disciplina"}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {isAdmin && item.hasAccount && item.userActive !== false && (
                    <button
                      onClick={() => setDeactivateItem(item)}
                      title="Desativar conta"
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/10 transition-colors cursor-pointer"
                    >
                      <UserX size={11} />
                    </button>
                  )}
                  {isAdmin && (
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

      {/* ================= MODAIS DE FLUXO ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Professor">
        <TeacherForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Professor">
        {editItem && (
          <TeacherForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => { setDeleteItem(null); setDeleteError("") }} onConfirm={handleDelete} itemName={deleteItem?.name || ""} error={deleteError} />

      <DeleteConfirmModal
        open={!!deactivateItem}
        onClose={() => { setDeactivateItem(null); setDeactivateError("") }}
        onConfirm={handleDeactivate}
        itemName={deactivateItem?.name || ""}
        title="Desativar conta"
        message={`Tem a certeza que deseja desativar a conta de "${deactivateItem?.name}"? O utilizador não conseguirá aceder à plataforma.`}
        confirmLabel="Desativar"
        error={deactivateError}
      />
    </div>
  )
}

export default TeacherListPage