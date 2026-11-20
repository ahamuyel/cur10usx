"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Loader2, AlertCircle, History, ChevronDown, ChevronRight,
  TrendingUp, TrendingDown, GraduationCap, Trophy, Target,
  FileText, CalendarDays, Clock, Award, Minus,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import {
  MetricCardGrid, MetricCard, SectionCard, SummaryBadge,
} from "@/components/dashboard/shared"

interface HistoryResult { id: string; score: number; type: string; date: string; trimester: string | null; weight: number | null; observations: string | null }
interface HistorySubject { subjectId: string; subjectName: string; teacherName: string | null; totalLessons: number; totalAverage: number; trimesterAverages: Record<string, number>; results: HistoryResult[]; absences: number; absenceDates: string[] }
interface TrimesterEvo { trimester: string; label: string; generalAverage: number }
interface TimelineMonth { date: string; month: string; monthKey: string; events: { type: "exam" | "absence"; subjectName: string; score?: number; label: string }[] }
interface AcademicYearRecord { id: string; academicYear: { id: string; name: string; startDate: string; endDate: string }; school: { id: string; name: string }; grade: number; className: string; courseName: string | null; finalAverage: number | null; status: string; failedSubjects: number | null; observation: string | null; subjectResults: any; decidedAt: string | null }
interface HistoryData { student: { id: string; overallAverage: number; totalAssessments: number; totalAbsences: number; totalSubjects: number }; academicHistory: AcademicYearRecord[]; currentYear: { overallAverage: number; subjects: HistorySubject[]; trimesterEvolution: TrimesterEvo[]; timeline: TimelineMonth[] }; academicYears: { id: string; name: string; startDate: string; endDate: string }[] }

const trimesterLabels: Record<string, string> = { primeiro: "1º Trimestre", segundo: "2º Trimestre", terceiro: "3º Trimestre" }
const trimesterOrder = ["primeiro", "segundo", "terceiro"]
const assessmentTypes = ["Prova", "Teste", "Trabalho", "Tarefa", "Projeto", "Avaliação Contínua"]

function scoreColor(s: number) { return s >= 16 ? "text-emerald-600 dark:text-emerald-400" : s >= 13 ? "text-blue-600 dark:text-blue-400" : s >= 10 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400" }
function scoreBg(s: number) { return s >= 16 ? "bg-emerald-500" : s >= 13 ? "bg-blue-500" : s >= 10 ? "bg-amber-500" : "bg-rose-500" }

export default function AcademicHistoryTab({ studentId }: { studentId: string }) {
  const [data, setData] = useState<HistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [selectedTrimester, setSelectedTrimester] = useState("all")
  const [selectedType, setSelectedType] = useState("all")

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/students/${studentId}/history`)
        if (!res.ok) throw new Error("Indisponível")
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        const sorted = json.currentYear?.subjects?.sort((a: HistorySubject, b: HistorySubject) => b.totalAverage - a.totalAverage) || []
        setData({ ...json, currentYear: { ...json.currentYear, subjects: sorted } })
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao carregar histórico")
      } finally { setLoading(false) }
    }
    load()
  }, [studentId])

  const filteredSubjects = useMemo(() => {
    if (!data) return []
    return data.currentYear.subjects.filter((s) => {
      if (selectedTrimester !== "all" && !s.results.some((r) => (r.trimester || "primeiro") === selectedTrimester)) return false
      if (selectedType !== "all" && !s.results.some((r) => r.type === selectedType)) return false
      return true
    })
  }, [data, selectedTrimester, selectedType])

  const toggleSubject = (id: string) => {
    setExpandedSubjects((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  if (loading) return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
  if (error || !data) return <div className="flex items-center justify-center min-h-[30vh] text-rose-500 gap-2"><AlertCircle size={18} /><span className="text-sm">{error || "Sem dados"}</span></div>

  const { student, academicHistory, currentYear } = data
  const { subjects, trimesterEvolution } = currentYear
  const bestSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.totalAverage >= b.totalAverage ? a : b) : null
  const worstSubject = subjects.length > 0 ? subjects.reduce((a, b) => a.totalAverage <= b.totalAverage ? a : b) : null

  return (
    <div className="space-y-6">
      {/* Summary */}
      <MetricCardGrid cols={4}>
        <MetricCard icon={<GraduationCap size={18} />} label="Média Geral" value={student.overallAverage.toFixed(1)} subtitle={`${student.totalSubjects} disciplinas`} color={student.overallAverage >= 14 ? "emerald" : student.overallAverage >= 10 ? "amber" : "rose"} />
        <MetricCard icon={<Trophy size={18} />} label="Melhor" value={bestSubject?.subjectName || "—"} subtitle={bestSubject ? `${bestSubject.totalAverage.toFixed(1)} valores` : undefined} color="emerald" />
        <MetricCard icon={<Target size={18} />} label="Desafio" value={worstSubject?.subjectName || "—"} subtitle={worstSubject ? `${worstSubject.totalAverage.toFixed(1)} valores` : undefined} color={worstSubject && worstSubject.totalAverage < 10 ? "rose" : "amber"} />
        <MetricCard icon={<FileText size={18} />} label="Avaliações" value={`${student.totalAssessments}`} subtitle={`${student.totalAbsences} faltas`} color={student.totalAssessments > 0 ? "blue" : "violet"} />
      </MetricCardGrid>

      {/* Past Academic Years */}
      {academicHistory.length > 0 && (
        <SectionCard title="Histórico por Ano Letivo" icon={<History size={14} />} subtitle="Anos anteriores concluídos">
          <div className="space-y-3">
            {academicHistory.map((record) => {
              const isApproved = record.status === "aprovada" || record.status === "concluida"
              const subjectResults = (record.subjectResults as any[]) || []
              return (
                <div key={record.id} className="flex items-start justify-between p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{record.academicYear.name}</span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", isApproved ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400")}>
                        {isApproved ? "Aprovado" : record.status === "reprovada" ? "Reprovado" : record.status === "em_recurso" ? "Recurso" : record.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-[10px] text-zinc-400">
                      <span>{record.className} · {record.grade}º ano</span>
                      {record.courseName && <span>{record.courseName}</span>}
                      {record.failedSubjects != null && <span className="text-rose-500">{record.failedSubjects} disciplina{record.failedSubjects > 1 ? "s" : ""} abaixo</span>}
                    </div>
                    {subjectResults.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {subjectResults.slice(0, 8).map((sr: any, i: number) => (
                          <span key={i} className={cn("text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded", (sr.final || 0) >= 14 ? "bg-emerald-50 text-emerald-600" : (sr.final || 0) >= 10 ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600")}>
                            {sr.subjectName?.slice(0, 12)}: {(sr.final || 0).toFixed(1)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className={cn("text-xl font-black tabular-nums", record.finalAverage != null ? scoreColor(record.finalAverage) : "text-zinc-400")}>
                      {record.finalAverage?.toFixed(1) || "—"}
                    </div>
                    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Média</div>
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Trimester Evolution */}
      {trimesterEvolution.length > 1 && (
        <SectionCard title="Evolução Trimestral" icon={<TrendingUp size={14} />} subtitle="Média geral por período">
          <div className="flex items-end gap-3 h-24 mt-2">
            {trimesterEvolution.map((t, i) => {
              const max = Math.max(...trimesterEvolution.map((x) => x.generalAverage), 20)
              const height = (t.generalAverage / max) * 100
              const prev = i > 0 ? t.generalAverage - trimesterEvolution[i - 1].generalAverage : 0
              return (
                <div key={t.trimester} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(height, 4)}%` }} transition={{ duration: 0.6, delay: i * 0.1 }}
                    className={cn("w-full max-w-[48px] rounded-lg", scoreBg(t.generalAverage))} style={{ minHeight: "8px" }} />
                  <span className="text-[10px] font-bold tabular-nums text-zinc-800 dark:text-zinc-200">{t.generalAverage.toFixed(1)}</span>
                  {prev !== 0 && (
                    <span className={cn("text-[9px] font-bold flex items-center gap-0.5", prev > 0 ? "text-emerald-500" : "text-rose-500")}>
                      {prev > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}{prev > 0 ? "+" : ""}{prev.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-400">{t.label.replace("Trimestre", "Trim")}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Filtrar:</span>
        <select value={selectedTrimester} onChange={(e) => setSelectedTrimester(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
          <option value="all">Todos Trimestres</option>
          {trimesterOrder.map((t) => (<option key={t} value={t}>{trimesterLabels[t] || t}</option>))}
        </select>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
          className="text-[11px] font-medium bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30">
          <option value="all">Todos Tipos</option>
          {assessmentTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
      </div>

      {/* Per-subject */}
      <div className="space-y-2">
        {filteredSubjects.length === 0 && <p className="text-center py-8 text-xs text-zinc-400">Nenhuma disciplina encontrada.</p>}
        {filteredSubjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.subjectId)
          const sortedResults = [...subject.results].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          const triAvgs = trimesterOrder.filter((t) => subject.trimesterAverages[t] !== undefined).map((t) => ({ trimester: t, label: trimesterLabels[t] || t, average: subject.trimesterAverages[t]! }))

          return (
            <motion.div key={subject.subjectId} layout className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 overflow-hidden">
              <button onClick={() => toggleSubject(subject.subjectId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border shrink-0", subject.totalAverage >= 14 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/20" : subject.totalAverage >= 10 ? "bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-900/20" : "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-900/20")}>
                    <span className={cn("text-xs font-black tabular-nums", scoreColor(subject.totalAverage))}>{subject.totalAverage.toFixed(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{subject.subjectName}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-0.5">
                      <span>{subject.results.length} avaliações</span>
                      {subject.teacherName && <span>{subject.teacherName}</span>}
                      {subject.absences > 0 && <span className="text-rose-500">{subject.absences} falta{subject.absences > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronDown size={16} className="text-zinc-400 shrink-0" /> : <ChevronRight size={16} className="text-zinc-400 shrink-0" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-4 border-t border-zinc-100 dark:border-zinc-800/40 pt-3">
                      {triAvgs.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                          {triAvgs.map((t, i) => {
                            const prev = i > 0 ? t.average - triAvgs[i - 1].average : 0
                            return (
                              <div key={t.trimester} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800/40">
                                <span className="text-[10px] font-medium text-zinc-400">{t.label}</span>
                                <span className={cn("text-xs font-bold tabular-nums", scoreColor(t.average))}>{t.average.toFixed(1)}</span>
                                {prev !== 0 && <span className={cn("text-[9px] font-bold flex items-center gap-0.5", prev > 0 ? "text-emerald-500" : "text-rose-500")}>{prev > 0 ? <TrendingUp size={8} /> : <TrendingDown size={8} />}{prev > 0 ? "+" : ""}{prev.toFixed(1)}</span>}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      <div className="space-y-1">
                        {sortedResults.map((r) => (
                          <div key={r.id} className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/10 border border-zinc-100/50 dark:border-zinc-800/30">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.score >= 16 ? "bg-emerald-500" : r.score >= 13 ? "bg-blue-500" : r.score >= 10 ? "bg-amber-500" : "bg-rose-500")} />
                              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{r.type}</span>
                              <span className="text-[10px] text-zinc-400">{new Date(r.date).toLocaleDateString("pt-PT")}</span>
                              {r.weight != null && r.weight !== 1 && <span className="text-[9px] text-zinc-400 border border-zinc-200 dark:border-zinc-700 px-1 py-0.5 rounded">peso: {Math.round(r.weight * 100)}%</span>}
                            </div>
                            <span className={cn("text-xs font-bold tabular-nums", scoreColor(r.score))}>{r.score.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>

                      {subject.absenceDates.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {subject.absenceDates.map((d, i) => (
                            <span key={i} className="text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/20">
                              {new Date(d).toLocaleDateString("pt-PT")}
                            </span>
                          ))}
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
    </div>
  )
}
