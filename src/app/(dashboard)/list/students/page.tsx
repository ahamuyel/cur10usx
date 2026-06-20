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
    const res = await fetch(`/api/classes/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  const renderRow = (item: Student) => (
    <tr key={item.id} className="border-b border-border/50 text-sm hover:bg-accent transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-8 h-8 shrink-0 select-none">
            {item.foto ? (
              <img src={item.foto} alt={item.name} className="w-full h-full rounded-full object-cover border border-border/60" />
            ) : (
              <div className="w-full h-full rounded-full bg-accent border border-border/40 flex items-center justify-center text-foreground text-xs font-semibold">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <Link href={`/list/students/${item.id}`} className="font-semibold text-foreground truncate hover:text-foreground transition-colors">
            {item.name}
          </Link>
        </div>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-muted-foreground text-xs">
        {item.email}
      </td>
      <td className="py-3 px-4">
        {item.class ? (
          <span className="px-2 py-0.5 bg-accent text-foreground rounded text-[11px] font-medium border border-border/50">
            {item.class.name}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </td>
      <td className="hidden xl:table-cell py-3 px-4 text-muted-foreground font-mono text-xs tabular-nums">
        {item.phone}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <Pencil size={12} />
          </button>
          {isAdmin && (
            <button
              onClick={() => { setTransferItem(item); setTransferClassId(""); setTransferError("") }}
              title="Transferir de turma"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <ArrowRightLeft size={12} />
            </button>
          )}
          {isAdmin && item.hasAccount && item.userActive !== false && (
            <button
              onClick={() => setDeactivateItem(item)}
              title="Desactivar conta"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-colors cursor-pointer"
            >
              <UserX size={12} />
            </button>
          )}
          {isAdmin && item.hasAccount && item.userActive === false && (
            <span className="px-1.5 py-0.5 bg-accent text-muted-foreground rounded text-[10px] font-medium border border-border/20 select-none">Inativo</span>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
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
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Alunos</h1>
          <p className="text-xs text-muted-foreground">Gere e analise os registos dos estudantes matriculados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            
            <div className="h-9 p-1 rounded-lg inline-flex items-center border border-border/50 select-none shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-all cursor-pointer",
                  viewMode === "list" 
                    ? "bg-primary text-primary-foreground shadow-card" 
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
                    ? "bg-primary text-primary-foreground shadow-card" 
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
                className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-card transition-colors cursor-pointer shrink-0"
              >
                <UserPlus size={14} />
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
          Nenhum aluno encontrado.
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
              <div className="flex items-start gap-3 min-w-0">
                <div className="relative w-10 h-10 shrink-0 select-none">
                  {item.foto ? (
                    <img src={item.foto} alt={item.name} className="w-full h-full rounded-full object-cover border border-border/60" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-accent border border-border/40 flex items-center justify-center text-foreground text-sm font-semibold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col gap-1">
                  <Link href={`/list/students/${item.id}`} className="font-semibold text-foreground text-sm truncate block hover:text-foreground transition-colors">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-1.5">
                    {item.class ? (
                      <span className="px-1.5 py-0.5 bg-accent text-foreground rounded text-[10px] font-medium border border-border/30">
                        {item.class.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">Sem turma</span>
                    )}
                    {item.hasAccount && item.userActive === false && (
                      <span className="px-1.5 py-0.5 bg-red-500/5 text-destructive rounded text-[10px] font-medium border border-red-500/10">Inativo</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 border-t border-b border-border/60 py-2.5 my-0.5 text-muted-foreground">
                <div className="flex items-center gap-2 text-[11px] min-w-0">
                  <Mail size={12} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{item.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] min-w-0 font-mono">
                  <Phone size={12} className="text-muted-foreground shrink-0" />
                  <span className="truncate tabular-nums">{item.phone || "—"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground min-w-0">
                  <MapPin size={11} className="shrink-0" />
                  <span className="truncate">{item.address || "Sem endereço"}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setEditItem(item)} className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent hover:bg-accent border border-border text-muted-foreground transition-colors cursor-pointer">
                    <Pencil size={11} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => { setTransferItem(item); setTransferClassId(""); setTransferError("") }} className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent hover:bg-accent border border-border text-muted-foreground transition-colors cursor-pointer">
                      <ArrowRightLeft size={11} />
                    </button>
                  )}
                  {isAdmin && item.hasAccount && item.userActive !== false && (
                    <button onClick={() => setDeactivateItem(item)} className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent text-muted-foreground hover:text-amber-600 border border-border transition-colors cursor-pointer">
                      <UserX size={11} />
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => setDeleteItem(item)} className="w-6.5 h-6.5 flex items-center justify-center rounded bg-accent text-muted-foreground hover:text-red-600 border border-border transition-colors cursor-pointer">
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
              <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-destructive text-xs font-medium">{transferError}</div>
            )}
            <div className="p-3 rounded-lg border border-border bg-accent/50 text-sm">
              <p className="font-semibold text-foreground">{transferItem.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                Turma atual: <span className="font-medium text-foreground">{transferItem.class?.name || "Sem turma"}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Nova Turma</label>
              <select
                className="h-9 w-full px-3 rounded-lg text-xs font-medium bg-card border border-border text-foreground outline-none focus:ring-1 focus:ring-ring transition cursor-pointer"
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
                className="h-9 px-4 rounded-lg text-xs font-medium text-foreground bg-accent hover:bg-accent transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleTransfer}
                disabled={!transferClassId || transferLoading}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer"
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