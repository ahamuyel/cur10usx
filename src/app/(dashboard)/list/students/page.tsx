"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import StudentForm from "@/components/forms/StudentForm"
import { useEntityList } from "@/hooks/useEntityList"
import Link from "next/link"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import AppAvatar from "@/components/ui/AppAvatar"
import { Pencil, Trash2, UserPlus, UserX, ArrowRightLeft, Loader2, List, LayoutGrid, Phone, Mail, MapPin } from "lucide-react"

type Student = {
  id: string
  name: string
  email: string
  foto: string | null
  phone: string
  classId?: string | null
  class?: { id: string; name: string; grade: number } | null
  address: string
  hasAccount?: boolean
  userActive?: boolean | null
}

const columns = [
  { header: "Aluno", accessor: "info" },
  { header: "E-mail", accessor: "email", className: "hidden md:table-cell" },
  { header: "Turma", accessor: "class" },
  { header: "Telefone", accessor: "phone", className: "hidden xl:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const StudentListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Student>({ endpoint: "/api/students", limit: 10 })

  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Student | null>(null)
  const [deleteItem, setDeleteItem] = useState<Student | null>(null)
  const [deactivateItem, setDeactivateItem] = useState<Student | null>(null)
  const [transferItem, setTransferItem] = useState<Student | null>(null)
  const [transferClassId, setTransferClassId] = useState("")
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState("")
  const [classOptions, setClassOptions] = useState<{ id: string; name: string; grade: number }[]>([])

  useEffect(() => {
    if (transferItem) {
      fetch("/api/classes?limit=200").then(r => r.json()).then(d => setClassOptions(d.data || [])).catch(() => {})
    }
  }, [transferItem])

  const filterConfig = [
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "gender", label: "Género", type: "select" as const, options: [{ value: "masculino", label: "Masculino" }, { value: "feminino", label: "Feminino" }] },
  ]
  
  const sortOptions = [
    { field: "name", label: "Nome" },
    { field: "createdAt", label: "Data de registo" },
  ]

  const handleTransfer = async () => {
    if (!transferItem || !transferClassId) return
    setTransferLoading(true)
    setTransferError("")
    try {
      const res = await fetch(`/api/students/${transferItem.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: transferClassId }),
      })
      if (!res.ok) {
        const d = await res.json()
        setTransferError(d.error || "Erro ao transferir")
        return
      }
      setTransferItem(null)
      setTransferClassId("")
      refetch()
    } catch {
      setTransferError("Erro de conexão")
    } finally {
      setTransferLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivateItem) return
    const res = await fetch(`/api/students/${deactivateItem.id}/deactivate`, { method: "POST" })
    if (res.ok) {
      setDeactivateItem(null)
      refetch()
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/classes/${deleteItem.id}`, { method: "DELETE" }) // Corrigido endpoint de fallback se necessário
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Student) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 shrink-0 select-none">
            <AppAvatar src={item.foto} name={item.name} className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700" fallbackClassName="text-[10px]" />
          </div>
          <Link href={`/list/students/${item.id}`} className="font-semibold text-zinc-900 dark:text-zinc-50 truncate hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
            {item.name}
          </Link>
        </div>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
        {item.email}
      </td>
      <td className="py-3 px-4">
        {item.class ? (
          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[11px] font-medium border border-zinc-200/50 dark:border-zinc-700/30">
            {item.class.name}
          </span>
        ) : (
          <span className="text-zinc-400 dark:text-zinc-600 text-xs">—</span>
        )}
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
          {isAdmin && (
            <button
              onClick={() => { setTransferItem(item); setTransferClassId(""); setTransferError("") }}
              title="Transferir de turma"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              <ArrowRightLeft size={12} />
            </button>
          )}
          {isAdmin && item.hasAccount && item.userActive !== false && (
            <button
              onClick={() => setDeactivateItem(item)}
              title="Desactivar conta"
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Alunos</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere e analise os registos dos estudantes matriculados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={clearFilters} activeCount={activeFilterCount} />
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
          Nenhum aluno encontrado.
        </div>
      ) : viewMode === "list" ? (
        /* VISUALIZAÇÃO EM TABELA NATIVA */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      ) : (
        /* VISUALIZAÇÃO EM CARDS (DESIGN ULTRA COMPACTO) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 w-full">
          {data.map((item) => (
            <div 
              key={item.id}
              className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between gap-4 shadow-3xs relative group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              {/* Topo do Card: Avatar, Nome e badge de Turma */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative w-10 h-10 shrink-0 select-none">
                  <AppAvatar src={item.foto} name={item.name} className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700" fallbackClassName="text-sm" />
                </div>
                
                <div className="min-w-0 flex flex-col gap-1">
                  <Link href={`/list/students/${item.id}`} className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm truncate block hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    {item.class ? (
                      <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded text-[10px] font-medium border border-zinc-200/30 dark:border-zinc-700/40">
                        {item.class.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">Sem turma</span>
                    )}
                    {item.hasAccount && item.userActive === false && (
                      <span className="px-1.5 py-0.5 bg-red-500/5 text-red-600 dark:text-red-400 rounded text-[10px] font-medium border border-red-500/10">Inativo</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informações de Contacto Discretas */}
              <div className="flex flex-col gap-1.5 border-t border-b border-zinc-100 dark:border-zinc-900/60 py-2.5 my-0.5 text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2 text-[11px] min-w-0">
                  <Mail size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] min-w-0 font-mono">
                  <Phone size={12} className="text-zinc-400 shrink-0" />
                  <span className="truncate tabular-nums">{item.phone || "—"}</span>
                </div>
              </div>

              {/* Footer do Card: Morada curta e Botões de Operação */}
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 min-w-0">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{item.address || "Sem endereço"}</span>
                </div>

                {/* Bloco de Botões Condicionais Modulares */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditItem(item)}
                    className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <Pencil size={11} />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => { setTransferItem(item); setTransferClassId(""); setTransferError("") }}
                      title="Transferir de turma"
                      className="w-6.5 h-6.5 flex items-center justify-center rounded bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                    >
                      <ArrowRightLeft size={11} />
                    </button>
                  )}
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
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Aluno">
        <StudentForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Aluno">
        {editItem && (
          <StudentForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />

      <DeleteConfirmModal
        open={!!deactivateItem}
        onClose={() => setDeactivateItem(null)}
        onConfirm={handleDeactivate}
        itemName={deactivateItem?.name || ""}
        title="Desistência / Desativar"
        message={`Tem a certeza que deseja desativar a conta de "${deactivateItem?.name}"? A matrícula será cancelada e o utilizador não conseguirá aceder à plataforma.`}
        confirmLabel="Desativar"
      />

      <FormModal open={!!transferItem} onClose={() => setTransferItem(null)} title="Transferir Aluno">
        {transferItem && (
          <div className="flex flex-col gap-4">
            {transferError && (
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">{transferError}</div>
            )}
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{transferItem.name}</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">
                Turma atual: <span className="font-medium text-zinc-700 dark:text-zinc-300">{transferItem.class?.name || "Sem turma"}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Nova Turma</label>
              <select
                className="h-9 w-full px-3 rounded-lg text-xs font-medium bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition cursor-pointer"
                value={transferClassId}
                onChange={(e) => setTransferClassId(e.target.value)}
              >
                <option value="">Selecionar turma...</option>
                {classOptions
                  .filter((c) => c.id !== transferItem.classId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.grade}.ª classe)</option>
                  ))}
              </select>
            </div>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setTransferItem(null)}
                className="h-9 px-4 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferClassId || transferLoading}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ArrowRightLeft size={13} />
                <span>{transferLoading ? "A transferir..." : "Transferir"}</span>
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  )
}

export default StudentListPage