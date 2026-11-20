"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Send, CheckCircle2, Archive, MessageSquare, Clock } from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  content: string
  isStaff: boolean
  createdAt: string
  user: { id: string; name: string; role: string }
}

type TicketDetail = {
  id: string
  subject: string
  description: string
  priority: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; role: string }
  school: { id: string; name: string } | null
  messages: Message[]
}

const priorityLabels: Record<string, string> = { baixa: "Baixa", media: "Média", alta: "Alta", urgente: "Urgente" }
const roleLabels: Record<string, string> = { super_admin: "Super Admin", school_admin: "Admin Escola", teacher: "Professor", student: "Aluno", parent: "Encarregado" }

export default function AdminTicketDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState("")

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/support/${id}`)
      if (!res.ok) { router.replace("/admin/support"); return }
      setTicket(await res.json())
    } catch {
      router.replace("/admin/support")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTicket() }, [id])

  async function handleReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/support/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply }),
      })
      if (res.ok) { setReply(""); fetchTicket() }
    } finally { setSending(false) }
  }

  async function handleStatusChange(status: string) {
    setUpdating(status)
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchTicket()
    } finally { setUpdating("") }
  }

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <button onClick={() => router.push("/admin/support")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-indigo-600 mb-6 transition">
        <ArrowLeft size={16} /> Voltar para lista
      </button>

      <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-500">
              <span className="bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md">{ticket.user.name} ({roleLabels[ticket.user.role]})</span>
              <span className="flex items-center gap-1"><Clock size={12}/> {new Date(ticket.createdAt).toLocaleDateString("pt")}</span>
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {/* Descrição */}
        <div className="mb-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Descrição do Pedido:</p>
          {ticket.description}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {ticket.status !== "em_andamento" && <ActionButton label="Em andamento" onClick={() => handleStatusChange("em_andamento")} loading={updating === "em_andamento"} color="amber" />}
          {ticket.status !== "resolvido" && <ActionButton label="Resolver" onClick={() => handleStatusChange("resolvido")} icon={CheckCircle2} loading={updating === "resolvido"} color="emerald" />}
          {ticket.status !== "arquivado" && <ActionButton label="Arquivar" onClick={() => handleStatusChange("arquivado")} icon={Archive} loading={updating === "arquivado"} color="zinc" />}
        </div>

        {/* Mensagens */}
        <div className="space-y-6 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Histórico de Mensagens</h3>
          {ticket.messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col gap-2 p-4 rounded-2xl max-w-[85%]", msg.isStaff ? "ml-auto bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200")}>
              <div className="flex justify-between items-center text-[10px] opacity-70">
                <span>{msg.user.name} {msg.isStaff ? "(Equipa)" : ""}</span>
                <span>{new Date(msg.createdAt).toLocaleTimeString("pt", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
        </div>

        {/* Input de Resposta */}
        <form onSubmit={handleReply} className="relative mt-8">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escreva uma resposta..."
            className="w-full p-4 pr-16 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 resize-none outline-none focus:ring-2 focus:ring-indigo-500 transition"
            rows={3}
          />
          <button type="submit" disabled={sending || !reply.trim()} className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50">
            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  )
}

function ActionButton({ label, onClick, icon: Icon, loading, color }: any) {
  const styles = {
    amber: "bg-amber-600 hover:bg-amber-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    zinc: "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300"
  }
  return (
    <button onClick={onClick} disabled={loading} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition", styles[color as keyof typeof styles])}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon && <Icon size={14} />}
      {label}
    </button>
  )
}