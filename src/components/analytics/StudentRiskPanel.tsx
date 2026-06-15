"use client"

import { useEffect, useState } from "react"
import { Users, AlertTriangle, Skull, AlertCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react"
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

const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Crítico: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", icon: Skull },
  "Alto Risco": { color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", icon: AlertTriangle },
  "Médio Risco": { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", icon: AlertCircle },
  "Baixo Risco": { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: AlertCircle },
}

export default function StudentRiskPanel() {
  const [data, setData] = useState<StudentRiskData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch("/api/analytics/student-risk")
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(json => {
        if (json.error) throw new Error()
        setData(json)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-700 animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={16} className="text-rose-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alunos em Risco</h3>
        </div>
        <p className="text-xs text-zinc-400">Não foi possível carregar dados de risco.</p>
      </div>
    )
  }

  const students = data.students.filter(s => s.riskLevel === "Crítico" || s.riskLevel === "Alto Risco")

  return (
    <div className="theme-card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-xl flex items-center justify-center",
            data.totalAtRisk > 0 ? "bg-rose-50 dark:bg-rose-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
          )}>
            <Users size={16} className={data.totalAtRisk > 0 ? "text-rose-500" : "text-emerald-500"} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alunos em Risco</h3>
            {data.totalAtRisk > 0 && (
              <p className="text-[10px] text-zinc-400">{data.totalAtRisk} de {data.totalStudents} ({data.riskPercentage}%)</p>
            )}
          </div>
        </div>
        {data.totalAtRisk > 0 && (
          <span className="text-lg font-bold text-rose-600 dark:text-rose-400">{data.totalAtRisk}</span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {Object.entries(data.summary).map(([level, count]) => {
          const config = LEVEL_CONFIG[level] || LEVEL_CONFIG["Baixo Risco"]
          return (
            <div key={level} className={cn("text-center p-2 rounded-xl", config.bg)}>
              <p className={cn("text-sm font-bold", config.color)}>{count}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{level}</p>
            </div>
          )
        })}
      </div>

      {students.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            <span>{students.length} aluno(s) em risco elevado ou crítico</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto">
              {students.slice(0, 15).map(s => {
                const config = LEVEL_CONFIG[s.riskLevel] || LEVEL_CONFIG["Baixo Risco"]
                return (
                  <div
                    key={s.studentId}
                    className="py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">{s.studentName}</p>
                        <p className="text-[10px] text-zinc-400">{s.className}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-md", config.bg, config.color)}>
                          {s.riskLevel}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">{s.riskScore}%</span>
                      </div>
                    </div>
                    {s.weakSubjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {s.weakSubjects.map(sub => (
                          <span
                            key={sub.subjectId}
                            className="text-[9px] px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                          >
                            {sub.subjectName} ({sub.average})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {data.totalAtRisk === 0 && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center py-2">
          Nenhum aluno em risco detectado.
        </p>
      )}
    </div>
  )
}
