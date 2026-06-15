"use client"

import { useEffect, useState } from "react"
import { Users, UserRound, Presentation, GraduationCap } from "lucide-react"
import StatCard from "@/components/ui/StatCard"
import CountChart from "@/components/ui/CountChart"
import AttendanceChart from "@/components/ui/AttendanceChart"

type SchoolStats = {
  students: number
  teachers: number
  parents: number
  classes: number
  maleStudents: number
  femaleStudents: number
  averageGrade: number
  pendingAssignments: number
  todayLessons: number
  pendingApplications: number
  recentAnnouncements: number
}

export default function ReferenceData() {
  const [stats, setStats] = useState<SchoolStats | null>(null)

  useEffect(() => {
    fetch("/api/school-stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
          Dados de Referência
        </h2>
        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800" />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats ? (
          <>
            <StatCard label="Alunos" value={stats.students} icon={Users} color="emerald" href="/list/students" />
            <StatCard label="Professores" value={stats.teachers} icon={UserRound} color="indigo" href="/list/teachers" />
            <StatCard label="Turmas" value={stats.classes} icon={Presentation} color="cyan" href="/list/classes" />
            <StatCard label="Média Geral" value={`${stats.averageGrade}/20`} icon={GraduationCap} color="amber" href="/list/results" />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ))
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CountChart
            maleStudents={stats?.maleStudents || 0}
            femaleStudents={stats?.femaleStudents || 0}
            loading={!stats}
          />
        </div>
        <div className="lg:col-span-8">
          <AttendanceChart />
        </div>
      </div>
    </div>
  )
}
