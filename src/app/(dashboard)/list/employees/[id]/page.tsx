"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import AppAvatar from "@/components/ui/AppAvatar"
import {
  Loader2, ArrowLeft, Mail, Phone, Shield, Building2,
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  UserRound, MapPin, Download,
} from "lucide-react"

type EmployeeDetail = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  foto: string | null
  role: string
  department: string | null
  isActive: boolean
  hasAccount: boolean
  userActive: boolean | null
  attendances: StaffAttendanceRecord[]
}

type StaffAttendanceRecord = {
  id: string
  date: string
  entryTime: string | null
  exitTime: string | null
  status: string
  justification: string | null
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

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  presente: { label: "Presente", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle },
  ausente: { label: "Ausente", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800", icon: XCircle },
  atrasado: { label: "Atrasado", class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: AlertCircle },
  falta_justificada: { label: "Falta Justificada", class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: Clock },
  dispensa: { label: "Dispensa", class: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800", icon: Clock },
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [data, setData] = useState<EmployeeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10))
  const [attStatus, setAttStatus] = useState("presente")
  const [attEntry, setAttEntry] = useState("")
  const [attExit, setAttExit] = useState("")
  const [attJustification, setAttJustification] = useState("")
  const [attSubmitting, setAttSubmitting] = useState(false)
  const [attError, setAttError] = useState("")

  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/employees/${id}?startDate=${dateRange.start}&endDate=${dateRange.end}`)
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Erro ao carregar")
      }
      const json = await res.json()
      setData(json)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar funcionário")
    } finally {
      setLoading(false)
    }
  }, [id, dateRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAttendance = async () => {
    setAttSubmitting(true)
    setAttError("")
    try {
      const body: Record<string, unknown> = {
        date: attDate,
        status: attStatus,
      }
      if (attEntry) body.entryTime = `${attDate}T${attEntry}:00`
      if (attExit) body.exitTime = `${attDate}T${attExit}:00`
      if (attJustification) body.justification = attJustification

      const res = await fetch(`/api/employees/${id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Erro ao registar presença")
      }
      setAttStatus("presente")
      setAttEntry("")
      setAttExit("")
      setAttJustification("")
      await loadData()
    } catch (e: unknown) {
      setAttError(e instanceof Error ? e.message : "Erro ao registar presença")
    } finally {
      setAttSubmitting(false)
    }
  }

  const attSummary = data?.attendances
    ? {
        total: data.attendances.length,
        presente: data.attendances.filter((a) => a.status === "presente").length,
        ausente: data.attendances.filter((a) => a.status === "ausente").length,
        atrasado: data.attendances.filter((a) => a.status === "atrasado").length,
        falta_justificada: data.attendances.filter((a) => a.status === "falta_justificada").length,
        dispensa: data.attendances.filter((a) => a.status === "dispensa").length,
      }
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="m-2 sm:m-3">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 text-center">
          <AlertCircle size={32} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{error || "Funcionário não encontrado"}</p>
          <button onClick={() => router.push("/list/employees")} className="mt-4 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline">
            Voltar à lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4 max-w-4xl mx-auto">
      <button
        onClick={() => router.push("/list/employees")}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Voltar aos funcionários
      </button>

      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative w-16 h-16 shrink-0">
            <AppAvatar
              src={data.foto}
              name={data.name}
              className="w-full h-full !rounded-full border-2 border-zinc-200 dark:border-zinc-700"
              fallbackClassName="text-base font-bold"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{data.name}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                    <Shield size={10} />
                    {roleLabels[data.role] || data.role}
                  </span>
                  {data.department && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                      <Building2 size={10} />
                      {data.department}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    data.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                      : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800"
                  }`}>
                    {data.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {data.email && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Mail size={12} />
                  {data.email}
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <Phone size={12} />
                  {data.phone}
                </div>
              )}
              {data.address && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 sm:col-span-2">
                  <MapPin size={12} />
                  {data.address}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      {attSummary && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Assiduidade</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <SummaryCard label="Total" value={attSummary.total} color="text-zinc-900 dark:text-zinc-100" />
            <SummaryCard label="Presenças" value={attSummary.presente} color="text-emerald-600 dark:text-emerald-400" />
            <SummaryCard label="Faltas" value={attSummary.ausente} color="text-red-600 dark:text-red-400" />
            <SummaryCard label="Atrasos" value={attSummary.atrasado} color="text-amber-600 dark:text-amber-400" />
            <SummaryCard label="Justificadas" value={attSummary.falta_justificada} color="text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      )}

      {/* Register Attendance */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Registar Presença</h2>

        {attError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
            {attError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Data</label>
            <input
              type="date"
              value={attDate}
              onChange={(e) => setAttDate(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Estado</label>
            <select
              value={attStatus}
              onChange={(e) => setAttStatus(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
              <option value="atrasado">Atrasado</option>
              <option value="falta_justificada">Falta Justificada</option>
              <option value="dispensa">Dispensa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Entrada</label>
            <input
              type="time"
              value={attEntry}
              onChange={(e) => setAttEntry(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Saída</label>
            <input
              type="time"
              value={attExit}
              onChange={(e) => setAttExit(e.target.value)}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-medium text-zinc-500">Justificação <span className="text-zinc-300 dark:text-zinc-600">(opcional)</span></label>
          <input
            value={attJustification}
            onChange={(e) => setAttJustification(e.target.value)}
            className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            placeholder="Motivo da falta/atraso..."
          />
        </div>

        <button
          onClick={handleAttendance}
          disabled={attSubmitting}
          className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {attSubmitting ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Calendar size={13} />
          )}
          <span>{attSubmitting ? "A registar..." : "Registar Presença"}</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Data Início</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500">Data Fim</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
            />
          </div>
          <button
            onClick={loadData}
            className="h-9 px-4 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors"
          >
            Filtrar
          </button>
        </div>

        {/* Attendance Records */}
        {data.attendances.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 pr-4 font-semibold text-zinc-500 text-xs">Data</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Estado</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Entrada</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Saída</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Justificação</th>
                </tr>
              </thead>
              <tbody>
                {data.attendances.map((att) => {
                  const cfg = statusConfig[att.status] || { label: att.status, class: "bg-zinc-100 text-zinc-700", icon: Clock }
                  const Icon = cfg.icon
                  return (
                    <tr key={att.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                      <td className="py-2.5 pr-4 text-zinc-700 dark:text-zinc-300 font-mono text-xs tabular-nums">
                        {new Date(att.date).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="py-2.5 px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.class}`}>
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        {att.entryTime ? new Date(att.entryTime).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                        {att.exitTime ? new Date(att.exitTime).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 text-xs max-w-[150px] truncate">
                        {att.justification || "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {data.attendances.length === 0 && (
          <p className="text-center py-6 text-zinc-400 dark:text-zinc-500 text-xs">
            Nenhum registo de presença encontrado neste período.
          </p>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 uppercase tracking-wider">{label}</p>
    </div>
  )
}
