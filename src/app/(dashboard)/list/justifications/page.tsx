"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { useEntityList } from "@/hooks/useEntityList"
import AppAvatar from "@/components/ui/AppAvatar"
import {
  Loader2, Plus, FileText, Check, X, AlertCircle,
  Calendar, User, MessageSquare, ExternalLink,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

type Justification = {
  id: string
  date: string
  reason: string
  reasonDescription: string | null
  documentUrl: string | null
  status: string
  reviewNotes: string | null
  reviewedAt: string | null
  createdAt: string
  student: {
    id: string
    name: string
    class: { id: string; name: string } | null
  }
  reviewedBy: { id: string; name: string } | null
  studentId: string
}

const reasonLabels: Record<string, string> = {
  consulta_medica: "Consulta Médica",
  doenca: "Doença",
  falecimento_familiar: "Falecimento Familiar",
  atividade_desportiva: "Atividade Desportiva",
  representacao_institucional: "Representação Institucional",
  problema_pessoal: "Problema Pessoal",
  outro: "Outro",
}

const statusConfig: Record<string, { label: string; class: string }> = {
  pendente: { label: "Pendente", class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  em_analise: { label: "Em Análise", class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  aprovada: { label: "Aprovada", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  rejeitada: { label: "Rejeitada", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800" },
  informacao_adicional: { label: "Informação Adicional", class: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
}

const statusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_analise", label: "Em Análise" },
  { value: "aprovada", label: "Aprovada" },
  { value: "rejeitada", label: "Rejeitada" },
  { value: "informacao_adicional", label: "Informação Adicional" },
]

const columns = [
  { header: "Data", accessor: "date" },
  { header: "Aluno", accessor: "student" },
  { header: "Motivo", accessor: "reason" },
  { header: "Estado", accessor: "status" },
  { header: "Revisor", accessor: "reviewer", className: "hidden md:table-cell" },
  { header: "Ações", accessor: "actions", className: "text-right" },
]

const JustificationListPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const isAdmin = role === "school_admin" || role === "teacher"

  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = useEntityList<Justification>({
    endpoint: "/api/justifications",
    limit: 10,
  })

  const [createOpen, setCreateOpen] = useState(false)
  const [quickActionId, setQuickActionId] = useState<string | null>(null)
  const [quickActionStatus, setQuickActionStatus] = useState<"aprovada" | "rejeitada">("aprovada")
  const [quickActionLoading, setQuickActionLoading] = useState(false)

  const filterConfig = [
    { key: "status", label: "Estado", type: "select" as const, options: statusOptions },
  ]

  const sortOptions = [
    { field: "createdAt", label: "Data de criação" },
    { field: "date", label: "Data da falta" },
  ]

  const handleQuickReview = useCallback(async (id: string, status: "aprovada" | "rejeitada") => {
    setQuickActionLoading(true)
    try {
      const res = await fetch(`/api/justifications/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes: null }),
      })
      if (res.ok) {
        refetch()
      }
    } catch {
      // ignore
    } finally {
      setQuickActionLoading(false)
      setQuickActionId(null)
    }
  }, [refetch])

  const renderRow = (item: Justification) => {
    const status = statusConfig[item.status] || { label: item.status, class: "bg-zinc-100 text-zinc-700" }
    const reason = reasonLabels[item.reason] || item.reason

    return (
      <tr
        key={item.id}
        className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer"
        onClick={() => router.push(`/list/justifications/${item.id}`)}
      >
        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs font-mono tabular-nums whitespace-nowrap">
          {new Date(item.date).toLocaleDateString("pt-PT")}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-7 h-7 shrink-0 select-none">
              <AppAvatar
                src={null}
                name={item.student.name}
                className="w-full h-full !rounded-full border border-zinc-200 dark:border-zinc-700"
                fallbackClassName="text-[9px]"
              />
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-50 truncate text-sm">
              {item.student.name}
            </span>
            {item.student.class && (
              <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[10px] font-medium border border-zinc-200/30 dark:border-zinc-700/40 hidden sm:inline">
                {item.student.class.name}
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-zinc-700 dark:text-zinc-300 text-xs font-medium">{reason}</span>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${status.class}`}>
            {status.label}
          </span>
        </td>
        <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
          {item.reviewedBy?.name || <span className="text-zinc-300 dark:text-zinc-600">—</span>}
        </td>
        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => router.push(`/list/justifications/${item.id}`)}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Ver detalhes"
            >
              <ExternalLink size={12} />
            </button>
            {isAdmin && (item.status === "pendente" || item.status === "em_analise") && (
              <>
                <button
                  disabled={quickActionLoading && quickActionId === item.id}
                  onClick={() => {
                    setQuickActionId(item.id)
                    handleQuickReview(item.id, "aprovada")
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer disabled:opacity-40"
                  title="Aprovar"
                >
                  <Check size={12} />
                </button>
                <button
                  disabled={quickActionLoading && quickActionId === item.id}
                  onClick={() => {
                    setQuickActionId(item.id)
                    handleQuickReview(item.id, "rejeitada")
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-colors cursor-pointer disabled:opacity-40"
                  title="Rejeitar"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Justificações de Faltas</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isAdmin ? "Gerir e analisar as justificações submetidas." : "As minhas justificações de faltas."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="w-full sm:w-48 md:w-56">
            <TableSearch value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
          </div>
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <FilterPanel config={filterConfig} filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            {!isAdmin && (
              <button
                onClick={() => router.push("/list/justifications/new")}
                className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
              >
                <Plus size={14} />
                <span>Nova Justificação</span>
              </button>
            )}
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
          <FileText size={24} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          {isAdmin ? "Nenhuma justificação encontrada." : "Nenhuma justificação submetida."}
          {!isAdmin && (
            <div className="mt-3">
              <button
                onClick={() => router.push("/list/justifications/new")}
                className="h-9 inline-flex items-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
              >
                <Plus size={14} />
                <span>Criar Justificação</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
      )}

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

export default JustificationListPage
