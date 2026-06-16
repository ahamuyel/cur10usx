"use client"

import { useEffect, useState } from "react"
import { Users, AlertCircle, CheckCircle2, ChevronRight, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubjectWeakness {
  subjectId: string
  subjectName: string
  average: number
}

interface StudentRisk {
  studentId: string
  studentName: string
  classId: string
  className: string
  riskScore: number
  riskLevel: string
  breakdown: {
    academicPerformance: number
    attendance: number
    submissions: number
  }
  weakSubjects: SubjectWeakness[]
}

interface StudentRiskData {
  totalAtRisk: number
  totalStudents: number
  riskPercentage: number
  students: StudentRisk[]
  summary: Record<string, number>
}

const LEVEL_STYLE: Record<string, { color: string; bg: string; dot: string }> = {
  Crítico: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30", dot: "bg-rose-500" },
  "Alto Risco": { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50/60 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30", dot: "bg-orange-500" },
  "Médio Risco": { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30", dot: "bg-amber-500" },
  "Baixo Risco": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30", dot: "bg-emerald-500" },
}

export default function StudentRiskPanel() {
  const [data, setData] = useState<StudentRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Estado de expansão

  useEffect(() => {
    fetch("/api/analytics/student-risk")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setData(json)
        requestAnimationFrame(() => setVisible(true))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-11 rounded-xl bg-zinc-50/60 dark:bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Alunos em Risco</h3>
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Não foi possível carregar os dados.</p>
      </div>
    )
  }

  const filteredStudents = data.students.filter(s => s.riskLevel === "Crítico" || s.riskLevel === "Alto Risco")
  const displayStudents = isExpanded ? filteredStudents.slice(0, 10) : filteredStudents.slice(0, 3)

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs p-5 space-y-4 flex flex-col justify-between h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center border shrink-0",
              data.totalAtRisk > 0 ? "bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900/20" : "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/20"
            )}>
              <Users size={15} className={data.totalAtRisk > 0 ? "text-rose-500" : "text-emerald-500"} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 tracking-tight truncate">Alunos sob Observação</h3>
              {data.totalAtRisk > 0 && (
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tabular-nums">{data.totalAtRisk} de {data.totalStudents} alunos</p>
              )}
            </div>
          </div>
          {data.totalAtRisk > 0 && (
            <span className="inline-flex items-center justify-center bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-md text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 tabular-nums whitespace-nowrap">
              {data.riskPercentage}%
            </span>
          )}
        </div>

        {/* Content */}
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-100 dark:border-zinc-800/60 rounded-2xl bg-zinc-50/30 dark:bg-zinc-950/10">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2 text-emerald-500">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Nenhum aluno em risco</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {displayStudents.map((s, i) => {
              const style = LEVEL_STYLE[s.riskLevel] || LEVEL_STYLE["Baixo Risco"]
              return (
                <div
                  key={s.studentId}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-all duration-300 group cursor-pointer bg-zinc-50/50 dark:bg-zinc-950/20 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40 border border-zinc-100/50 dark:border-zinc-800/20"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(6px)",
                    transitionDelay: `${i * 30}ms`,
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.dot)} />
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-50">{s.studentName}</span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium truncate hidden sm:inline">· {s.className}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border tracking-wide whitespace-nowrap", style.bg, style.color)}>
                      {s.riskLevel}
                    </span>
                    <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 transition-colors hidden sm:block" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {filteredStudents.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>Ver menos <ChevronUp size={14} /></>
          ) : (
            <>Ver mais ({filteredStudents.length - 3}) <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}