"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AdminForm from "@/components/forms/AdminForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Pencil, Trash2, SlidersHorizontal, ArrowUpDown, UserPlus, Loader2, Shield, ShieldCheck, LayoutGrid, List, Mail, KeyRound } from "lucide-react"

type AdminPermissions = {
  canManageApplications: boolean
  canManageTeachers: boolean
  canManageStudents: boolean
  canManageParents: boolean
  canManageClasses: boolean
  canManageCourses: boolean
  canManageSubjects: boolean
  canManageLessons: boolean
  canManageExams: boolean
  canManageAssignments: boolean
  canManageResults: boolean
  canManageAttendance: boolean
  canManageMessages: boolean
  canManageAnnouncements: boolean
  canManageAdmins: boolean
}

type Admin = {
  id: string
  name: string
  email: string
  level: "primary" | "secondary"
  isActive: boolean
  permissions: AdminPermissions
}

const columns = [
  { header: "Administrador(a)", accessor: "name" },
  { header: "E-mail", accessor: "email", className: "hidden md:table-cell" },
  { header: "Hierarquia / Nível", accessor: "level" },
  { header: "Estado", accessor: "status", className: "hidden sm:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const AdminListPage = () => {
  const { data: session } = useSession()
  const canManage = session?.user?.role === "school_admin" && (
    session.user.adminLevel === "primary" ||
    session.user.permissions?.includes("canManageAdmins")
  )

  // Estado para alternância de visualização (Dual View)
  const [view, setView] = useState<"table" | "card">("table")

  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Admin>({ 
    endpoint: "/api/admins", 
    limit: 10 
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Admin | null>(null)
  const [deleteItem, setDeleteItem] = useState<Admin | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/admins/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) {
      setDeleteItem(null)
      refetch()
    }
  }

  // Row Renderer para Tabela Coesa
  const renderRow = (item: Admin) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-xs font-bold select-none">
            {item.name.charAt(0).toUpperCase()}
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
        {item.level === "primary" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-medium uppercase tracking-tight">
            <ShieldCheck size={11} className="text-zinc-500" />
            Principal
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 rounded text-[10px] font-medium uppercase tracking-tight">
            <Shield size={11} className="text-zinc-400" />
            Secundário
          </span>
        )}
      </td>
      <td className="hidden sm:table-cell py-3 px-4">
        {item.isActive ? (
          <span className="inline-flex items-center px-2 py-0.5 border border-emerald-200 dark:border-emerald-950/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-medium">
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 rounded text-[10px] font-medium">
            Inativo
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center gap-1 justify-end">
          {item.level === "secondary" && canManage ? (
            <>
              <button
                onClick={() => setEditItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                title="Editar Privilégios"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => setDeleteItem(item)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Revogar Administrador"
              >
                <Trash2 size={12} />
              </button>
            </>
          ) : item.level === "primary" ? (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono italic tracking-tight border border-dashed border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-50/50 dark:bg-zinc-900/20 select-none">Protegido</span>
          ) : null}
        </div>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <KeyRound size={18} className="text-zinc-400 dark:text-zinc-500" />
            Controlo de Administradores
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerenciamento de credenciais de equipa de segurança e coordenação interna.</p>
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

            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <UserPlus size={14} />
                <span>Adicionar TI</span>
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
            Nenhum operador administrativo foi localizado no perímetro da pesquisa.
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
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 shrink-0 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 text-xs font-bold select-none">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate leading-snug">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.isActive ? (
                            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Ativo</span>
                          ) : (
                            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">Inativo</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.level === "primary" ? (
                      <span className="shrink-0 p-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300" title="Acesso Raiz">
                        <ShieldCheck size={14} />
                      </span>
                    ) : (
                      <span className="shrink-0 p-1 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400" title="Acesso Auxiliar">
                        <Shield size={14} />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono tracking-tight mb-2 min-w-0">
                    <Mail size={12} className="text-zinc-400 shrink-0" />
                    <span className="truncate">{item.email}</span>
                  </div>
                </div>

                {/* Bloco de Gestão Interna de Operadores */}
                <div className="pt-2.5 mt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Nível: {item.level}
                  </span>

                  <div className="flex items-center gap-0.5">
                    {item.level === "secondary" && canManage ? (
                      <>
                        <button
                          onClick={() => setEditItem(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Modificar Privilégios"
                        >
                          <Pencil size={11} />
                        </button>
                        <button
                          onClick={() => setDeleteItem(item)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Remover Operador"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-medium font-mono text-zinc-400/80 dark:text-zinc-500/80 px-1">Imutável</span>
                    )}
                  </div>
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

      {/* ================= DIALOG FORM SYSTEM ================= */}
      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Conceder Credenciais Administrativas">
        <AdminForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>

      <FormModal open={!!editItem} onClose={() => setEditItem(null)} title="Atualizar Matriz de Permissões">
        {editItem && (
          <AdminForm mode="edit" initialData={editItem} onSuccess={() => { setEditItem(null); refetch() }} onCancel={() => setEditItem(null)} />
        )}
      </FormModal>

      <DeleteConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} itemName={deleteItem?.name || ""} />
    </div>
  )
}

export default AdminListPage