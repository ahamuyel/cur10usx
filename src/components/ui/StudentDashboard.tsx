"use client"

import { useEffect, useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"

import StudentHero from "./StudentHero"
import StudentDailyFocus from "./StudentDailyFocus"
import StudentPerformanceBreakdown from "./StudentPerformanceBreakdown"
import StudentQuickStats from "./StudentQuickStats"
import StudentPrioritySubjects from "./StudentPrioritySubjects"
import StudentAcademicAgenda from "./StudentAcademicAgenda"
import StudentAcademicJourney from "./StudentAcademicJourney"
import StudentActivityChart from "./StudentActivityChart"
import StudentInsights from "./StudentInsights"
import StudentCalendarExperience from "./StudentCalendarExperience"

export default function StudentDashboard({ studentId }: { studentId: string }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/students/${studentId}/dashboard`)
        if (!res.ok) throw new Error("Dados indisponíveis")
        const json = await res.json()
        setData(json)
      } catch {
        setError("Não foi possível carregar o ecossistema do estudante.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  if (loading) return <DashboardLoader />
  if (error || !data) return <DashboardError error={error} />

  const trend = data.generalAverage - data.previousAverage
  const statusPhrase = (() => {
    const hasIssues = data.attendanceWarning || data.subjectsNeedingAttention.length > 0
    if (hasIssues) {
      if (data.attendanceWarning && data.subjectsNeedingAttention.length > 0)
        return `Assiduidade abaixo da meta e ${data.subjectsNeedingAttention.length} disciplina${data.subjectsNeedingAttention.length > 1 ? "s" : ""} com média crítica.`
      if (data.attendanceWarning)
        return `Assiduidade abaixo do recomendado.`
      return `${data.subjectsNeedingAttention.join(", ")} ${data.subjectsNeedingAttention.length > 1 ? "precisam" : "precisa"} de atenção.`
    }
    if (trend > 0.5 && data.generalAverage >= 14) return "Excelente evolução. Mantém o ritmo."
    if (trend > 0) return "Estás a melhorar. Continua assim."
    return "Desempenho estável. Foca-te nas próximas metas."
  })()

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-16 px-1 max-w-[1600px] mx-auto">
      <section className="space-y-6">
        <StudentHero
          name={data.student.name}
          average={data.generalAverage}
          previousAverage={data.previousAverage}
          classRank={data.classRank}
          classSize={data.classSize}
          statusPhrase={statusPhrase}
          targetAverage={data.targetAverage}
        />
      </section>

      <section>
        <StudentDailyFocus
          subjectsNeedingAttention={data.subjectsNeedingAttention}
          pendingSubmissions={data.pendingSubmissions}
          upcomingExams={data.upcomingExams}
          upcomingAssignments={data.upcomingAssignments}
          attendanceWarning={data.attendanceWarning}
          attendancePercent={data.attendancePercent}
          generalAverage={data.generalAverage}
          previousAverage={data.previousAverage}
          subjectAverages={data.subjectAverages}
          targetAverage={data.targetAverage}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <StudentPerformanceBreakdown
            subjectAverages={data.subjectAverages}
            subjectLastScores={data.subjectLastScores}
            generalAverage={data.generalAverage}
            previousAverage={data.previousAverage}
          />
        </div>
        <div className="lg:col-span-4">
          <StudentQuickStats
            generalAverage={data.generalAverage}
            previousAverage={data.previousAverage}
            classRank={data.classRank}
            classSize={data.classSize}
            attendancePercent={data.attendancePercent}
            targetAverage={data.targetAverage}
          />
        </div>
      </section>

      <section>
        <StudentPrioritySubjects
          subjectAverages={data.subjectAverages}
          subjectLastScores={data.subjectLastScores}
          targetAverage={data.targetAverage}
        />
      </section>

      <section>
        <StudentAcademicAgenda exams={data.upcomingExams} assignments={data.upcomingAssignments} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <StudentAcademicJourney trimesters={data.trimesterEvolution} />
        </div>
        <div className="lg:col-span-6">
          <StudentActivityChart results={data.recentResults} />
        </div>
      </section>

      <section>
        <StudentInsights
          scoreDistribution={data.scoreDistribution}
          totalResults={data.totalResults}
          subjectAverages={data.subjectAverages}
        />
      </section>

      <section>
        <StudentCalendarExperience />
      </section>
    </div>
  )
}

function DashboardLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">A carregar ecossistema...</span>
    </div>
  )
}

function DashboardError({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-950/20 px-6 py-4 rounded-2xl border border-rose-200 dark:border-rose-900/50">
        <AlertCircle className="text-rose-500" size={18} />
        <span className="text-sm font-medium text-rose-700 dark:text-rose-400">{error}</span>
      </div>
    </div>
  )
}