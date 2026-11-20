"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MessageSquare, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"

type Ticket = {
  id: string
  subject: string
  priority: string
  status: string
  createdAt: string
  updatedAt: string
  user: { id: string; name: string; email: string; role: string }
  school: { id: string; name: string } | null
  _count: { messages: number }
}

const priorityLabels: Record<string, string> = {
  baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente",
}

const priorityColors: Record<string, string> = {
  baixa: "text-zinc-500",
  media: "text-amber-600 dark:text-amber-400",
  alta: "text-orange-600 dark:text-orange-400",
  urgente: "text-red-600 dark:text-red-400",
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin", school_admin: "Admin Escola",
  teacher: "Professor", student: "Aluno", parent: "Encarregado",
}

export default function AdminSupportPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (statusFilter) params.set("status", statusFilter)
      if (priorityFilter) params.set("priority", priorityFilter)
      const res = await fetch(`/api/support?${params}`)
      if (res.ok) {
        const data = await res.json()
        setTickets(data.data)
        setTotalPages(data.totalPages)
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }, [page, statusFilter, priorityFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])

return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      {/* Header Responsivo */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">Suporte Técnico</h1>
            <p className="text-sm text-zinc-500">Gestão centralizada de tickets</p>
          </div>
          
          {/* Filtros em Grid responsivo para mobile */}
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="w-full bg-white dark:bg-zinc-950 text-sm py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Estado...</option>
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }} className="w-full bg-white dark:bg-zinc-950 text-sm py-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Prioridade...</option>
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <MessageSquare size={40} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
          <p className="text-zinc-500">Nenhum ticket encontrado</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => router.push(`/admin/support/${ticket.id}`)}
              className="w-full flex flex-col md:flex-row md:items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border-b border-zinc-100 dark:border-zinc-900 last:border-0 text-left gap-3 md:gap-4"
            >
              {/* Parte principal: Assunto e Status */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between md:justify-start md:gap-3 mb-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate pr-2">{ticket.subject}</span>
                  <StatusBadge status={ticket.status} />
                </div>
                
                {/* Metadados: Adaptam-se para wrap em telas pequenas */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 font-medium">
                  <span className="truncate">{ticket.user.name}</span>
                  {ticket.school && <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md truncate">{ticket.school.name}</span>}
                  <span className={cn("capitalize", priorityColors[ticket.priority])}>{priorityLabels[ticket.priority]}</span>
                </div>
              </div>

              {/* Contagem de mensagens visível sempre */}
              <div className="flex items-center gap-1 text-zinc-400 text-sm md:ml-4 border-t md:border-t-0 pt-2 md:pt-0 border-zinc-100 dark:border-zinc-900">
                <MessageSquare size={16} /> <span>{ticket._count.messages}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Paginação otimizada */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-zinc-50 transition">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-zinc-50 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  )
}