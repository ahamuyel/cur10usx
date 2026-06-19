"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import Table from "@/components/ui/Table"
import FormModal from "@/components/ui/FormModal"
import ConfirmActionModal from "@/components/ui/ConfirmActionModal"
import { Scale, CheckCircle2, XCircle, Loader2, Plus, Trash2, LayoutGrid, List, User, GraduationCap } from "lucide-react"

type AcademicYear = {
  id: string
  name: string
  status: string
}

type RecursoEnrollment = {
  id: string
  studentId: string
  classId: string
  academicYearId: string
  status: "em_recurso"
  finalAverage: number | null
  failedSubjects: number | null
  observation: string | null
  student: { id: string; name: string }
  class: { id: string; name: string; grade: number }
}

type Subject = {
  id: string
  name: string
}

type SubjectScore = {
  subjectId: string
  score: number | ""
}

const columns = [
  { header: "Aluno(a)", accessor: "student" },
  { header: "Turma", accessor: "class" },
  { header: "Classe", accessor: "grade" },
  { header: "Média Final", accessor: "finalAverage" },
  { header: "Disciplinas em Falta", accessor: "failedSubjects", className: "hidden md:table-cell" },
  { header: "Observação", accessor: "observation", className: "hidden lg:table-cell" },
  { header: "Ações", accessor: "actions" },
]

const RecursoListPage = () => {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "school_admin"

  // Estado para alternância de visualização
  const [view, setView] = useState<"table" | "card">("table")

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [selectedYearId, setSelectedYearId] = useState("")
  const [enrollments, setEnrollments] = useState<RecursoEnrollment[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingYears, setLoadingYears] = useState(true)
  const [successMsg, setSuccessMsg] = useState("")

  // Modal states
  const [resolveItem, setResolveItem] = useState<RecursoEnrollment | null>(null)
  const [quickApprove, setQuickApprove] = useState<RecursoEnrollment | null>(null)
  const [quickReject, setQuickReject] = useState<RecursoEnrollment | null>(null)

  // Form states
  const [decision, setDecision] = useState<"aprovada" | "reprovada">("aprovada")
  const [subjectScores, setSubjectScores] = useState<SubjectScore[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await fetch("/api/academic-years")
        if (res.ok) {
          const json = await res.json()
          setAcademicYears(json.data || [])
        }
      } finally {
        setLoadingYears(false)
      }
    }
    fetchYears()
  }, [])

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/subjects?limit=200")
        if (res.ok) {
          const json = await res.json()
          setSubjects(json.data || [])
        }
      } catch {
        /* ignore */
      }
    }
    fetchSubjects()
  }, [])

  // Fetch recurso enrollments
  const fetchEnrollments = useCallback(async () => {
    if (!selectedYearId) {
      setEnrollments([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`)
      if (res.ok) {
        const json = await res.json()
        setEnrollments(json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }, [selectedYearId])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  // Clear success message after 4 seconds
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4000)
      return () => clearTimeout(t)
    }
  }, [successMsg])

  const handleResolve = async () => {
    if (!resolveItem || !selectedYearId) return
    setSubmitting(true)
    try {
      const scores = subjectScores
        .filter((s) => s.subjectId && s.score !== "")
        .map((s) => ({ subjectId: s.subjectId, score: Number(s.score) }))

      const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: resolveItem.id,
          decision,
          ...(scores.length > 0 ? { subjectScores: scores } : {}),
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSuccessMsg(json.message || "Recurso resolvido com sucesso.")
        setResolveItem(null)
        setDecision("aprovada")
        setSubjectScores([])
        fetchEnrollments()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuickAction = async (enrollment: RecursoEnrollment, actionDecision: "aprovada" | "reprovada") => {
    const res = await fetch(`/api/academic-years/${selectedYearId}/recurso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enrollmentId: enrollment.id,
        decision: actionDecision,
      }),
    })
    if (res.ok) {
      const json = await res.json()
      setSuccessMsg(json.message || "Recurso resolvido com sucesso.")
      setQuickApprove(null)
      setQuickReject(null)
      fetchEnrollments()
    }
  }

  const addScoreRow = () => {
    setSubjectScores((prev) => [...prev, { subjectId: "", score: "" }])
  }

  const removeScoreRow = (index: number) => {
    setSubjectScores((prev) => prev.filter((_, i) => i !== index))
  }

  const updateScoreRow = (index: number, field: "subjectId" | "score", value: string) => {
    setSubjectScores((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: field === "score" ? (value === "" ? "" : Number(value)) : value }
          : row
      )
    )
  }

  // Row Renderer para Tabela
  const renderRow = (item: RecursoEnrollment) => (
    <tr key={item.id} className="border-b border-zinc-200 dark:border-zinc-800/50 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-50">{item.student?.name}</td>
      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">{item.class?.name}</td>
      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs font-mono tracking-tight">{item.class?.grade}ª Classe</td>
      <td className="py-3 px-4">
        <span className="font-bold font-mono tracking-tight text-sm text-amber-600 dark:text-amber-500">
          {item.finalAverage != null ? item.finalAverage.toFixed(1) : "—"}
        </span>
      </td>
      <td className="hidden md:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs font-mono tracking-tight">
        {item.failedSubjects != null ? item.failedSubjects : "—"}
      </td>
      <td className="hidden lg:table-cell py-3 px-4 text-zinc-500 dark:text-zinc-400 text-xs max-w-[200px] truncate italic">
        {item.observation || "—"}
      </td>
      <td className="py-3 px-4 text-right">
        {isAdmin && (
          <div className="flex items-center gap-1 justify-end">
            <button
              onClick={() => {
                setResolveItem(item)
                setDecision("aprovada")
                setSubjectScores([])
              }}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="Resolver Recurso"
            >
              <Scale size={12} />
            </button>
            <button
              onClick={() => setQuickApprove(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
              title="Aprovação Direta"
            >
              <CheckCircle2 size={12} />
            </button>
            <button
              onClick={() => setQuickReject(item)}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Reprovação Direta"
            >
              <XCircle size={12} />
            </button>
          </div>
        )}
      </td>
    </tr>
  )

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      
      {/* ================= HEADER DO CONTROLADOR ================= */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between mb-6">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Scale size={18} className="text-zinc-400 dark:text-zinc-500" />
            Recursos Académicos
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Análise de pautas, lançamento de exames especiais e deliberação final.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {loadingYears ? (
            <div className="flex items-center justify-center w-48 h-9"><Loader2 size={14} className="animate-spin text-zinc-400" /></div>
          ) : (
            <select
              value={selectedYearId}
              onChange={(e) => setSelectedYearId(e.target.value)}
              className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-xs px-3 font-medium focus:outline-hidden transition-colors"
            >
              <option value="">Selecionar Ano Letivo</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.status === "encerrado" ? "(Encerrado)" : ay.status === "em_encerramento" ? "(Em Encerramento)" : ""}
                </option>
              ))}
            </select>
          )}

          {selectedYearId && enrollments.length > 0 && (
            /* Seletor Dual View */
            <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-50 dark:bg-zinc-900 select-none self-end sm:self-auto">
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
          )}
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Status Counter */}
      {selectedYearId && !loading && enrollments.length > 0 && (
        <div className="mb-4">
          <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded text-xs font-medium text-amber-600 dark:text-amber-500 font-mono tracking-tight">
            {enrollments.length} {enrollments.length === 1 ? "estudante listado" : "estudantes listados"} em regime de recurso
          </span>
        </div>
      )}

      {/* ================= DATA RENDER LIST CONTAINER ================= */}
      <div className="w-full">
        {!selectedYearId ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30 dark:bg-zinc-900/10">
            Selecione o ano letivo correspondente na barra superior para carregar os processos de recurso em aberto.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-zinc-400 dark:text-zinc-500" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 text-xs bg-zinc-50/40 dark:bg-zinc-900/10 rounded-lg border border-zinc-200 dark:border-zinc-800">
            Nenhum estudante sob processo de recurso registado para este ano letivo.
          </div>
        ) : view === "table" ? (
          /* TABLE CORE VIEW */
          <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Table columns={columns} renderRow={renderRow} data={enrollments} />
          </div>
        ) : (
          /* CARD CORE VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User size={13} className="text-zinc-400 shrink-0" />
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 line-clamp-1 leading-snug">
                      {item.student?.name}
                    </h3>
                  </div>
                  <span className="text-base font-bold font-mono tracking-tight text-amber-600 dark:text-amber-500 shrink-0">
                    {item.finalAverage != null ? item.finalAverage.toFixed(1) : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4 text-xs font-mono tracking-tight text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    Estrutura: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.class?.grade}ª Classe</span>
                  </div>
                  <div className="border-l border-zinc-200 dark:border-zinc-800 h-3" />
                  <div>
                    Em Falta: <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.failedSubjects ?? "—"}</span>
                  </div>
                </div>

                {item.observation && (
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-4 italic">
                    &ldquo;{item.observation}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/60 text-xs">
                  <div className="flex items-center gap-1 text-zinc-400 font-medium font-sans">
                    <GraduationCap size={13} />
                    <span className="truncate">{item.class?.name}</span>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-0.5 border-l border-zinc-200 dark:border-zinc-800 pl-2">
                      <button
                        onClick={() => {
                          setResolveItem(item)
                          setDecision("aprovada")
                          setSubjectScores([])
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                        title="Decidir Processo"
                      >
                        <Scale size={12} />
                      </button>
                      <button
                        onClick={() => setQuickApprove(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer"
                        title="Aprovar"
                      >
                        <CheckCircle2 size={12} />
                      </button>
                      <button
                        onClick={() => setQuickReject(item)}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Reprovar"
                      >
                        <XCircle size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= DIALOG FORM MODAL SYSTEM ================= */}
      <FormModal
        open={!!resolveItem}
        onClose={() => {
          setResolveItem(null)
          setSubjectScores([])
        }}
        title="Deliberar e Resolver Recurso"
      >
        {resolveItem && (
          <div className="space-y-5">
            {/* Contexto do Aluno */}
            <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
              <p className="font-semibold text-zinc-900 dark:text-zinc-50">{resolveItem.student?.name}</p>
              <p className="text-zinc-400 font-medium mt-1">
                {resolveItem.class?.name} &bull; {resolveItem.class?.grade}ª Classe &bull; Média Atual: <span className="font-mono">{resolveItem.finalAverage?.toFixed(1) || "—"}</span>
              </p>
            </div>

            {/* Fluxo de Decisões de Rádio */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                Sentença Final
              </label>
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="decision"
                    value="aprovada"
                    checked={decision === "aprovada"}
                    onChange={() => setDecision("aprovada")}
                    className="w-3.5 h-3.5 text-zinc-900 focus:ring-0 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800"
                  />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Homologar Aprovação
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="decision"
                    value="reprovada"
                    checked={decision === "reprovada"}
                    onChange={() => setDecision("reprovada")}
                    className="w-3.5 h-3.5 text-zinc-900 focus:ring-0 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800"
                  />
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <XCircle size={13} /> Decretar Reprovação
                  </span>
                </label>
              </div>
            </div>

            {/* Inserção Dinâmica de Notas Especiais */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Classificações do Exame de Recurso <span className="font-normal text-zinc-400 lowercase">(opcional)</span>
                </label>
                <button
                  type="button"
                  onClick={addScoreRow}
                  className="h-7 flex items-center gap-1 px-2.5 rounded-md text-xs font-medium bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Plus size={11} />
                  <span>Adicionar Pauta</span>
                </button>
              </div>
              
              {subjectScores.length === 0 && (
                <p className="text-xs italic text-zinc-400 dark:text-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/10 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center">Nenhuma nota suplementar anexada a esta deliberação.</p>
              )}
              
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {subjectScores.map((row, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={row.subjectId}
                      onChange={(e) => updateScoreRow(index, "subjectId", e.target.value)}
                      className="flex-1 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 text-xs px-2.5 focus:outline-hidden"
                    >
                      <option value="">Componente / Disciplina</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      step={0.1}
                      value={row.score}
                      onChange={(e) => updateScoreRow(index, "score", e.target.value)}
                      placeholder="Nota (0-20)"
                      className="w-24 h-8 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-mono text-xs px-2.5 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => removeScoreRow(index)}
                      className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel Inferior de Ações */}
            <div className="flex items-center gap-2.5 justify-end pt-3 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={() => {
                  setResolveItem(null)
                  setSubjectScores([])
                }}
                disabled={submitting}
                className="h-9 px-3.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResolve}
                disabled={submitting}
                className="h-9 flex items-center gap-1.5 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-medium text-xs shadow-3xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : decision === "aprovada" ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                <span>{submitting ? "A processar..." : "Salvar Resolução"}</span>
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Quick Approve Confirmpanel */}
      <ConfirmActionModal
        open={!!quickApprove}
        onClose={() => setQuickApprove(null)}
        onConfirm={() => handleQuickAction(quickApprove!, "aprovada")}
        title="Homologar Aprovação"
        message={`Tem a certeza que deseja validar a aprovação direta do recurso de ${quickApprove?.student?.name}? O processo civil do aluno será encerrado como aprovado.`}
        confirmLabel="Confirmar Aprovação"
        // confirmColor="zinc"
      />

      {/* Quick Reject Confirmpanel */}
      <ConfirmActionModal
        open={!!quickReject}
        onClose={() => setQuickReject(null)}
        onConfirm={() => handleQuickAction(quickReject!, "reprovada")}
        title="Decretar Reprovação"
        message={`Tem a certeza que deseja ratificar a reprovação do recurso de ${quickReject?.student?.name}? O aluno será retido na presente classe.`}
        confirmLabel="Confirmar Reprovação"
        confirmColor="red"
      />
    </div>
  )
}

export default RecursoListPage