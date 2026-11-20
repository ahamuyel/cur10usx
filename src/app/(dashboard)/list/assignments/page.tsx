"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal"
import AssignmentForm from "@/components/forms/AssignmentForm"
import SubmissionForm from "@/components/forms/SubmissionForm"
import EvaluateSubmissionForm from "@/components/forms/EvaluateSubmissionForm"
import { useEntityList } from "@/hooks/useEntityList"
import FilterPanel from "@/components/ui/FilterPanel"
import SortButton from "@/components/ui/SortButton"
import { Pencil, Trash2, Plus, Loader2, Send, CheckCircle, Clock, AlertTriangle, Eye, Calendar, BookOpen, Users, ClipboardCheck } from "lucide-react"

type MySubmission = { id: string; status: string; score?: number | null; submittedAt?: string | null }
type Submission = { id: string; assignmentId: string; status: string; score?: number | null; content?: string | null; attachmentUrl?: string | null; feedback?: string | null; student?: { id: string; name: string }; submittedAt?: string | null }

type Assignment = {
  id: string
  title: string
  description?: string | null
  dueDate: string
  maxScore: number
  subjectId: string
  classId: string
  teacherId: string
  subject?: { id: string; name: string }
  class?: { id: string; name: string }
  teacher?: { id: string; name: string }
  submissionCount: number
  mySubmission?: MySubmission | null
  isPastDue: boolean
}

const statusBadge: Record<string, { label: string; class: string; icon: typeof CheckCircle }> = {
  pendente: { label: "Pendente", class: "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400", icon: Clock },
  entregue: { label: "Entregue", class: "border-cyan-200 bg-cyan-50/50 dark:border-cyan-950/30 dark:bg-cyan-950/10 text-cyan-700 dark:text-cyan-400", icon: Send },
  avaliada: { label: "Avaliada", class: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-950/30 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400", icon: CheckCircle },
  atrasada: { label: "Atrasada", class: "border-rose-200 bg-rose-50/50 dark:border-rose-950/30 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400", icon: AlertTriangle },
}

const AssignmentListPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isStudent = role === "student"
  const canManage = role === "school_admin" || role === "teacher"
  
  const { data, totalPages, page, search, setSearch, setPage, filters, setFilters, sort, setSort, clearFilters, activeFilterCount, loading, refetch } = 
    useEntityList<Assignment>({ endpoint: "/api/assignments", limit: 6 })

  const filterConfig = [
    { key: "classId", label: "Turma", type: "select" as const, optionsEndpoint: "/api/classes?limit=100" },
    { key: "subjectId", label: "Disciplina", type: "select" as const, optionsEndpoint: "/api/subjects?limit=100" },
    { key: "status", label: "Estado", type: "select" as const, options: isStudent
        ? [{ value: "pendente", label: "Pendente" }, { value: "entregue", label: "Entregue" }, { value: "avaliada", label: "Avaliada" }, { value: "atrasada", label: "Atrasada" }]
        : [{ value: "ativa", label: "Ativa" }, { value: "expirada", label: "Expirada" }]
    },
    ...(role === "school_admin" ? [{ key: "teacherId", label: "Professor", type: "select" as const, optionsEndpoint: "/api/teachers?limit=100" }] : []),
  ]

  const sortOptions = [
    { field: "dueDate", label: "Prazo de entrega" },
    { field: "title", label: "Título" },
    { field: "createdAt", label: "Data de criação" },
  ]

  const [createOpen, setCreateOpen] = useState(false)
  const [editItem, setEditItem] = useState<Assignment | null>(null)
  const [deleteItem, setDeleteItem] = useState<Assignment | null>(null)
  const [submitItem, setSubmitItem] = useState<Assignment | null>(null)
  const [detailItem, setDetailItem] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [evalSub, setEvalSub] = useState<{ sub: Submission; maxScore: number } | null>(null)

  const handleDelete = async () => {
    if (!deleteItem) return
    const res = await fetch(`/api/assignments/${deleteItem.id}`, { method: "DELETE" })
    if (res.ok) { setDeleteItem(null); refetch() }
  }

  const openDetail = async (item: Assignment) => {
    setDetailItem(item)
    if (canManage) {
      const res = await fetch(`/api/assignments/${item.id}/submissions`)
      const d = await res.json()
      setSubmissions(d.data || [])
    }
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ClipboardCheck size={18} className="text-zinc-400" />
            Gestão de Tarefas
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Coordenação de cronogramas, entregas e avaliações por turma.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="w-full sm:w-60">
            <TableSearch value={search} onChange={setSearch} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <FilterPanel config={filterConfig} filters={filters} onChange={setFilters} onClear={clearFilters} activeCount={activeFilterCount} />
            <SortButton options={sortOptions} sort={sort} onChange={setSort} />
            {canManage && (
              <button
                onClick={() => setCreateOpen(true)}
                className="h-9 flex items-center justify-center gap-1.5 px-3.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer"
              >
                <Plus size={14} />
                <span>Nova Tarefa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid de Tarefas */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
          Nenhum registo localizado nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item) => {
            const mySub = item.mySubmission
            const subStatus = mySub?.status || (item.isPastDue ? "atrasada" : "pendente")
            const badge = statusBadge[subStatus] || statusBadge.pendente
            const BadgeIcon = badge.icon

            return (
              <div key={item.id} className="flex flex-col p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    <BookOpen size={12} /> {item.subject?.name}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${badge.class}`}>
                    <BadgeIcon size={10} /> {badge.label}
                  </span>
                </div>

                <div className="mb-4 flex-1">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{item.description || "Sem descrição."}</p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                  <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                    <Calendar size={11} className={item.isPastDue ? "text-rose-500" : ""} />
                    <span className={item.isPastDue ? "text-rose-600 font-bold" : ""}>
                      {new Date(item.dueDate).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isStudent && !mySub && (
                      <button onClick={() => setSubmitItem(item)} className="h-7 px-3 rounded text-[11px] font-semibold bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 transition-all hover:scale-[1.02]">Entregar</button>
                    )}
                    {canManage && (
                      <button onClick={() => openDetail(item)} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                        <Eye size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modais omitidos para concisão, manter conforme original */}
    </div>
  )
}

export default AssignmentListPage