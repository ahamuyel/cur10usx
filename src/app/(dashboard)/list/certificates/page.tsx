"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Loader2, ScrollText, Download, FileText, Search, GraduationCap,
} from "lucide-react"

const documentTypes = [
  { value: "declaracao_frequencia", label: "Declaração de Frequência" },
  { value: "declaracao_matricula", label: "Declaração de Matrícula" },
  { value: "certificado_aproveitamento", label: "Certificado de Aproveitamento" },
  { value: "certificado_merito", label: "Certificado de Mérito" },
  { value: "historico_escolar", label: "Histórico Escolar" },
  { value: "certificado_conclusao", label: "Certificado de Conclusão" },
]

const CertificatesPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role

  const [students, setStudents] = useState<Array<{ id: string; name: string; className: string }>>([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("declaracao_frequencia")
  const [generating, setGenerating] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const isStudent = role === "student"
  const isParent = role === "parent"

  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true)
      try {
        let endpoint = "/api/students"
        if (isStudent) {
          const res = await fetch("/api/user")
          if (res.ok) {
            const user = await res.json()
            if (user.studentId) {
              setSelectedStudent(user.studentId)
              setStudents([{ id: user.studentId, name: user.name || "", className: user.className || "" }])
            }
          }
        } else if (isParent) {
          endpoint = "/api/students?myChildren=true"
        }

        const res = await fetch(endpoint)
        if (res.ok) {
          const json = await res.json()
          const list = json.data || json || []
          setStudents(Array.isArray(list) ? list.map((s: { id: string; name: string; class?: { name: string } | null }) => ({
            id: s.id,
            name: s.name,
            className: s.class?.name || "",
          })) : [])
        }
      } catch {
        // ignore
      } finally {
        setLoadingStudents(false)
      }
    }
    loadStudents()
  }, [isStudent, isParent])

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleGenerate = async () => {
    if (!selectedStudent) return
    setGenerating(true)
    try {
      const res = await fetch(
        `/api/certificates/generate?studentId=${selectedStudent}&type=${selectedDocType}`
      )
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Erro ao gerar documento")
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url

      const student = students.find((s) => s.id === selectedStudent)
      const docType = documentTypes.find((d) => d.value === selectedDocType)
      a.download = `${docType?.label || "Documento"}_${student?.name?.replace(/\s+/g, "_") || "aluno"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao gerar documento")
    } finally {
      setGenerating(false)
    }
  }

  if (isStudent && students.length === 0 && loadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 shadow-xs">
      <div className="mb-6">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Certificados e Declarações</h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Gerar documentos oficiais com validação electrónica.
        </p>
      </div>

      <div className="space-y-4">
        {/* Student selector */}
        {!isStudent && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Aluno</label>
            {loadingStudents ? (
              <div className="h-9 flex items-center">
                <Loader2 size={14} className="animate-spin text-zinc-400" />
              </div>
            ) : (
              <>
                <div className="relative mb-2">
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
                    <option key={s.id} value={s.id}>
                      {s.name}{s.className ? ` — ${s.className}` : ""}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {/* Document type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Tipo de Documento</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {documentTypes.map((dt) => (
              <button
                key={dt.value}
                onClick={() => setSelectedDocType(dt.value)}
                className={`text-left px-3 py-2.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  selectedDocType === dt.value
                    ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-50"
                    : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  {dt.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating || !selectedStudent}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-white dark:text-zinc-950 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 transition-colors disabled:opacity-40 cursor-pointer mt-4"
        >
          {generating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{generating ? "A gerir documento..." : "Gerar Documento"}</span>
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
          Documentos com Validação Electrónica
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Todos os documentos gerados incluem código único de verificação, QR Code,
          assinaturas institucionais e carimbo digital. A autenticidade pode ser
          confirmada em qualquer dispositivo através da página pública de verificação.
        </p>
      </div>
    </div>
  )
}

export default CertificatesPage
