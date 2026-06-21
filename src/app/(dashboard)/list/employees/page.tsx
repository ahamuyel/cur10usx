"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { useEntityList } from "@/hooks/useEntityList"
import AppAvatar from "@/components/ui/AppAvatar"
import {
  Loader2, Plus, Users, Mail, Phone, Shield, ExternalLink,
  UserPlus, Building2,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

type Employee = {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  department: string | null
  foto: string | null
  isActive: boolean
  hasAccount: boolean
  userActive: boolean | null
}

const roleLabels: Record<string, string> = {
  secretaria: "Secretaria",
  tesouraria: "Tesouraria",
  biblioteca: "Biblioteca",
  recursos_humanos: "Recursos Humanos",
  coordenacao: "Coordenação",
  direcao: "Direção",
  outros: "Outros",
}

const roleOptions = [
  { value: "", label: "Todas as Funções" },
  { value: "secretaria", label: "Secretaria" },
  { value: "tesouraria", label: "Tesouraria" },
  { value: "biblioteca", label: "Biblioteca" },
  { value: "recursos_humanos", label: "Recursos Humanos" },
  { value: "coordenacao", label: "Coordenação" },
  { value: "direcao", label: "Direção" },
  { value: "outros", label: "Outros" },
]

const columns = [
  { header: "Nome", accessor: "name" },
  { header: "Função", accessor: "role" },
  { header: "Contacto", accessor: "contact" },
  { header: "Departamento", accessor: "department", className: "hidden md:table-cell" },
  { header: "Estado", accessor: "status", className: "hidden sm:table-cell" },
  { header: "Ações", accessor: "actions", className: "text-right" },
]

const EmployeeListPage = () => {
  const router = useRouter()

  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Employee>({
    endpoint: "/api/employees",
    limit: 10,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", role: "secretaria", department: "",
  })
  const [formError, setFormError] = useState("")
  const [formLoading, setFormLoading] = useState(false)

  const filterConfig = [
    { key: "role", label: "Função", type: "select" as const, options: roleOptions },
  ]

  const sortOptions = [
    { field: "name", label: "Nome" },
    { field: "role", label: "Função" },
    { field: "department", label: "Departamento" },
    { field: "createdAt", label: "Data de registo" },
  ]

  const handleCreate = useCallback(async () => {
    setFormLoading(true)
    setFormError("")
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Erro ao criar funcionário")
      setCreateOpen(false)
      setFormData({ name: "", email: "", phone: "", address: "", role: "secretaria", department: "" })
      refetch()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao criar funcionário")
    } finally {
      setFormLoading(false)
    }
  }, [formData, refetch])

  const renderRow = (item: Employee) => (
    <tr
      key={item.id}
      className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
      onClick={() => router.push(`/list/employees/${item.id}`)}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-7 h-7 shrink-0 select-none">
            <AppAvatar
              src={item.foto}
              name={item.name}
              className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700"
              fallbackClassName="text-[9px]"
            />
          </div>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate text-sm">
            {item.name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
          <Shield size={10} />
          {roleLabels[item.role] || item.role}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col gap-0.5">
          {item.email && (
            <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Mail size={10} />
              {item.email}
            </span>
          )}
          {item.phone && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
              <Phone size={10} />
              {item.phone}
            </span>
          )}
        </div>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">
        {item.department || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
      </td>
      <td className="hidden sm:table-cell py-3 px-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
          item.isActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
            : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800"
        }`}>
          {item.isActive ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => router.push(`/list/employees/${item.id}`)}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Ver detalhes"
          >
            <ExternalLink size={12} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Novo Funcionário</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Adicionar um novo funcionário à escola.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500">Nome *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Nome completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500">Email</label>
                <input
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500">Telefone</label>
                <input
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="+244 000 000 000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500">Função *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  {roleOptions.filter((o) => o.value).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500">Departamento</label>
                <input
                  value={formData.department}
                  onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                  placeholder="Ex: Administrativo"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500">Endereço</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                placeholder="Endereço"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end pt-2">
            <button
              onClick={() => setCreateOpen(false)}
              className="h-9 px-4 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={formLoading || !formData.name}
              className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {formLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <UserPlus size={13} />
              )}
              <span>{formLoading ? "A criar..." : "Criar Funcionário"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Funcionários</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Gerir funcionários administrativos e controlo de presenças.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1) }} />
          </div>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={(f) => { setFilters(f); setPage(1) }} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            <button
              onClick={() => setCreateOpen(true)}
              className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
            >
              <Plus size={14} />
              <span>Novo Funcionário</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Users size={24} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          Nenhum funcionário encontrado.
          <div className="mt-3">
            <button
              onClick={() => setCreateOpen(true)}
              className="h-9 inline-flex items-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
            >
              <Plus size={14} />
              <span>Adicionar Funcionário</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

export default EmployeeListPage
