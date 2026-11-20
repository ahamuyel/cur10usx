"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import AppAvatar from "@/components/ui/AppAvatar"
import {
  Loader2, ArrowLeft, Calendar, User, FileText, MessageSquare,
  CheckCircle, XCircle, AlertCircle, Clock, BookOpen,
} from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

const reasonLabels: Record<string, string> = {
  consulta_medica: "Consulta Médica",
  doenca: "Doença",
  falecimento_familiar: "Falecimento Familiar",
  atividade_desportiva: "Atividade Desportiva",
  representacao_institucional: "Representação Institucional",
  problema_pessoal: "Problema Pessoal",
  outro: "Outro",
}

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  pendente: { label: "Pendente", class: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-800", icon: Clock },
  em_analise: { label: "Em Análise", class: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: AlertCircle },
  aprovada: { label: "Aprovada", class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", icon: CheckCircle },
  rejeitada: { label: "Rejeitada", class: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800", icon: XCircle },
  informacao_adicional: { label: "Informação Adicional", class: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-800", icon: AlertCircle },
}

type Attendance = {
  id: string
  date: string
  status: string
  class: { id: string; name: string }
  lesson: { id: string; subjectId: string; subject: { name: string } } | null
}

type JustificationDetail = {
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
  attendances: Attendance[]
}

export default function JustificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isAdmin = role === "school_admin" || role === "teacher"
  const isStudent = role === "student"

  const [data, setData] = useState<JustificationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Review form state
  const [reviewStatus, setReviewStatus] = useState<string>("aprovada")
  const [reviewNotes, setReviewNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/justifications/${id}`)
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Erro ao carregar")
      }
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar justificação")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReview = async () => {
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch(`/api/justifications/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes: reviewNotes.trim() || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Erro ao submeter revisão")
      }
      await loadData()
    } catch (e: any) {
      setSubmitError(e.message || "Erro ao submeter revisão")
    } finally {
      setSubmitting(false)
    }
  }

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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">{error || "Justificação não encontrada"}</p>
          <button
            onClick={() => router.push("/list/justifications")}
            className="mt-4 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
          >
            Voltar à lista
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[data.status] || { label: data.status, class: "bg-zinc-100 text-zinc-700", icon: AlertCircle }
  const StatusIcon = status.icon
  const canReview = isAdmin && ["pendente", "em_analise", "informacao_adicional"].includes(data.status)

  return (
    <div className="m-2 sm:m-3 flex flex-col gap-4 max-w-3xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => router.push("/list/justifications")}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Voltar às justificações
      </button>

      {/* Header Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <AppAvatar
              src={null}
              name={data.student.name}
              className="w-full h-full !rounded-full border-2 border-zinc-200 dark:border-zinc-700"
              fallbackClassName="text-sm font-bold"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{data.student.name}</h1>
                {data.student.class && (
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded text-[11px] font-medium border border-zinc-200/50 dark:border-zinc-700/30">
                    {data.student.class.name}
                  </span>
                )}
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.class}`}>
                <StatusIcon size={13} />
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Detalhes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailField
            icon={Calendar}
            label="Data da Falta"
            value={new Date(data.date).toLocaleDateString("pt-PT")}
          />
          <DetailField
            icon={FileText}
            label="Motivo"
            value={reasonLabels[data.reason] || data.reason}
          />
          <DetailField
            icon={Calendar}
            label="Submetida em"
            value={new Date(data.createdAt).toLocaleDateString("pt-PT")}
            className="sm:col-span-2"
          />
        </div>

        {data.reasonDescription && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-start gap-2.5">
              <MessageSquare size={14} className="text-zinc-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Descrição</p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{data.reasonDescription}</p>
              </div>
            </div>
          </div>
        )}

        {data.documentUrl && (
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href={data.documentUrl}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
            >
              <FileText size={14} />
              Ver documento anexado
            </Link>
          </div>
        )}
      </div>

      {/* Review Info */}
      {data.reviewedBy && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Revisão</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailField
              icon={User}
              label="Revisor"
              value={data.reviewedBy.name}
            />
            {data.reviewedAt && (
              <DetailField
                icon={Calendar}
                label="Data da Revisão"
                value={new Date(data.reviewedAt).toLocaleDateString("pt-PT")}
              />
            )}
          </div>
          {data.reviewNotes && (
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-start gap-2.5">
                <MessageSquare size={14} className="text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mb-1">Notas da Revisão</p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{data.reviewNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Associated Attendances */}
      {data.attendances.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">
            Presenças Associadas ({data.attendances.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 pr-4 font-semibold text-zinc-500 text-xs">Data</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Turma</th>
                  <th className="text-left py-2 px-2 font-semibold text-zinc-500 text-xs">Disciplina</th>
                </tr>
              </thead>
              <tbody>
                {data.attendances.map((att) => (
                  <tr key={att.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-2.5 pr-4 text-zinc-700 dark:text-zinc-300 font-mono text-xs tabular-nums">
                      {new Date(att.date).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 text-xs">
                      {att.class.name}
                    </td>
                    <td className="py-2.5 px-2 text-zinc-500 dark:text-zinc-400 text-xs">
                      {att.lesson?.subject?.name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Form (admin only) */}
      {canReview && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-4 uppercase tracking-wider">Revisar Justificação</h2>

          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Estado</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "aprovada", label: "Aprovar", class: "border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" },
                  { value: "rejeitada", label: "Rejeitar", class: "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400" },
                  { value: "informacao_adicional", label: "Pedir Informação", class: "border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReviewStatus(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-all ${
                      reviewStatus === opt.value
                        ? opt.class + " ring-1 ring-offset-1 ring-zinc-300 dark:ring-zinc-600"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Notas da Revisão <span className="text-zinc-300 dark:text-zinc-600">(opcional)</span>
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Adicione notas ou justificativas para a decisão..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => router.push("/list/justifications")}
                className="h-9 px-4 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleReview}
                disabled={submitting}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle size={13} />
                )}
                <span>{submitting ? "A submeter..." : "Submeter Revisão"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailField({
  icon: Icon, label, value, className,
}: {
  icon: any
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`flex items-start gap-2.5 ${className || ""}`}>
      <Icon size={14} className="text-zinc-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{value}</p>
      </div>
    </div>
  )
}
