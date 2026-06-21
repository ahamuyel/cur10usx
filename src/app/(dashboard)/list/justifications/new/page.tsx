"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Loader2, ArrowLeft, Upload, X, Calendar, FileText, User,
  CheckCircle,
} from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

const reasonOptions = [
  { value: "consulta_medica", label: "Consulta Médica" },
  { value: "doenca", label: "Doença" },
  { value: "falecimento_familiar", label: "Falecimento Familiar" },
  { value: "atividade_desportiva", label: "Atividade Desportiva" },
  { value: "representacao_institucional", label: "Representação Institucional" },
  { value: "problema_pessoal", label: "Problema Pessoal" },
  { value: "outro", label: "Outro" },
]

type LinkedStudent = {
  id: string
  name: string
  class: { id: string; name: string } | null
}

type AttendanceRecord = {
  id: string
  date: string
  status: string
  class: { id: string; name: string }
  lesson: { id: string; subjectId: string; subject: { name: string } } | null
}

export default function NewJustificationPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = session?.user?.role
  const isStudent = role === "student"

  // Student selection
  const [studentId, setStudentId] = useState("")
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Form fields
  const [date, setDate] = useState("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  // File upload
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Attendance selection
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>([])
  const [loadingAttendances, setLoadingAttendances] = useState(false)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  // Load linked students for parents
  useEffect(() => {
    if (isStudent) {
      // Fetch the student's own profile to get their ID
      setLoadingStudents(true)
      fetch("/api/profile")
        .then((r) => r.json())
        .then((data) => {
          const s = data.student
          if (s?.id) {
            setStudentId(s.id)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingStudents(false))
    } else {
      // Parent - fetch linked students
      setLoadingStudents(true)
      fetch("/api/students?limit=100&linkedOnly=true")
        .then((r) => r.json())
        .then((data) => {
          const students = data.data || data || []
          setLinkedStudents(students)
          if (students.length === 1) {
            setStudentId(students[0].id)
          }
        })
        .catch(() => {})
        .finally(() => setLoadingStudents(false))
    }
  }, [isStudent])

  // Load attendance records when student and date are selected
  useEffect(() => {
    if (!studentId || !date) {
      setAttendances([])
      setSelectedAttendanceIds([])
      return
    }
    setLoadingAttendances(true)
    fetch(`/api/attendance?studentId=${studentId}&date=${date}&status=ausente&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setAttendances(data.data || [])
      })
      .catch(() => {})
      .finally(() => setLoadingAttendances(false))
  }, [studentId, date])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        const json = await res.json()
        if (json.url) setDocumentUrl(json.url)
      }
    } catch {
      // ignore
    } finally {
      setUploading(false)
    }
  }

  const toggleAttendance = (attId: string) => {
    setSelectedAttendanceIds((prev) =>
      prev.includes(attId) ? prev.filter((id) => id !== attId) : [...prev, attId]
    )
  }

  const handleSubmit = async () => {
    if (!studentId || !date || !reason) {
      setSubmitError("Preencha todos os campos obrigatórios.")
      return
    }
    setSubmitting(true)
    setSubmitError("")
    try {
      const res = await fetch("/api/justifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          date,
          reason,
          reasonDescription: description.trim() || null,
          documentUrl,
          attendanceIds: selectedAttendanceIds.length > 0 ? selectedAttendanceIds : undefined,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || "Erro ao criar justificação")
      }
      router.push("/list/justifications")
    } catch (e: any) {
      setSubmitError(e.message || "Erro ao submeter justificação")
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = studentId && date && reason

  return (
    <div className="m-2 sm:m-3 max-w-2xl mx-auto">

      <button
        onClick={() => router.push("/list/justifications")}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors w-fit mb-4"
      >
        <ArrowLeft size={14} />
        Voltar às justificações
      </button>

      <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Nova Justificação</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Submeta uma justificação para faltas do aluno.
          </p>
        </div>

        {submitError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
            {submitError}
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* Student selector (parent only) */}
          {!isStudent && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Aluno <span className="text-red-400">*</span>
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="h-10 w-full px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer"
              >
                <option value="">Selecionar aluno...</option>
                {linkedStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.class ? ` (${s.class.name})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Data da Falta <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-10 w-full pl-9 pr-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Motivo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 w-full pl-9 pr-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 cursor-pointer appearance-none"
              >
                <option value="">Selecionar motivo...</option>
                {reasonOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Descrição <span className="text-zinc-300 dark:text-zinc-600">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o motivo da falta em detalhe..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Documento <span className="text-zinc-300 dark:text-zinc-600">(opcional, atestado médico, etc.)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            {documentUrl ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate">Documento anexado</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDocumentUrl(null)}
                  className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs font-medium cursor-pointer disabled:opacity-40"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Upload size={14} />
                )}
                <span>{uploading ? "A carregar..." : "Carregar documento"}</span>
              </button>
            )}
          </div>

          {/* Attendance Records */}
          {attendances.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Presenças nesta data com falta <span className="text-zinc-300 dark:text-zinc-600">(selecionar para justificar)</span>
              </label>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800">
                {attendances.map((att) => {
                  const selected = selectedAttendanceIds.includes(att.id)
                  return (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => toggleAttendance(att.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary-50 dark:bg-primary-950/30"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        selected
                          ? "bg-primary-600 border-primary-600 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}>
                        {selected && <CheckCircle size={12} />}
                      </div>
                      <div className="flex-1 min-w-0 flex items-center gap-2 text-xs">
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {att.lesson?.subject?.name || "Registo global"}
                        </span>
                        {att.class && (
                          <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded text-[10px] font-medium">
                            {att.class.name}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!loadingAttendances && studentId && date && attendances.length === 0 && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Nenhuma falta encontrada para esta data.
            </p>
          )}

          {/* Submit */}
          <div className="flex items-center gap-2 justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => router.push("/list/justifications")}
              className="h-10 px-4 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || submitting}
              className="h-10 flex items-center gap-1.5 px-5 rounded-lg text-xs font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {submitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              <span>{submitting ? "A submeter..." : "Submeter Justificação"}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
