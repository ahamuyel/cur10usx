"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import {
  Loader2, AlertCircle, History, ChevronDown, ChevronRight,
  FileText, CalendarDays, TrendingUp, TrendingDown, Minus,
  BookOpen, Users, Search, Filter, GraduationCap,
  Trophy, Target, Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface HistoryResult {
  id: string
  score: number
  type: string
  date: string
  trimester: string | null
  weight: number | null
  observations: string | null
}

interface HistorySubject {
  subjectId: string
  subjectName: string
  teacherName: string | null
  totalLessons: number
  totalAverage: number
  trimesterAverages: Record<string, number>
  results: HistoryResult[]
  absences: number
  absenceDates: string[]
}

interface TrimesterEvo {
  trimester: string
  label: string
  generalAverage: number
}

interface TimelineEvent {
  type: "exam" | "absence"
  subjectName: string
  score?: number
  label: string
}

interface TimelineMonth {
  date: string
  month: string
  monthKey: string
  events: TimelineEvent[]
}

interface HistoryData {
  student: {
    id: string
    overallAverage: number
    totalAssessments: number
    totalAbsences: number
    totalSubjects: number
  }
  currentYear: {
    overallAverage: number
    subjects: HistorySubject[]
    trimesterEvolution: TrimesterEvo[]
    timeline: TimelineMonth[]
  }
  academicYears: {
    id: string
    name: string
    startDate: string
    endDate: string
  }[]
}

const trimesterLabels: Record<string, string> = {
  primeiro: "1º Trimestre",
  segundo: "2º Trimestre",
  terceiro: "3º Trimestre",
}

const trimesterOrder = ["primeiro", "segundo", "terceiro"]

const assessmentTypes = ["Prova", "Teste", "Trabalho", "Tarefa", "Projeto", "Avaliação Contínua"]

function scoreColor(score: number): string {
  if (score >= 16) return "text-emerald-600 dark:text-emerald-400"
  if (score >= 13) return "text-blue-600 dark:text-blue-400"
  if (score >= 10) return "text-amber-600 dark:text-amber-400"
  return "text-rose-600 dark:text-rose-400"
}

function scoreBg(score: number): string {
  if (score >= 16) return "bg-emerald-500"
  if (score >= 13) return "bg-blue-500"
  if (score >= 10) return "bg-amber-500"
  return "bg-rose-500"
}

export default function StudentHistoryPage() {
  const { id: studentId } = useParams<{ id: string }>()
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("current")
  const [selectedTrimester, setSelectedTrimester] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/students/${studentId}/history`)
        if (!res.ok) throw new Error("Indisponível")
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        const sorted = json.currentYear?.subjects?.sort(
          (a: HistorySubject, b: HistorySubject) => b.totalAverage - a.totalAverage,
        ) || []
        setData({ ...json, currentYear: { ...json.currentYear, subjects: sorted } })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar histórico")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  const filteredSubjects = useMemo(() => {
    if (!data) return []
    return data.currentYear.subjects.filter((s) => {
      if (searchQuery && !s.subjectName.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (selectedTrimester !== "all") {
        const hasResults = s.results.some((r) => (r.trimester || "primeiro") === selectedTrimester)
        if (!hasResults) return false
      }
      if (selectedType !== "all") {
        const hasType = s.results.some((r) => r.type === selectedType)
        if (!hasType) return false
      }
      return true
    })
  }, [data, searchQuery, selectedTrimester, selectedType])

  const filteredTimeline = useMemo(() => {
    if (!data) return []
    return data.currentYear.timeline.map((m) => ({
      ...m,
      events: m.events.filter((e) => {
        if (selectedTrimester !== "all") return true
        if (selectedType !== "all" && e.type === "exam") return true
        return true
      }),
    })).filter((m) => m.events.length > 0)
  }, [data, selectedTrimester, selectedType])

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error || "Sem dados"}</span>
        </div>
      </div>
    )
  }

  const { student } = data
  const { subjects, trimesterEvolution, timeline } = data.currentYear

  const bestSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.totalAverage >= b.totalAverage ? a : b) : null
  const worstSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.totalAverage <= b.totalAverage ? a : b) : null

  return (
    <div className="w-full space-y-8 pb-16 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center border border-violet-100 dark:border-violet-900/20">
          <History size={18} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Histórico Académico</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Percurso completo do ano letivo
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <SummaryCard icon={GraduationCap} label="Média Geral" value={student.overallAverage.toFixed(1)} />
        <SummaryCard icon={Trophy} label="Melhor" value={bestSubject?.subjectName || "—"} mono={false} small />
        <SummaryCard icon={Target} label="Desafio" value={worstSubject?.subjectName || "—"} mono={false} small />
        <SummaryCard icon={FileText} label="Avaliações" value={`${student.totalAssessments}`} />
        <SummaryCard icon={Users} label="Faltas" value={`${student.totalAbsences}`} />
        <SummaryCard icon={BookOpen} label="Disciplinas" value={`${student.totalSubjects}`} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <Filter size={12} />
          Filtros
        </div>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="current">Ano Letivo Atual</option>
          {data?.academicYears?.map((y) => (
            <option key={y.id} value={y.id}>{y.name}</option>
          ))}
        </select>

        <select
          value={selectedTrimester}
          onChange={(e) => setSelectedTrimester(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="all">Todos os Trimestres</option>
          {trimesterOrder.map((t) => (
            <option key={t} value={t}>{trimesterLabels[t] || t}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        >
          <option value="all">Todos os Tipos</option>
          {assessmentTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 flex-1 min-w-[140px] max-w-[220px]">
          <Search size={12} className="text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar disciplina..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-[11px] bg-transparent border-none outline-none text-zinc-700 dark:text-zinc-300 w-full placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Trimester Evolution */}
      {trimesterEvolution.length > 1 && (
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-5">
          <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Evolução Trimestral</h3>
          <div className="flex items-end gap-3 h-24">
            {trimesterEvolution.map((t, i) => {
              const max = Math.max(...trimesterEvolution.map((x) => x.generalAverage), 20)
              const height = (t.generalAverage / max) * 100
              const prev = i > 0 ? t.generalAverage - trimesterEvolution[i - 1].generalAverage : 0
              return (
                <div key={t.trimester} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={cn("w-full max-w-[48px] rounded-lg", scoreBg(t.generalAverage))}
                    style={{ minHeight: "8px" }}
                  />
                  <span className="text-[10px] font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {t.generalAverage.toFixed(1)}
                  </span>
                  {prev !== 0 && (
                    <span className={cn(
                      "text-[9px] font-bold flex items-center gap-0.5",
                      prev > 0 ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {prev > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                      {prev > 0 ? "+" : ""}{prev.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400">{t.label.replace("Trimestre", "Trim")}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Per-subject sections */}
      <div className="space-y-3">
        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 text-sm text-zinc-400">
            Nenhuma disciplina encontrada com os filtros atuais.
          </div>
        )}
        {filteredSubjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.subjectId)
          const sortedResults = [...subject.results].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )

          const triAvgs = trimesterOrder
            .filter((t) => subject.trimesterAverages[t] !== undefined)
            .map((t) => ({ trimester: t, label: trimesterLabels[t] || t, average: subject.trimesterAverages[t]! }))

          return (
            <motion.div
              key={subject.subjectId}
              layout
              className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 overflow-hidden"
            >
              <button
                onClick={() => toggleSubject(subject.subjectId)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0",
                    subject.totalAverage >= 14
                      ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20"
                      : subject.totalAverage >= 10
                        ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/20"
                        : "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20"
                  )}>
                    <span className={cn("text-sm font-black tabular-nums", scoreColor(subject.totalAverage))}>
                      {subject.totalAverage.toFixed(0)}
                    </span>
                  </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {subject.subjectName}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-0.5">
                        <span>{subject.results.length} avaliações</span>
                        {subject.teacherName && (
                          <span className="text-zinc-500">{subject.teacherName}</span>
                        )}
                        {subject.absences > 0 && (
                          <span className="text-rose-500">{subject.absences} falta{subject.absences > 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isExpanded ? <ChevronDown size={16} className="text-zinc-400" /> : <ChevronRight size={16} className="text-zinc-400" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-5 border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
                      {/* Info row */}
                      <div className="flex flex-wrap gap-4 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {subject.teacherName && (
                          <div className="flex items-center gap-1.5">
                            <Users size={12} className="shrink-0" />
                            <span>Professor: <strong className="text-zinc-700 dark:text-zinc-300">{subject.teacherName}</strong></span>
                          </div>
                        )}
                        {subject.totalLessons > 0 && (
                          <div className="text-zinc-400">
                            <span>{subject.absences} falta{subject.absences !== 1 ? "s" : ""} em {subject.totalLessons} aula{subject.totalLessons !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>

                      {/* Trimester averages */}
                      {triAvgs.length > 1 && (
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Evolução Trimestral</p>
                          <div className="flex flex-wrap gap-2">
                            {triAvgs.map((t, i) => {
                              const prev = i > 0 ? t.average - triAvgs[i - 1].average : 0
                              return (
                                <div key={t.trimester} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
                                  <span className="text-[10px] font-medium text-zinc-400">{t.label}</span>
                                  <span className={cn("text-xs font-bold tabular-nums", scoreColor(t.average))}>
                                    {t.average.toFixed(1)}
                                  </span>
                                  {prev !== 0 && (
                                    <span className={cn("text-[9px] font-bold flex items-center gap-0.5", prev > 0 ? "text-emerald-500" : "text-rose-500")}>
                                      {prev > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                                      {prev > 0 ? "+" : ""}{prev.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Results list */}
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                          Avaliações
                        </p>
                        {sortedResults.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between py-2 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                r.score >= 16 ? "bg-emerald-500" : r.score >= 13 ? "bg-blue-500" : r.score >= 10 ? "bg-amber-500" : "bg-rose-500"
                              )} />
                              <div className="min-w-0">
                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{r.type}</span>
                                <span className="text-[10px] text-zinc-400 ml-2">
                                  {new Date(r.date).toLocaleDateString("pt-PT")}
                                </span>
                                {r.weight != null && r.weight !== 1 && (
                                  <span className="text-[9px] text-zinc-400 ml-2 border border-zinc-200 dark:border-zinc-700 px-1 py-0.5 rounded">
                                    peso: {Math.round(r.weight * 100)}%
                                  </span>
                                )}
                                {r.observations && (
                                  <p className="text-[9px] text-zinc-400 italic mt-0.5 leading-relaxed max-w-[320px] truncate">
                                    {r.observations}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={cn("text-xs font-bold tabular-nums", scoreColor(r.score))}>
                                {r.score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Absence dates */}
                      {subject.absenceDates.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2">
                            Faltas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {subject.absenceDates.map((d, i) => (
                              <span key={i} className="text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md border border-rose-100 dark:border-rose-900/20">
                                {new Date(d).toLocaleDateString("pt-PT")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800/60 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={14} className="text-zinc-400" />
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              Timeline Académica
            </h3>
          </div>
          <div className="space-y-6">
            {filteredTimeline.slice(0, 12).map((month) => (
              <div key={month.monthKey}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays size={12} className="text-zinc-400" />
                  <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {month.month}
                  </span>
                  <span className="text-[9px] text-zinc-300 dark:text-zinc-600">{month.monthKey}</span>
                </div>
                <div className="space-y-1.5 ml-5 border-l-2 border-zinc-100 dark:border-zinc-800 pl-4">
                  {month.events.slice(0, 6).map((event, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        event.type === "absence" ? "bg-rose-400" : event.score && event.score >= 14 ? "bg-emerald-400" : event.score && event.score >= 10 ? "bg-amber-400" : "bg-rose-400"
                      )} />
                      <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                        {event.subjectName}
                      </span>
                      <span className={cn(
                        "text-[11px] font-semibold tabular-nums",
                        event.type === "absence" ? "text-rose-500" : scoreColor(event.score || 0)
                      )}>
                        {event.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon, label, value, mono = true, small = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  mono?: boolean
  small?: boolean
}) {
  return (
    <div className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-zinc-400" />
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn(
        "font-black text-zinc-900 dark:text-zinc-100 truncate",
        mono && "tabular-nums",
        small ? "text-sm" : "text-xl",
      )}>
        {value}
      </p>
    </div>
  )
}
