"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Pagination from "@/components/ui/Pagination"
import Table from "@/components/ui/Table"
import TableSearch from "@/components/ui/TableSearch"
import FormModal from "@/components/ui/FormModal"
import MessageForm from "@/components/forms/MessageForm"
import { useEntityList } from "@/hooks/useEntityList"
import { Send, Loader2, Mail, Users, Clock } from "lucide-react"

type Message = {
  id: string
  subject: string
  body: string
  fromId: string
  toId?: string | null
  toAll: boolean
  read: boolean
  createdAt: string
  from?: { id: string; name: string }
  to?: { id: string; name: string } | null
}

const columns = [
  { header: "De", accessor: "from" },
  { header: "Para", accessor: "to", className: "hidden md:table-cell" },
  { header: "Assunto", accessor: "subject" },
  { header: "Data", accessor: "date", className: "hidden lg:table-cell" },
  { header: "Estado", accessor: "status" },
]

const MessageListPage = () => {
  const { data, totalPages, page, search, setSearch, setPage, loading, refetch } = useEntityList<Message>({ endpoint: "/api/messages", limit: 8 })
  const [createOpen, setCreateOpen] = useState(false)

  const renderRow = (item: Message) => (
    <tr
      key={item.id}
      className={`border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors ${
        !item.read ? "border-l-4 border-l-indigo-500" : ""
      }`}
    >
      <td className="py-4 px-4">
        <span className={`text-xs font-semibold ${!item.read ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>
          {item.from?.name || "—"}
        </span>
      </td>
      <td className="hidden md:table-cell py-4 px-4 text-xs text-zinc-500">
        {item.toAll ? <span className="flex items-center gap-1"><Users size={12}/> Todos</span> : item.to?.name || "—"}
      </td>
      <td className="py-4 px-4">
        <span className={`text-xs font-medium ${!item.read ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-600 dark:text-zinc-400"}`}>
          {item.subject}
        </span>
      </td>
      <td className="hidden lg:table-cell py-4 px-4 text-xs text-zinc-400 font-mono">
        {new Date(item.createdAt).toLocaleDateString("pt")}
      </td>
      <td className="py-4 px-4">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${!item.read ? "bg-indigo-50 text-indigo-600" : "bg-zinc-100 text-zinc-400"}`}>
          {item.read ? "Lida" : "Nova"}
        </span>
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Mail size={18} className="text-zinc-400" />
            Caixa de Correio
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Comunicação e avisos internos.</p>
        </div>

        <div className="flex items-center gap-3">
          <TableSearch value={search} onChange={setSearch} />
          <button
            onClick={() => setCreateOpen(true)}
            className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium text-xs shadow-3xs transition-colors"
          >
            <Send size={14} />
            <span>Nova</span>
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 text-xs">Nenhuma mensagem encontrada.</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </div>

      {!loading && data.length > 0 && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <FormModal open={createOpen} onClose={() => setCreateOpen(false)} title="Nova Mensagem">
        <MessageForm mode="create" onSuccess={() => { setCreateOpen(false); refetch() }} onCancel={() => setCreateOpen(false)} />
      </FormModal>
    </div>
  )
}

export default MessageListPage