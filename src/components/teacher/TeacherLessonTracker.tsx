"use client"

import { useState, useEffect, useTransition } from "react"
import {
  Calendar, Check, AlertTriangle, XCircle, Clock, Plus, BookOpen, Users, Info, Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  day: string
  startTime: string
  endTime: string
  subject: { id: string; name: string }
  class: { id: string; name: string }
  teacherId: string
}

interface LessonRecord {
  id: string
  lessonId: string
  date: string | Date
  status: "PENDING" | "REALIZADA" | "FALTOU" | "SUBSTITUIDA"
  notes?: string | null
  adminNotes?: string | null
}

const WEEKDAY_NAMES = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

export default function TeacherLessonTracker() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [records, setRecords] = useState<LessonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Sheet states
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [selectedDateStr, setSelectedDateStr] = useState<string>("")
  const [notes, setNotes] = useState("")
  
  // Transition state
  const [isPendingSubmit, startTransition] = useTransition()
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Get current week Monday and Sunday
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  const startOfWeek = new Date(now.setDate(diff))
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const fromStr = startOfWeek.toISOString().split("T")[0]
  const toStr = endOfWeek.toISOString().split("T")[0]

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      const [lessonsRes, recordsRes] = await Promise.all([
        fetch("/api/lessons?limit=100"),
        fetch(`/api/lessons/records?from=${fromStr}&to=${toStr}`)
      ])

      if (!lessonsRes.ok) {
        const errBody = await lessonsRes.json().catch(() => ({}))
        throw new Error(errBody.error || `Erro ao carregar aulas (${lessonsRes.status})`)
      }
      if (!recordsRes.ok) {
        const errBody = await recordsRes.json().catch(() => ({}))
        throw new Error(errBody.error || `Erro ao carregar registos (${recordsRes.status})`)
      }

      const lessonsData = await lessonsRes.json()
      const recordsData = await recordsRes.json()

      setLessons(lessonsData.data || [])
      setRecords(recordsData || [])
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Não foi possível carregar o controlo de assiduidade.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getWeekDate = (dayIndex: number) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + dayIndex)
    return d
  }

  const isFutureDay = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date > today
  }

  const formatDateLabel = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0")
    const m = String(date.getMonth() + 1).padStart(2, "0")
    return `${d}/${m}`
  }

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const handleRegister = async (lessonId: string, dateStr: string, notesText: string) => {
    const tempId = "temp-" + Math.random()
    const optimisticRecord: LessonRecord = {
      id: tempId,
      lessonId,
      date: dateStr,
      status: "PENDING",
      notes: notesText,
    }

    setRecords((prev) => [...prev, optimisticRecord])

    try {
      const res = await fetch(`/api/lessons/${lessonId}/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, notes: notesText }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar registo de aula")
      }

      setRecords((prev) => prev.map((r) => (r.id === tempId ? data : r)))
      setToast({ message: "Aula registada e enviada para validação!", type: "success" })
      setIsSheetOpen(false)
      setNotes("")
    } catch (err: any) {
      setRecords((prev) => prev.filter((r) => r.id !== tempId))
      setToast({ message: err.message || "Falha ao registar a aula.", type: "error" })
    }
  }

  const handleOpenSheet = (lesson: Lesson, date: Date) => {
    setSelectedLesson(lesson)
    setSelectedDateStr(formatDateStr(date))
    setNotes("")
    setIsSheetOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLesson || !selectedDateStr) return

    startTransition(async () => {
      await handleRegister(selectedLesson.id, selectedDateStr, notes)
    })
  }

  if (loading) {
    return (
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-4 md:p-8 animate-pulse shadow-sm">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded mb-4" />
        <div className="h-4 w-72 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
        <div className="space-y-4 md:space-y-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col gap-2 p-4 border border-zinc-100 dark:border-zinc-900 rounded-xl md:rounded-2xl">
              <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="flex gap-4 mt-2">
                <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 dark:bg-red-950/15 border border-red-200 dark:border-red-900/30 rounded-2xl md:rounded-3xl p-6 text-center mx-auto max-w-2xl">
        <AlertTriangle size={24} className="mx-auto text-red-500 mb-2" />
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
        <Button onClick={fetchData} size="sm" variant="outline" className="mt-4 border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 w-full sm:w-auto">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
      <div className="p-4 md:p-8">
        {/* Header Responsivo */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Calendar className="text-primary w-5 h-5 flex-shrink-0" />
              Controlo de Assiduidade
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
              Registe e acompanhe a execução das suas aulas para a semana de {formatDateLabel(startOfWeek)} a {formatDateLabel(endOfWeek)}.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] md:text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-zinc-800 w-fit self-start lg:self-center">
            <Sparkles size={13} className="text-primary flex-shrink-0" />
            <span>Dupla validação (Registo → Aprovação)</span>
          </div>
        </div>

        {/* Lista de Dias */}
        <div className="space-y-4 md:space-y-6">
          {WEEKDAY_NAMES.map((dayName, dayIndex) => {
            const weekDate = getWeekDate(dayIndex)
            const weekDateStr = formatDateStr(weekDate)
            const isFuture = isFutureDay(weekDate)
            const dayLessons = lessons.filter((l) => l.day === dayName)

            return (
              <div
                key={dayName}
                className={cn(
                  "p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all duration-200",
                  isFuture
                    ? "bg-zinc-50/40 dark:bg-zinc-900/10 border-zinc-100 dark:border-zinc-900 opacity-60"
                    : "bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-sm"
                )}
              >
                {/* Topo do Card de Dia */}
                <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/40 pb-2.5 mb-3">
                  <h3 className="text-xs md:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    {dayName}
                    <span className="text-[11px] md:text-xs font-normal text-zinc-400 dark:text-zinc-500">
                      ({formatDateLabel(weekDate)})
                    </span>
                  </h3>
                  {isFuture && (
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-2.5 py-0.5 rounded-full border border-zinc-200/20">
                      Futura
                    </span>
                  )}
                </div>

                {dayLessons.length === 0 ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-1">
                    Sem aulas agendadas para este dia.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dayLessons.map((lesson) => {
                      const record = records.find(
                        (r) =>
                          r.lessonId === lesson.id &&
                          (typeof r.date === "string"
                            ? r.date.startsWith(weekDateStr)
                            : r.date.toISOString().startsWith(weekDateStr))
                      )

                      return (
                        <div
                          key={lesson.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 md:p-4 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/70 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
                        >
                          <div className="flex items-start gap-3 w-full sm:w-auto">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0 mt-0.5">
                              <BookOpen size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 truncate">
                                  {lesson.subject.name}
                                </span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 whitespace-nowrap">
                                  <Users size={12} />
                                  {lesson.class.name}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 mt-1 font-medium">
                                <Clock size={12} />
                                {lesson.startTime}h - {lesson.endTime}h
                              </p>
                              
                              {record?.notes && (
                                <p className="text-[11px] text-zinc-500 mt-2 bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-100 dark:border-zinc-800 w-fit max-w-full break-words italic">
                                  Obs: "{record.notes}"
                                </p>
                              )}
                              {record?.adminNotes && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 bg-amber-50/40 dark:bg-amber-950/10 p-2 rounded border border-amber-200/20 w-fit max-w-full break-words italic flex items-start gap-1">
                                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                                  <span>Feedback Admin: "{record.adminNotes}"</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Botões/Status Responsivos (Largura total em Mobile) */}
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-1 sm:mt-0">
                            {record ? (
                              <div className="w-full sm:w-auto flex justify-end">
                                {record.status === "PENDING" && (
                                  <Badge variant="warning" className="flex items-center gap-1 py-1 px-2.5 text-xs w-full sm:w-auto justify-center">
                                    <Clock size={12} className="animate-spin duration-1000" />
                                    <span>Aguarda validação</span>
                                  </Badge>
                                )}
                                {record.status === "REALIZADA" && (
                                  <Badge variant="success" className="flex items-center gap-1 py-1 px-2.5 text-xs w-full sm:w-auto justify-center">
                                    <Check size={12} />
                                    <span>Realizada</span>
                                  </Badge>
                                )}
                                {record.status === "FALTOU" && (
                                  <Badge variant="destructive" className="flex items-center gap-1 py-1 px-2.5 text-xs w-full sm:w-auto justify-center">
                                    <XCircle size={12} />
                                    <span>Falta</span>
                                  </Badge>
                                )}
                                {record.status === "SUBSTITUIDA" && (
                                  <Badge className="bg-sky-500 text-white border-transparent flex items-center gap-1 py-1 px-2.5 text-xs w-full sm:w-auto justify-center">
                                    <Users size={12} />
                                    <span>Substituída</span>
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <Badge variant="secondary" className="py-1 px-2.5 text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                                  Por registar
                                </Badge>
                                {!isFuture && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenSheet(lesson, weekDate)}
                                    className="h-8 font-medium rounded-lg text-xs bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 px-3"
                                  >
                                    <Plus size={14} className="mr-1" />
                                    Registar
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Sheet Form Responsivo */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-0 overflow-hidden flex flex-col h-full">
          <SheetHeader className="p-5 md:p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 text-left">
            <SheetTitle className="text-base md:text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="text-primary w-5 h-5" />
              Registo de Execução de Aula
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              Preencha os dados abaixo para confirmar a ocorrência desta aula agendada.
            </SheetDescription>
          </SheetHeader>

          {selectedLesson && (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-5 md:p-6 space-y-5 overflow-y-auto">
              <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/40 dark:border-zinc-800/40 rounded-xl md:rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs border-b border-zinc-200/40 dark:border-zinc-800/20 pb-2">
                  <span className="font-semibold text-zinc-500">Disciplina</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] text-right">{selectedLesson.subject.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-zinc-200/40 dark:border-zinc-800/20 pb-2">
                  <span className="font-semibold text-zinc-500">Turma</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedLesson.class.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-zinc-200/40 dark:border-zinc-800/20 pb-2">
                  <span className="font-semibold text-zinc-500">Horário</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedLesson.startTime} - {selectedLesson.endTime}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-500">Data de Execução</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{selectedDateStr}</span>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Observações / Notas da Aula (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Leccionado conteúdo de frações; turma participativa..."
                  className="w-full h-32 px-3.5 py-2.5 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-primary/80 transition resize-none"
                  disabled={isPendingSubmit}
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-auto bg-white dark:bg-zinc-950 layer-safe-bottom">
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1 rounded-xl h-11 border-zinc-200 dark:border-zinc-800 text-xs md:text-sm" disabled={isPendingSubmit}>
                    Cancelar
                  </Button>
                </SheetClose>
                <Button type="submit" className="flex-1 rounded-xl h-11 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs md:text-sm" disabled={isPendingSubmit}>
                  {isPendingSubmit ? "A registar..." : "Confirmar Registo"}
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Toast Notificação Flutuante Responsiva */}
      {toast && (
        <div
          className={cn(
            "fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl md:rounded-2xl border shadow-xl animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-md max-w-sm sm:max-w-none",
            toast.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          )}
        >
          <div className={cn("p-1 rounded-full flex-shrink-0", toast.type === "success" ? "bg-emerald-500/20" : "bg-red-500/20")}>
            {toast.type === "success" ? <Check size={14} /> : <AlertTriangle size={14} />}
          </div>
          <span className="text-xs font-semibold leading-tight">{toast.message}</span>
        </div>
      )}
    </div>
  )
}