"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Calculator, CheckCircle2, XCircle, AlertTriangle, Loader2, BarChart3, LayoutGrid, List, User, GraduationCap } from "lucide-react"

type SubjectResult = {
  subjectName: string
  t1: number | null
  t2: number | null
  t3: number | null
  finalAverage: number | null
}

type Evaluation = {
  studentId: string
  studentName: string
  enrollmentId: string
  grade: number
  generalAverage: number | null
  status: "aprovada" | "reprovada" | "em_recurso"
  failedSubjectCount: number
  observation: string | null
  subjectResults: SubjectResult[]
}

type AcademicYear = {
  id: string
  name: string
  status: string
}

type ClassItem = {
  id: string
  name: string
}

type Summary = {
  total: number
  aprovados: number
  reprovados: number
  emRecurso: number
  classAverage: number | null
}

const statusBadge: Record<string, { label: string; class: string; icon: typeof CheckCircle2 }> = {
  aprovada: { label: "Aprovada", class: "text-emerald-600 dark:text-emerald-400 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: CheckCircle2 },
  reprovada: { label: "Reprovada", class: "text-rose-600 dark:text-rose-400 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: XCircle },
  em_recurso: { label: "Em Recurso", class: "text-amber-600 dark:text-amber-500 bg-zinc-100 dark:bg-zinc-900 border-transparent", icon: AlertTriangle },
}

const columns = [
  { header: "Aluno(a)", accessor: "studentName" },
  { header: "Média Geral", accessor: "generalAverage" },
  { header: "Disciplinas Reprovadas", accessor: "failedSubjectCount", className: "hidden md:table-cell" },
  { header: "Estado Final", accessor: "status" },
  { header: "Observação", accessor: "observation", className: "hidden lg:table-cell" },
]

const EvaluationPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  // Estado para alternância de visualização
  const [view, setView] = useState<"table" | "card">("table")

  // Step state
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [selectedYear, setSelectedYear] = useState("")
  const [selectedClass, setSelectedClass] = useState("")

  // Data state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  // UI state
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingEval, setLoadingEval] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [error, setError] = useState("")
  const [yearsLoaded, setYearsLoaded] = useState(false)

  const loadAcademicYears = async () => {
    if (yearsLoaded) return
    setLoadingYears(true)
    setError("")
    try {
      const res = await fetch("/api/academic-years")
      if (!res.ok) throw new Error("Erro ao carregar anos letivos")
      const json = await res.json()
      const filtered = (json.data as AcademicYear[]).filter(
        (y) => y.status === "em_encerramento" || y.status === "encerrado"
      )
      setAcademicYears(filtered)
      setYearsLoaded(true)
    } catch (e: any) {
      setError(e.message || "Erro ao carregar anos letivos")
    } finally {
      setLoadingYears(false)
    }
  }

  const loadClasses = async (yearId: string) => {
    setLoadingClasses(true)
    setError("")
    setClasses([])
    setSelectedClass("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    try {
      const url = yearId ? `/api/classes?academicYearId=${yearId}&limit=200` : "/api/classes?limit=200"
      const res = await fetch(url)
      if (!res.ok) throw new Error("Erro ao carregar turmas")
      const json = await res.json()
      setClasses(json.data as ClassItem[])
    } catch (e: any) {
      setError(e.message || "Erro ao carregar turmas")
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleCalculate = async () => {
    if (!selectedClass || !selectedYear) return
    setLoadingEval(true)
    setError("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    try {
      const res = await fetch(`/api/evaluation/class?classId=${selectedClass}&academicYearId=${selectedYear}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao calcular avaliações")
      }
      const json = await res.json()
      setEvaluations(json.evaluations ?? [])
      setSummary(json.summary ?? null)
    } catch (e: any) {
      setError(e.message || "Erro ao calcular avaliações")
    } finally {
      setLoadingEval(false)
    }
  }

  const handleFinalize = async () => {
    const res = await fetch("/api/evaluation/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId: selectedClass, academicYearId: selectedYear }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || "Erro ao finalizar avaliações")
    }
    setFinalized(true)
    setConfirmOpen(false)
  }

  const handleYearChange = (yearId: string) => {
    setSelectedYear(yearId)
    setSelectedClass("")
    setEvaluations([])
    setSummary(null)
    setFinalized(false)
    if (yearId) loadClasses(yearId)
  }

  const renderRow = (item: Evaluation) => {
    const badge = statusBadge[item.status] || { label: item.status, class: "text-zinc-600 bg-zinc-100", icon: CheckCircle2 }
    const BadgeIcon = badge.icon

    return (
      <tr key={item.enrollmentId} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">{item.studentName}</td>
        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-mono tracking-tight text-xs">
          {item.generalAverage !== null ? item.generalAverage.toFixed(1) : "—"}
        </td>
        <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight">
          {item.failedSubjectCount}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${badge.class}`}>
            <BadgeIcon size={11} />
            <span>{badge.label}</span>
          </span>
        </td>
        <td className="hidden lg:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs">
          {item.observation || "—"}
        </td>
      </tr>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Finalização de Avaliações</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Calcular e homologar resultados finais de aproveitamento por turma.</p>
        </div>

        {evaluations.length > 0 && (
          <div className="flex items-center justify-end gap-2 self-end lg:self-auto">
            {/* Seletor Dual View */}
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900">
              <button
                onClick={() => setView("table")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${view === "table" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" : "text-zinc-400 hover:text-zinc-600"}`}
                title="Visualização em Lista"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setView("card")}
                className={`w-8 h-8 flex items-center justify-center rounded-md transition-all cursor-pointer ${view === "card" ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 shadow-3xs" : "text-zinc-400 hover:text-zinc-600"}`}
                title="Visualização em Grelha"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= CONTEXT SELECTORS PANEL ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5 mb-6 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/10">
        <div className="flex-1 max-w-xs">
          <label className="block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Ano Letivo
          </label>
          <select
            value={selectedYear}
            onFocus={loadAcademicYears}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-xs px-3 focus:outline-hidden transition-colors"
          >
            <option value="">{loadingYears ? "A carregar..." : "Selecionar ano letivo"}</option>
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} ({y.status === "em_encerramento" ? "Em Encerramento" : "Encerrado"})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 max-w-xs">
          <label className="block text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
            Turma
          </label>
          <select
            value={selectedClass}
            disabled={!selectedYear || loadingClasses}
            onChange={(e) => {
              setSelectedClass(e.target.value)
              setEvaluations([])
              setSummary(null)
              setFinalized(false)
            }}
            className="w-full h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-xs px-3 focus:outline-hidden transition-colors disabled:opacity-50"
          >
            <option value="">{loadingClasses ? "A carregar..." : "Selecionar turma"}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCalculate}
          disabled={!selectedYear || !selectedClass || loadingEval}
          className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingEval ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />}
          <span>Calcular Avaliações</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <XCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {finalized && summary && (
        <div className="mb-5 flex items-start gap-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3.5 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Avaliações finalizadas e homologadas com sucesso!</p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono tracking-tight">
              Total: {summary.total} | Aprovados: {summary.aprovados} | Reprovados: {summary.reprovados} | Em Recurso: {summary.emRecurso} | Média Geral: {summary.classAverage !== null ? summary.classAverage.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* ================= METRICS GRID SUMMARY ================= */}
      {summary && !loadingEval && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Inscritos</p>
            <p className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Aprovados</p>
            <p className="text-xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">{summary.aprovados}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Reprovados</p>
            <p className="text-xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 mt-1">{summary.reprovados}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <p className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider">Em Recurso</p>
            <p className="text-xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 mt-1">{summary.emRecurso}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-4">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <BarChart3 size={11} /> Média Turma
            </p>
            <p className="text-xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-50 mt-1">
              {summary.classAverage !== null ? summary.classAverage.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      )}

      {/* ================= EVALUATIONS RESULTS RENDERING ================= */}
      {loadingEval ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
        </div>
      ) : evaluations.length === 0 ? (
        summary === null && !error && (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
            Selecione o ano letivo correspondente e a turma para processar e visualizar as avaliações.
          </div>
        )
      ) : view === "table" ? (
        /* TABLE INTERFACE */
        <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <Table columns={columns} renderRow={renderRow} data={evaluations} />
        </div>
      ) : (
        /* CARD INTERFACE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((item) => {
            const badge = statusBadge[item.status] || { label: item.status, class: "text-zinc-600 bg-zinc-100", icon: CheckCircle2 }
            const BadgeIcon = badge.icon

            return (
              <div
                key={item.enrollmentId}
                className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User size={13} className="text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1 leading-snug">
                      {item.studentName}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${badge.class} shrink-0`}>
                    <BadgeIcon size={10} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs font-mono tracking-tight text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    Média Geral: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.generalAverage !== null ? item.generalAverage.toFixed(1) : "—"}</span>
                  </div>
                  <div className="border-l border-zinc-200 dark:border-zinc-800 h-3" />
                  <div>
                    Deficiências: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.failedSubjectCount}</span>
                  </div>
                </div>

                {item.observation && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-3 italic">
                    &ldquo;{item.observation}&rdquo;
                  </p>
                )}

                <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-[11px] text-zinc-400 font-medium">
                  <GraduationCap size={13} className="text-zinc-400" />
                  <span className="truncate">Processamento de Fim de Ciclo</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ================= ACTION BAR RENDER (FINALIZE) ================= */}
      {evaluations.length > 0 && !finalized && isAdmin && (
        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
          <button
            onClick={() => setConfirmOpen(true)}
            className="h-9 flex items-center justify-center gap-1.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-3xs transition-colors cursor-pointer shrink-0"
          >
            <CheckCircle2 size={14} />
            <span>Finalizar Avaliações</span>
          </button>
        </div>
      )}

      {/* ================= DIALOG MODAL SYSTEM ================= */}
      <ConfirmActionModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleFinalize}
        title="Finalizar Avaliações"
        message={`Tem a certeza que deseja finalizar as avaliações desta turma? Esta ação irá gravar em definitivo os resultados de ${summary?.total ?? 0} alunos. Esta ação não poderá ser desfeita.`}
        confirmLabel="Finalizar e Fechar Pauta"
        confirmColor="red"
      />
    </div>
  )
}

export default EvaluationPage