"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import ApplicationReviewForm from "@/components/forms/ApplicationReviewForm"
import Pagination from "@/components/ui/Pagination"

interface Application {
  id: string
  name: string
  email: string
  phone: string
  role: string
  message?: string | null
  status: string
  rejectReason?: string | null
  createdAt: string
}

const roleLabels: Record<string, string> = {
  teacher: "Professor(a)",
  student: "Aluno(a)",
  parent: "Encarregado",
}

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "pendente", label: "Pendentes" },
  { value: "em_analise", label: "Em análise" },
  { value: "aprovada", label: "Aprovadas" },
  { value: "matriculada", label: "Matriculadas" },
  { value: "rejeitada", label: "Rejeitadas" },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selected, setSelected] = useState<Application | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (search) params.set("search", search)
      if (statusFilter) params.set("status", statusFilter)

      const res = await fetch(`/api/applications?${params}`)
      const data = await res.json()
      setApplications(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      console.error("Erro ao carregar solicitações")
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { 
    fetchApplications() 
  }, [fetchApplications])

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Solicitações</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {total === 0 ? "Nenhuma solicitação registada" : `${total} solicitação(ões) encontrada(s)`}
        </p>
      </div>

      {/* ================= FILTROS E PESQUISA ================= */}
      <div className="flex flex-col gap-3.5 md:flex-row md:items-center justify-between mb-5 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs w-full md:max-w-xs border border-transparent focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all">
          <Search size={13} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="bg-transparent outline-none w-full text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center gap-1.5 text-zinc-400 dark:text-zinc-500 mr-1 shrink-0">
            <SlidersHorizontal size={12} />
            <span className="text-[11px] font-medium hidden lg:inline">Filtrar:</span>
          </div>
          <div className="flex gap-1">
            {statusFilters.map((f) => {
              const isActive = statusFilter === f.value
              return (
                <button
                  key={f.value}
                  onClick={() => { setStatusFilter(f.value); setPage(1) }}
                  className={`h-7 px-2.5 rounded-md text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 font-semibold"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ================= MODAL DE REVISÃO ================= */}
      {selected && (
        <ApplicationReviewForm
          application={selected}
          onClose={() => setSelected(null)}
          onRefresh={fetchApplications}
        />
      )}

      {/* ================= DATA GRID / TABELA ================= */}
      <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10">
            Nenhuma solicitação encontrada com os critérios definidos.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-xs font-semibold text-zinc-500 dark:text-zinc-400 select-none">
                <th className="px-4 py-3 font-medium">Candidato / Info</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Perfil Solicitado</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell text-right">Data de Entrada</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {applications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelected(app)}
                  className="border-b border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 cursor-pointer transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                      {app.name}
                    </div>
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono tracking-tight">
                      {app.email} {app.phone && `• ${app.phone}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 text-xs hidden sm:table-cell">
                    <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded text-zinc-700 dark:text-zinc-300 font-medium">
                      {roleLabels[app.role] || app.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 vertical-align-middle">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight tabular-nums hidden sm:table-cell text-right">
                    {new Date(app.createdAt).toLocaleDateString("pt-PT")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= PAGINAÇÃO ================= */}
      {!loading && totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}