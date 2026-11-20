"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Loader2, Download, BarChart3, Users, GraduationCap, Building2,
  Search, FileText,
} from "lucide-react"

const reportTypes = [
  {
    id: "student",
    label: "Boletim Individual",
    description: "Notas por disciplina, médias trimestrais e assiduidade do aluno.",
    icon: FileText,
    roles: ["school_admin", "teacher", "student", "parent"],
  },
  {
    id: "class",
    label: "Relatório de Turma",
    description: "Média geral, taxa de aprovação/reprovação, ranking académico e assiduidade.",
    icon: Users,
    roles: ["school_admin", "teacher"],
  },
  {
    id: "teacher",
    label: "Relatório de Professor",
    description: "Disciplinas leccionadas, aulas ministradas, assiduidade e desempenho das turmas.",
    icon: GraduationCap,
    roles: ["school_admin", "teacher"],
  },
  {
    id: "institutional",
    label: "Relatório Institucional",
    description: "Número de alunos, professores, distribuição por classes e estatísticas gerais.",
    icon: Building2,
    roles: ["school_admin"],
  },
]

const ReportsPage = () => {
  const { data: session } = useSession()
  const role = session?.user?.role

  const [selectedReport, setSelectedReport] = useState("student")
  const [students, setStudents] = useState<Array<{ id: string; name: string; className: string }>>([])
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([])
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const isStudent = role === "student"
  const isParent = role === "parent"

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const endpoints: Promise<Response>[] = []

        if (isStudent) {
          endpoints.push(fetch("/api/user"))
        } else {
          endpoints.push(
            fetch("/api/students?limit=500"),
            fetch("/api/classes?limit=200"),
            fetch("/api/teachers?limit=200"),
          )
        }

        const responses = await Promise.all(endpoints)

        if (isStudent) {
          if (responses[0].ok) {
            const user = await responses[0].json()
            if (user.studentId) {
              setSelectedStudent(user.studentId)
              setStudents([{ id: user.studentId, name: user.name || "", className: user.className || "" }])
            }
          }
        } else {
          if (responses[0].ok) {
            const json = await responses[0].json()
            const list = json.data || json || []
            setStudents(Array.isArray(list) ? list.map((s: { id: string; name: string; class?: { name: string } | null }) => ({
              id: s.id,
              name: s.name,
              className: s.class?.name || "",
            })) : [])
          }
          if (responses[1].ok) {
            const json = await responses[1].json()
            const list = json.data || json || []
            setClasses(Array.isArray(list) ? list.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name })) : [])
          }
          if (responses[2].ok) {
            const json = await responses[2].json()
            const list = json.data || json || []
            setTeachers(Array.isArray(list) ? list.map((t: { id: string; name: string }) => ({ id: t.id, name: t.name })) : [])
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isStudent, isParent])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let url = ""
      const filenamePrefix = "relatorio"

      switch (selectedReport) {
        case "student":
          if (!selectedStudent) return
          url = `/api/reports/student?studentId=${selectedStudent}`
          break
        case "class":
          if (!selectedClass) return
          url = `/api/reports/class?classId=${selectedClass}`
          break
        case "teacher":
          if (!selectedTeacher) return
          url = `/api/reports/teacher?teacherId=${selectedTeacher}`
          break
        case "institutional":
          url = "/api/reports/institutional"
          break
      }

      const res = await fetch(url)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Erro ao gerar relatório")
      }

      const blob = await res.blob()
      const urlBlob = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = urlBlob
      a.download = `${filenamePrefix}_${selectedReport}_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(urlBlob)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao gerar relatório")
    } finally {
      setGenerating(false)
    }
  }

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const visibleReports = reportTypes.filter((r) => r.roles.includes(role || "student"))

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Relatórios</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Relatórios académicos, de turma, professores e institucionais em PDF.
        </p>
      </div>

      <div className="space-y-4">
        {/* Report type selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tipo de Relatório</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {visibleReports.map((rt) => {
              const Icon = rt.icon
              return (
                <button
                  key={rt.id}
                  onClick={() => setSelectedReport(rt.id)}
                  className={`text-left px-3 py-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    selectedReport === rt.id
                      ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-50"
                      : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} />
                    <span className="font-semibold">{rt.label}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-6">{rt.description}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contextual selector */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={16} className="animate-spin text-zinc-400" />
          </div>
        ) : (
          <>
            {selectedReport === "student" && !isStudent && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Aluno</label>
                <div className="relative mb-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                    placeholder="Buscar aluno..."
                  />
                </div>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Seleccione um aluno</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{s.className ? ` — ${s.className}` : ""}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === "class" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Turma</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Seleccione uma turma</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedReport === "teacher" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Professor</label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg text-sm bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Seleccione um professor</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || loading || (selectedReport !== "institutional" && !selectedStudent && !selectedClass && !selectedTeacher)}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{generating ? "A gerir relatório..." : "Gerar Relatório PDF"}</span>
        </button>
      </div>
    </div>
  )
}

export default ReportsPage
