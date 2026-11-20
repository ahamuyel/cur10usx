"use client"

import { useState, useEffect, useRef } from "react"
import {
  Check, X, AlertTriangle, Clock, BookOpen, Users, User, ArrowRight, CornerDownRight, RotateCcw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface LessonRecord {
  id: string
  date: string
  status: string
  notes?: string | null
  adminNotes?: string | null
  lesson: {
    id: string
    startTime: string
    endTime: string
    subject: { name: string }
    class: { name: string }
    teacher: {
      id: string
      name: string
      foto?: string | null
      user?: { image?: string | null } | null
    }
  }
}

export default function LessonValidationQueue() {
  const [records, setRecords] = useState<LessonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Rejection modal states
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<LessonRecord | null>(null)
  const [rejectStatus, setRejectStatus] = useState<"FALTOU" | "SUBSTITUIDA">("FALTOU")
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectError, setRejectError] = useState("")

  // Optimistic/Undo states
  const [hiddenIds, setHiddenIds] = useState<string[]>([])
  const [undoState, setUndoState] = useState<{
    recordId: string
    status: "REALIZADA" | "FALTOU" | "SUBSTITUIDA"
    adminNotes?: string
    timerId: NodeJS.Timeout
  } | null>(null)

  // To display error alerts to users
  const [apiToast, setApiToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Use a ref to store active undo state so the cleanup can access the latest values
  const undoStateRef = useRef(undoState)
  useEffect(() => {
    undoStateRef.current = undoState
  }, [undoState])

  // Clear timers on unmount and commit outstanding undo operations
  useEffect(() => {
    return () => {
      if (undoStateRef.current) {
        clearTimeout(undoStateRef.current.timerId)
        // Execute the API call immediately on unmount
        commitValidation(
          undoStateRef.current.recordId,
          undoStateRef.current.status,
          undoStateRef.current.adminNotes
        )
      }
    }
  }, [])

  useEffect(() => {
    if (apiToast) {
      const timer = setTimeout(() => setApiToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [apiToast])

  const fetchPending = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/lessons/records?status=PENDING")
      if (!res.ok) throw new Error("Erro ao obter registos pendentes do servidor")
      const data = await res.json()
      setRecords(data || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Não foi possível carregar a fila de validação.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  // Actually commit the update to the server
  const commitValidation = async (
    recordId: string,
    status: "REALIZADA" | "FALTOU" | "SUBSTITUIDA",
    notesText?: string
  ) => {
    try {
      const res = await fetch(`/api/lessons/records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notesText }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar validação no servidor")
      }
      // Remove from visible record state completely
      setRecords((prev) => prev.filter((r) => r.id !== recordId))
      setHiddenIds((prev) => prev.filter((id) => id !== recordId))
    } catch (err: any) {
      console.error(err)
      setApiToast({ message: err.message || "Erro ao validar aula.", type: "error" })
      // Put back in list on failure
      setHiddenIds((prev) => prev.filter((id) => id !== recordId))
    }
  }

  // Handle Validate / Reject actions with optimistic hide and Undo support
  const queueAction = (
    recordId: string,
    status: "REALIZADA" | "FALTOU" | "SUBSTITUIDA",
    notesText?: string
  ) => {
    // If there is already an uncommitted action in progress, commit it immediately
    if (undoState) {
      clearTimeout(undoState.timerId)
      commitValidation(undoState.recordId, undoState.status, undoState.adminNotes)
    }

    // Hide record optimisticly
    setHiddenIds((prev) => [...prev, recordId])

    // Set a 5-second timer to run the actual fetch
    const timerId = setTimeout(() => {
      commitValidation(recordId, status, notesText)
      setUndoState(null)
    }, 5000)

    setUndoState({
      recordId,
      status,
      adminNotes: notesText,
      timerId,
    })
  }

  const handleUndo = () => {
    if (!undoState) return
    clearTimeout(undoState.timerId)
    // Restore item to the queue list in the UI
    setHiddenIds((prev) => prev.filter((id) => id !== undoState.recordId))
    setUndoState(null)
    setApiToast({ message: "Ação desfeita com sucesso!", type: "success" })
  }

  const handleOpenReject = (record: LessonRecord) => {
    setSelectedRecord(record)
    setRejectStatus("FALTOU")
    setAdminNotes("")
    setRejectError("")
    setIsRejectOpen(true)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecord) return
    if (!adminNotes.trim()) {
      setRejectError("A observação de rejeição é obrigatória.")
      return
    }

    queueAction(selectedRecord.id, rejectStatus, adminNotes)
    setIsRejectOpen(false)
  }

  const visibleRecords = records.filter((r) => !hiddenIds.includes(r.id))

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 animate-pulse space-y-4">
        <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-3xl p-6 text-center">
        <AlertTriangle className="mx-auto text-red-500 mb-2 w-5 h-5" />
        <p className="text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>
        <Button onClick={fetchPending} variant="outline" size="sm" className="mt-3 border-red-300 text-red-700 dark:text-red-400">
          Recarregar
        </Button>
      </div>
    )
  }

  if (visibleRecords.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <Check size={24} />
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Fila de Validação Vazia</h3>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs">
          Nenhuma aula pendente de validação. Bom trabalho!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <Clock className="text-primary w-4.5 h-4.5" />
              Validação de Aulas
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Rever e aprovar registos de aulas leccionadas por professores.
            </p>
          </div>
          <Badge variant="warning" className="px-2.5 py-0.5 text-[10px] font-bold">
            {visibleRecords.length} pendentes
          </Badge>
        </div>

        <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
          {visibleRecords.map((record) => {
            const dateObj = new Date(record.date)
            const dateStr = dateObj.toLocaleDateString("pt", { day: "numeric", month: "short" })
            const teacherFoto = record.lesson.teacher.foto || record.lesson.teacher.user?.image

            return (
              <div
                key={record.id}
                className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-900/60 rounded-2xl hover:border-zinc-200 dark:hover:border-zinc-800 transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/40">
                    {teacherFoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={teacherFoto} alt={record.lesson.teacher.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {record.lesson.teacher.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                      Professor
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900/60 pt-3">
                  <div className="flex items-start gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {record.lesson.subject.name}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/20">
                      {record.lesson.class.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {record.lesson.startTime}
                    </span>
                  </div>

                  {record.notes && (
                    <div className="flex items-start gap-1 bg-white dark:bg-zinc-950 p-2 rounded-lg border border-zinc-100 dark:border-zinc-900/50 mt-1">
                      <CornerDownRight size={11} className="text-zinc-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 italic">
                        "{record.notes}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-1">
                  <Button
                    size="sm"
                    onClick={() => queueAction(record.id, "REALIZADA")}
                    className="flex-1 h-8 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition"
                  >
                    <Check size={14} className="mr-1" /> Validar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenReject(record)}
                    className="flex-1 h-8 rounded-lg text-xs border-red-200 hover:bg-red-50 hover:text-red-700 text-red-600 dark:border-red-900/25 dark:hover:bg-red-950/10 font-medium transition"
                  >
                    <X size={14} className="mr-1" /> Rejeitar
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleConfirmReject}>
            <DialogHeader className="text-left">
              <DialogTitle className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="text-red-500 w-5 h-5" />
                Rejeitar Registo de Aula
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Selecione o motivo da rejeição e escreva as notas administrativas para o professor.
              </DialogDescription>
            </DialogHeader>

            {selectedRecord && (
              <div className="my-5 space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Definir Estado da Aula
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRejectStatus("FALTOU")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition",
                        rejectStatus === "FALTOU"
                          ? "bg-red-50 dark:bg-red-950/15 border-red-500/50 text-red-700 dark:text-red-400"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <X size={14} /> Falta Docente
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectStatus("SUBSTITUIDA")}
                      className={cn(
                        "flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition",
                        rejectStatus === "SUBSTITUIDA"
                          ? "bg-sky-50 dark:bg-sky-950/10 border-sky-500/50 text-sky-700 dark:text-sky-400"
                          : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850 text-zinc-600 dark:text-zinc-400"
                      )}
                    >
                      <Users size={14} /> Aula Substituída
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Observação do Administrador (Obrigatório)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => {
                      setAdminNotes(e.target.value)
                      if (e.target.value.trim()) setRejectError("")
                    }}
                    placeholder="Escreva a razão da rejeição ou instruções (Ex: Professor não compareceu; Substituído por Prof. Silva)"
                    className="w-full h-24 px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/80 transition"
                  />
                  {rejectError && <p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">{rejectError}</p>}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 mt-6 border-t border-zinc-100 dark:border-zinc-900 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)} className="rounded-xl h-10 text-xs">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl h-10 text-xs bg-red-600 hover:bg-red-700 text-white font-medium">
                Rejeitar e Notificar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Undo and API Actions Toast notifications */}
      {undoState && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-2xl shadow-2xl border border-zinc-800 dark:border-zinc-100 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-amber-500 animate-spin duration-1000 shrink-0" />
            <span className="text-xs font-medium">
              Aula {undoState.status === "REALIZADA" ? "validada" : "rejeitada"}...
            </span>
          </div>
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 dark:text-violet-600 hover:underline px-2.5 py-1.5 rounded-lg bg-zinc-800 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition shrink-0 active:scale-95"
          >
            <RotateCcw size={12} /> Desfazer
          </button>
        </div>
      )}

      {/* Generic API Status Toast */}
      {apiToast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md",
            apiToast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          <div className={cn("p-1 rounded-full", apiToast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20")}>
            {apiToast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
          </div>
          <span className="text-xs font-semibold">{apiToast.message}</span>
        </div>
      )}
    </div>
  )
}
