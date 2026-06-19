"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Pencil, Trash2, Plus, Loader2, Star, Lock, Users, School } from "lucide-react"

type AcademicYear = {
  id: string
  name: string
  startDate: string
  endDate: string
  isCurrent: boolean
  status: "aberto" | "em_encerramento" | "encerrado"
  _count?: { enrollments: number; classes: number }
}

const statusConfig: Record<AcademicYear["status"], { label: string; classes: string }> = {
  aberto: { label: "Aberto", classes: "bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 border-emerald-500/10" },
  em_encerramento: { label: "Em encerramento", classes: "bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-400 border-amber-500/10" },
  encerrado: { label: "Encerrado", classes: "bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 dark:border-zinc-800" },
}

const columns = [
  { header: "Nome", accessor: "name" },
  { header: "Período", accessor: "period", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status" },
  { header: "Matrículas", accessor: "enrollments", className: "hidden lg:table-cell" },
  { header: "Turmas", accessor: "classes", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

function toInputDate(dateStr: string) {
  return dateStr ? dateStr.slice(0, 10) : ""
}

const AcademicYearsPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  const [data, setData] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<AcademicYear | null>(null)
  const [deleteItem, setDeleteItem] = useState<AcademicYear | null>(null)
  const [setCurrentItem, setSetCurrentItem] = useState<AcademicYear | null>(null)
  const [closeItem, setCloseItem] = useState<AcademicYear | null>(null)

  // Form state
  const [formName, setFormName] = useState("")
  const [formStartDate, setFormStartDate] = useState("")
  const [formEndDate, setFormEndDate] = useState("")
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/academic-years")
      const json = await res.json()
      setData(json.data || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () => {
    setFormName("")
    setFormStartDate("")
    setFormEndDate("")
    setFormError("")
    setCreateOpen(true)
  }

  const openEdit = (item: AcademicYear) => {
    setFormName(item.name)
    setFormStartDate(toInputDate(item.startDate))
    setFormEndDate(toInputDate(item.endDate))
    setFormError("")
    setEditItem(item)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setFormLoading(true)
    try {
      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, startDate: formStartDate, endDate: formEndDate }),
      })
      if (!res.ok) {
        const errData = await res.json()
        setFormError(errData.error || "Erro ao criar ano letivo")
        setFormLoading(false)
        return
      }
      setCreateOpen(false)
      fetchData()
    } catch {
      setFormError("Erro de conexão com o servidor")
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setFormError("")
    setFormLoading(true)
    try {
      const res = await fetch(`/api/academic-years/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, startDate: formStartDate, endDate: formEndDate }),
      })
      if (!res.ok) {
        const errData = await res.json()
        setFormError(errData.error || "Erro ao editar ano letivo")
        setFormLoading(false)
        return
      }
      setEditItem(null)
      fetchData()
    } catch {
      setFormError("Erro de conexão com o servidor")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/academic-years/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      fetchData()
    }
  }

  const handleSetCurrent = async () => {
    if (!setCurrentItem) return
    const res = await fetch(`/api/academic-years/${setCurrentItem.id}/set-current`, { method: "POST" })
    if (res.ok) {
      setSetCurrentItem(null)
      fetchData()
    }
  }

  const handleClose = async () => {
    if (!closeItem) return
    const res = await fetch(`/api/academic-years/${closeItem.id}/close`, { method: "POST" })
    if (res.ok) {
      setCloseItem(null)
      fetchData()
    }
  }

  const formFields = (
    <div className="flex flex-col gap-3.5">
      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Designação</label>
        <input
          type="text"
          required
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Ex: 2025/2026"
          className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Data de Início</label>
          <input
            type="date"
            required
            value={formStartDate}
            onChange={(e) => setFormStartDate(e.target.value)}
            className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Data de Fim</label>
          <input
            type="date"
            required
            value={formEndDate}
            onChange={(e) => setFormEndDate(e.target.value)}
            className="w-full px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-xs border-0 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition"
          />
        </div>
      </div>
    </div>
  )

  const formButtons = (onCancel: () => void) => (
    <div className="flex items-center gap-2 justify-end mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
      <button
        type="button"
        onClick={onCancel}
        disabled={formLoading}
        className="h-8 px-3 rounded-md text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={formLoading}
        className="h-8 px-3 rounded-md text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
      >
        {formLoading ? "A guardar..." : "Guardar Ficheiro"}
      </button>
    </div>
  )

  const renderRow = (item: AcademicYear) => {
    const st = statusConfig[item.status]
    return (
      <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{item.name}</span>
            {item.isCurrent && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-3xs">
                <Star size={10} className="fill-current" />
                Corrente
              </span>
            )}
          </div>
        </td>
        <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight tabular-nums">
          {formatDate(item.startDate)} — {formatDate(item.endDate)}
        </td>
        <td className="py-3 px-4">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${st.classes}`}>
            {st.label}
          </span>
        </td>
        <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-zinc-400" />
            <span>{item._count?.enrollments ?? 0}</span>
          </div>
        </td>
        <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
          <div className="flex items-center gap-1.5">
            <School size={12} className="text-zinc-400" />
            <span>{item._count?.classes ?? 0}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 justify-end">
            {isAdmin && !item.isCurrent && item.status === "aberto" && (
              <button
                onClick={() => setSetCurrentItem(item)}
                title="Definir como Corrente"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <Star size={12} />
              </button>
            )}
            {isAdmin && item.status !== "encerrado" && (
              <button
                onClick={() => setCloseItem(item)}
                title="Fechar Ciclo / Encerrar"
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-500/5 transition-colors cursor-pointer"
              >
                <Lock size={12} />
              </button>
            )}
            <button
              onClick={() => openEdit(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-colors cursor-pointer"
              title="Editar config"
            >
              <Pencil size={12} />
            </button>
            {isAdmin && (
              <button
                onClick={() => setDeleteItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                title="Remover permanentemente"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Anos Letivos</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gere e configure a alternância de ciclos letivos e períodos vigentes.</p>
        </div>
        <div className="flex items-center gap-2 justify-end self-stretch sm:self-auto">
          {isAdmin && (
            <button
              onClick={openCreate}
              className="h-9 flex items-center justify-center gap-1.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
            >
              <Plus size={14} />
              <span>Adicionar</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= DATA GRID ================= */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10">
            Nenhum ano letivo configurado no sistema.
          </div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {/* ================= MODAIS DE CONFIGURAÇÃO E FLUXOS ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Ano Letivo">
        <form onSubmit={handleCreate} className="mt-2">
          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/10">
              {formError}
            </div>
          )}
          {formFields}
          {formButtons(() => setCreateOpen(false))}
        </form>
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Ano Letivo">
        {editItem && (
          <form onSubmit={handleEdit} className="mt-2">
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/5 text-red-600 dark:text-red-400 text-xs font-medium border border-red-500/10">
                {formError}
              </div>
            )}
            {formFields}
            {formButtons(() => setEditItem(null))}
          </form>
        )}
      </FormModal>

      <DeleteConfirmModal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        itemName={deleteItem?.name || ""}
      />

      <ConfirmActionModal
        open={!!setCurrentItem}
        onClose={() => setSetCurrentItem(null)}
        onConfirm={handleSetCurrent}
        title="Alterar Ano Letivo Vigente"
        message={`Confirma a definição de "${setCurrentItem?.name || ""}" como o novo ano letivo corrente? O ciclo ativo anterior será arquivado de forma automática.`}
        confirmLabel="Definir como Ativo"
        // confirmColor="zinc"
      />

      <ConfirmActionModal
        open={!!closeItem}
        onClose={() => setCloseItem(null)}
        onConfirm={handleClose}
        title="Trancar / Encerrar Ciclo Letivo"
        message={
          closeItem?.status === "aberto"
            ? `Tens a certeza que desejas iniciar a fase de encerramento de "${closeItem?.name || ""}"? O estado mudará para "Em encerramento".`
            : `Tens a certeza que desejas encerrar em definitivo o ano letivo "${closeItem?.name || ""}"? Esta operação é irreversível e bloqueará novas pautas.`
        }
        confirmLabel={closeItem?.status === "aberto" ? "Iniciar Fecho" : "Encerrar Definitivamente"}
        confirmColor={closeItem?.status === "aberto" ? "amber" : "red"}
      />
    </div>
  )
}

export default AcademicYearsPage