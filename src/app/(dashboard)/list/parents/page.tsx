"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import ParentForm from "@/components/forms/ParentForm"
import { useEntityList } from "@/hooks/useEntityList"
import AppAvatar from "@/components/ui/AppAvatar"
import { Pencil, Trash2, SlidersHorizontal, ArrowUpDown, UserPlus, UserX, Loader2, LayoutGrid, List, Mail, Phone, MapPin } from "lucide-react"

type Parent = {
  id: string
  name: string
  email: string
  foto: string | null
  phone: string
  address: string
  students: { id: string; name: string }[]
  hasAccount?: boolean
  userActive?: boolean | null
}

const columns = [
  { header: "Encarregado(a)", accessor: "info" },
  { header: "E-mail", accessor: "email", className: "hidden md:table-cell" },
  { header: "Educandos(as)", accessor: "students" },
  { header: "Contacto", accessor: "phone", className: "hidden lg:table-cell" },
  { header: "Endereço", accessor: "address", className: "hidden xl:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const ParentListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"
  
  // Estado para alternância de visualização
  const [view, setView] = useState<"table" | "card">("table")

  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Parent>({ 
    endpoint: "/api/parents", 
    limit: 6 
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Parent | null>(null)
  const [deleteItem, setDeleteItem] = useState<Parent | null>(null)
  const [deactivateItem, setDeactivateItem] = useState<Parent | null>(null)

  const handleDeactivate = async () => {
    if (!deactivateItem) return
    const res = await fetch(`/api/parents/${deactivateItem.id}/deactivate`, { method: "POST" })
    if (res.ok) {
      setDeactivateItem(null)
      refetch()
    }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/parents/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  // Row Renderer para Visualização em Tabela
  const renderRow = (item: Parent) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 shrink-0 select-none">
            <AppAvatar src={item.foto} name={item.name} className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700" fallbackClassName="text-xs" />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate">
            {item.name}
          </span>
        </div>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs font-mono tracking-tight">
        {item.email}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {item.students.slice(0, 2).map((s) => (
            <span key={s.id} className="inline-flex items-center px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded text-[10px] font-medium whitespace-nowrap">
              {s.name}
            </span>
          ))}
          {item.students.length > 2 && (
            <span className="text-[10px] font-medium font-mono text-zinc-400 px-1 self-center">+{item.students.length - 2}</span>
          )}
        </div>
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs font-mono tracking-tight">
        {item.phone}
      </td>
      <td className="hidden xl:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs max-w-[180px] truncate">
        {item.address}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => setEditItem(item)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Editar Ficha"
          >
            <Pencil size={12} />
          </button>
          {isAdmin && item.hasAccount && item.userActive !== false && (
            <button
              onClick={() => setDeactivateItem(item)}
              title="Suspender Acesso"
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-500 transition-colors cursor-pointer"
            >
              <UserX size={12} />
            </button>
          )}
          {isAdmin && item.hasAccount && item.userActive === false && (
            <span className="inline-flex items-center px-2 h-6 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 rounded text-[10px] font-medium tracking-tight">Inativo</span>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteItem(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Remover Registo"
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
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Encarregados de Educação</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gestão e vinculação de responsáveis civis por agregados estudantis.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1 sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <SlidersHorizontal size={14} />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
              <ArrowUpDown size={14} />
            </button>

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

            {isAdmin && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus size={14} />
                <span>Adicionar</span>
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
            Nenhum encarregado de educação foi localizado na base de dados ativa.
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
                className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 group"
              >
                <div>
                  {/* Bloco de Perfil de Cartão */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-10 h-10 shrink-0 select-none">
                      <AppAvatar src={item.foto} name={item.name} className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700" fallbackClassName="text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate leading-snug">
                        {item.name}
                      </h3>
                      {item.hasAccount && item.userActive === false && (
                        <span className="mt-0.5 inline-flex items-center px-1.5 py-0.2 border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded text-[9px] font-medium tracking-tight">Acesso Suspenso</span>
                      )}
                    </div>
                  </div>

                  {/* Informações de Contacto Direto */}
                  <div className="space-y-1.5 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={12} className="text-zinc-400 shrink-0" />
                      <span className="truncate font-mono tracking-tight text-[11px]">{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-zinc-400 shrink-0" />
                      <span className="font-mono tracking-tight text-[11px]">{item.phone}</span>
                    </div>
                    {item.address && (
                      <div className="flex items-start gap-2 min-w-0">
                        <MapPin size={12} className="text-zinc-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bloco Inferior Relacional / Ações */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-end justify-between">
                  <div className="flex flex-col gap-1 min-w-0 pr-2">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Educandos</span>
                    <div className="flex flex-wrap gap-0.5 max-w-full">
                      {item.students.slice(0, 2).map((s) => (
                        <span key={s.id} className="inline-flex items-center px-1.5 py-0.2 border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded text-[9px] max-w-[90px] truncate">
                          {s.name}
                        </span>
                      ))}
                      {item.students.length > 2 && (
                        <span className="text-[9px] font-bold font-mono text-zinc-400 ml-0.5 self-center">+{item.students.length - 2}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0 border-l border-zinc-100 dark:border-zinc-800 pl-2">
                    <button
                      onClick={() => setEditItem(item)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                      title="Editar Ficha"
                    >
                      <Pencil size={12} />
                    </button>
                    {isAdmin && item.hasAccount && item.userActive !== false && (
                      <button
                        onClick={() => setDeactivateItem(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="Suspender Conta"
                      >
                        <UserX size={12} />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => setDeleteItem(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Eliminar Registo"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sistema de Paginação Retido */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ================= SYSTEM FORMS MODALS ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Encarregado de Educação">
        <ParentForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Editar Encarregado de Educação">
        {editItem && (
          <ParentForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />

      <DeleteConfirmModal
        open={!!deactivateItem}
        onClose={() => setDeactivateItem(null)}
        onConfirm={handleDeactivate}
        itemName={deactivateItem?.name || ""}
        title="Suspender Acesso de Conta"
        message={`Tem a certeza que deseja revogar o acesso à plataforma para a conta de "${deactivateItem?.name}"? O utilizador perderá o rastreamento em tempo real.`}
        confirmLabel="Suspender Acesso"
      />
    </div>
  )
}

export default ParentListPage