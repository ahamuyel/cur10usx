"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/ui/FormField"
import { createResultSchema } from "@/lib/validations/academic"
import { ArrowLeft, Loader2, CalendarRange } from "lucide-react"
import Link from "next/link"

type Option = { id: string; name: string }

const inputClass = "w-full px-3 py-2 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary transition"

const resultTypes = ["Prova", "Tarefa", "Trabalho", "Participação"]
const trimesters = [
  { value: "primeiro", label: "1.º Trimestre" },
  { value: "segundo", label: "2.º Trimestre" },
  { value: "terceiro", label: "3.º Trimestre" },
]

const ResultCreateForm = () => {
  const router = useRouter()
  const [checkingYear, setCheckingYear] = useState(true)
  const [noAcademicYear, setNoAcademicYear] = useState(false)
  const [form, setForm] = useState({
    subjectId: "",
    classId: "",
    examId: "",
    studentId: "",
    score: "",
    type: "",
    date: "",
    trimester: "",
    academicYear: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState("")

  const [subjectOptions, setSubjectOptions] = useState<Option[]>([])
  const [classOptions, setClassOptions] = useState<Option[]>([])
  const [examOptions, setExamOptions] = useState<Option[]>([])
  const [studentOptions, setStudentOptions] = useState<Option[]>([])
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [loadingExams, setLoadingExams] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)

  useEffect(() => {
    fetch("/api/academic-years/current")
      .then(r => r.json())
      .then(d => {
        if (!d.exists) setNoAcademicYear(true)
      })
      .finally(() => setCheckingYear(false))
  }, [])

  useEffect(() => {
    fetch("/api/subjects?limit=100").then(r => r.json()).then(d => setSubjectOptions(d.data || []))
  }, [])

  useEffect(() => {
    if (!form.subjectId) {
      setClassOptions([])
      return
    }
    setLoadingClasses(true)
    fetch(`/api/classes?limit=100&subjectId=${form.subjectId}`)
      .then(r => r.json())
      .then(d => setClassOptions(d.data || []))
      .finally(() => setLoadingClasses(false))
  }, [form.subjectId])

  useEffect(() => {
    if (!form.subjectId || !form.classId) {
      setExamOptions([])
      return
    }
    setLoadingExams(true)
    fetch(`/api/exams?limit=100&subjectId=${form.subjectId}&classId=${form.classId}`)
      .then(r => r.json())
      .then(d => {
        const items = d.data || []
        setExamOptions(items.map((ex: { id: string; title?: string; date?: string }) => ({
          id: ex.id,
          name: ex.title || `Prova ${ex.date?.split("T")[0] || ex.id.slice(0, 6)}`,
        })))
      })
      .finally(() => setLoadingExams(false))
  }, [form.subjectId, form.classId])

  useEffect(() => {
    if (!form.classId) {
      setStudentOptions([])
      return
    }
    setLoadingStudents(true)
    fetch(`/api/students?limit=500&classId=${form.classId}`)
      .then(r => r.json())
      .then(d => {
        const items = d.data || []
        setStudentOptions(items.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
      })
      .finally(() => setLoadingStudents(false))
  }, [form.classId])

  const handleSubjectChange = (subjectId: string) => {
    setForm(f => ({ ...f, subjectId, classId: "", examId: "", studentId: "" }))
    setExamOptions([])
    setStudentOptions([])
  }

  const handleClassChange = (classId: string) => {
    setForm(f => ({ ...f, classId, examId: "", studentId: "" }))
    setStudentOptions([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setApiError("")

    const payload = {
      studentId: form.studentId,
      subjectId: form.subjectId,
      score: parseFloat(form.score),
      type: form.type,
      date: form.date,
      examId: form.examId || null,
      trimester: form.trimester || null,
      academicYear: form.academicYear || null,
    }

    const parsed = createResultSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0] as string
        if (!fieldErrors[key]) fieldErrors[key] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setApiError(data.error || "Erro ao salvar")
        return
      }
      router.push("/list/results")
    } catch {
      setApiError("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  if (checkingYear) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-primary" />
      </div>
    )
  }

  if (noAcademicYear) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
          <CalendarRange size={28} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Nenhum ano letivo activo</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">
            Para registar resultados, é necessário ter um ano letivo configurado e definido como activo.
          </p>
        </div>
        <Link
          href="/list/academic-years"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-lg shadow-primary/20 hover:bg-primary-700 transition"
        >
          <CalendarRange size={16} />
          Configurar Ano Letivo
        </Link>
        <Link
          href="/list/results"
          className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
        >
          Voltar à listagem
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {apiError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 text-sm">{apiError}</div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          Passo 1 — Selecionar Disciplina
        </h2>
        <FormField label="Disciplina" error={errors.subjectId}>
          <select className={inputClass} value={form.subjectId} onChange={(e) => handleSubjectChange(e.target.value)}>
            <option value="">Selecionar disciplina...</option>
            {subjectOptions.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </FormField>
      </div>

      {form.subjectId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Passo 2 — Selecionar Turma
          </h2>
          <FormField label="Turma" error={errors.classId}>
            {loadingClasses ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
                <Loader2 size={16} className="animate-spin" /> A carregar turmas...
              </div>
            ) : (
              <select className={inputClass} value={form.classId} onChange={(e) => handleClassChange(e.target.value)}>
                <option value="">Selecionar turma...</option>
                {classOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>
      )}

      {form.classId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Passo 3 — Selecionar Avaliação
          </h2>
          <FormField label="Prova (opcional)" error={errors.examId}>
            {loadingExams ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
                <Loader2 size={16} className="animate-spin" /> A carregar provas...
              </div>
            ) : examOptions.length === 0 ? (
              <p className="text-sm text-zinc-400 py-2">Nenhuma prova encontrada para esta disciplina e turma.</p>
            ) : (
              <select className={inputClass} value={form.examId} onChange={(e) => setForm(f => ({ ...f, examId: e.target.value }))}>
                <option value="">Nenhuma (avaliação avulsa)</option>
                {examOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>
      )}

      {form.classId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Passo 4 — Selecionar Aluno
          </h2>
          <FormField label="Aluno" error={errors.studentId}>
            {loadingStudents ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400 py-2">
                <Loader2 size={16} className="animate-spin" /> A carregar alunos...
              </div>
            ) : (
              <select className={inputClass} value={form.studentId} onChange={(e) => setForm(f => ({ ...f, studentId: e.target.value }))}>
                <option value="">Selecionar aluno...</option>
                {studentOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            )}
          </FormField>
        </div>
      )}

      {form.studentId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
            Informação da Nota
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Nota (0-20)" error={errors.score}>
              <input className={inputClass} type="number" step="0.1" min="0" max="20" value={form.score} onChange={(e) => setForm(f => ({ ...f, score: e.target.value }))} />
            </FormField>
            <FormField label="Tipo" error={errors.type}>
              <select className={inputClass} value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="">Selecionar tipo...</option>
                {resultTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Data" error={errors.date}>
              <input className={inputClass} type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FormField label="Trimestre" error={errors.trimester}>
              <select className={inputClass} value={form.trimester} onChange={(e) => setForm(f => ({ ...f, trimester: e.target.value }))}>
                <option value="">Selecionar...</option>
                {trimesters.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Ano Lectivo" error={errors.academicYear}>
              <input className={inputClass} value={form.academicYear} onChange={(e) => setForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="2025/2026" />
            </FormField>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 justify-between pt-2">
        <Link href="/list/results" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
          <ArrowLeft size={16} /> Cancelar
        </Link>
        <button type="submit" disabled={loading || !form.studentId} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-700 transition disabled:opacity-50 shadow-lg shadow-primary/20">
          {loading ? "Salvando..." : "Criar Resultado"}
        </button>
      </div>
    </form>
  )
}

export default ResultCreateForm
