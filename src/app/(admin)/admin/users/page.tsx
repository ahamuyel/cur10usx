"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, Search, KeyRound, Copy, Check, X, LayoutGrid, List } from "lucide-react"
import Pagination from "@/components/ui/Pagination"

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  mustChangePassword: boolean
  provider: string | null
  school: { name: string } | null
  createdAt: string
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  school_admin: "Admin Escola",
  teacher: "Professor",
  student: "Aluno",
  parent: "Encarregado",
}

const roleColors: Record<string, string> = {
  super_admin: "bg-primary-100 dark:bg-primary-950/40 text-primary dark:text-primary-400",
  school_admin: "bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400",
  teacher: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
  student: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
  parent: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
}

const roleFilters = [
  { value: "", label: "Todos" },
  { value: "super_admin", label: "Super Admin" },
  { value: "school_admin", label: "Admin Escola" },
  { value: "teacher", label: "Professor" },
  { value: "student", label: "Aluno" },
  { value: "parent", label: "Encarregado" },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetCreds, setResetCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [resetError, setResetError] = useState("")

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)
      if (roleFilter) params.set("role", roleFilter)
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch {
      console.error("Erro ao carregar utilizadores")
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleResetPassword = async () => {
    if (!resetTarget) return
    setResetLoading(true)
    setResetError("")
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: resetTarget.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResetError(data.error || "Erro ao restaurar palavra-passe")
        return
      }
      setResetCreds({ email: data.email, password: "(enviada por e-mail)" })
      setResetTarget(null)
      fetchUsers()
    } catch {
      setResetError("Erro de conexão")
    } finally {
      setResetLoading(false)
    }
  }

  const handleCopy = () => {
    if (!resetCreds) return
    navigator.clipboard.writeText(`E-mail: ${resetCreds.email}\nPalavra-passe: ${resetCreds.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Utilizadores</h1>
          <p className="text-sm text-zinc-500">{total} utilizador(es) encontrado(s)</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button onClick={() => setViewMode("table")} className={`p-2 rounded-md ${viewMode === "table" ? "bg-zinc-100 dark:bg-zinc-800 text-primary" : "text-zinc-400"}`}><List size={18} /></button>
          <button onClick={() => setViewMode("card")} className={`p-2 rounded-md ${viewMode === "card" ? "bg-zinc-100 dark:bg-zinc-800 text-primary" : "text-zinc-400"}`}><LayoutGrid size={18} /></button>
        </div>
      </div>

      {resetCreds && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">Palavra-passe restaurada com sucesso!</p>
            <button onClick={() => setResetCreds(null)} className="text-emerald-500 hover:text-emerald-700"><X size={16} /></button>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <code className="text-xs bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex-1 break-all">E-mail: {resetCreds.email} | Palavra-passe: {resetCreds.password}</code>
            <button onClick={handleCopy} className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copiado" : "Copiar"}</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="text-zinc-400" />
          <input type="text" placeholder="Pesquisar..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="bg-transparent outline-none text-sm w-full" />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {roleFilters.map((f) => (
            <button key={f.value} onClick={() => { setRoleFilter(f.value); setPage(1) }} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${roleFilter === f.value ? "bg-primary text-white" : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"}`}>{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-primary" /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">Nenhum utilizador encontrado</div>
      ) : (
        <>
          {viewMode === "table" ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 uppercase"><th className="text-left py-3 px-4 font-medium">Nome</th><th className="text-left py-3 px-4 font-medium hidden sm:table-cell">E-mail</th><th className="text-left py-3 px-4 font-medium">Papel</th><th className="text-left py-3 px-4 font-medium hidden md:table-cell">Escola</th><th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Estado</th><th className="text-right py-3 px-4 font-medium">Acções</th></tr></thead>
                  <tbody>{users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500">{user.name.charAt(0)}</div><span className="font-medium">{user.name}</span></div></td>
                      <td className="py-3 px-4 hidden sm:table-cell">{user.email}</td>
                      <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${roleColors[user.role]}`}>{roleLabels[user.role]}</span></td>
                      <td className="py-3 px-4 text-xs hidden md:table-cell">{user.school?.name || "—"}</td>
                      <td className="py-3 px-4 hidden sm:table-cell"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>{user.isActive ? "Activo" : "Inactivo"}</span></td>
                      <td className="py-3 px-4 text-right">
                        {(!user.provider || user.provider === "credentials") && (
                          <button onClick={() => setResetTarget(user)} className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600"><KeyRound size={16} /></button>
                        )}
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-500">{user.name.charAt(0)}</div>
                    <div>
                      <h4 className="font-medium text-sm">{user.name}</h4>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${roleColors[user.role]}`}>{roleLabels[user.role]}</span>
                    <span className={`px-2 py-0.5 rounded-full ${user.isActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>{user.isActive ? "Activo" : "Inactivo"}</span>
                  </div>
                  {(!user.provider || user.provider === "credentials") && (
                    <button onClick={() => setResetTarget(user)} className="mt-2 w-full py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-700"><KeyRound size={12} /> Restaurar palavra-passe</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {totalPages > 1 && <div className="mt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>}
        </>
      )}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setResetTarget(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-200 dark:border-zinc-800" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Restaurar palavra-passe</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Tem a certeza que deseja restaurar a palavra-passe de <strong>{resetTarget.name}</strong>?</p>
            <div className="flex items-center gap-3 justify-end">
              <button onClick={() => setResetTarget(null)} className="px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800">Cancelar</button>
              <button onClick={handleResetPassword} disabled={resetLoading} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-600">{resetLoading ? "A restaurar..." : "Restaurar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}