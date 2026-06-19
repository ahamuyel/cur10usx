"use client"

import { useEffect, useState, useCallback } from "react"

export type TeacherDashboardData = {
  teacher: {
    id: string
    name: string
  }
  summary: {
    totalClasses: number
    totalStudents: number
    totalLessons: number
    totalExamsToGrade: number
    totalStudentsAttention: number
    totalMeetings: number
    generalAverage: number
    attendanceRate: number
    assessmentsCompleted: number
    studentsAtRisk: number
  }
  attentionStudents: {
    id: string
    name: string
    className: string
    subject: string
    priority: "crítica" | "moderada" | "informativa"
    reason: string
    dropPercent?: number
    consecutiveAbsences?: number
    averageBelow?: number
    pendingSubmissions?: number
    lastScore?: number
    trend: "down" | "up" | "stable"
  }[]
  classPerformance: {
    classId: string
    className: string
    average: number
    monthlyEvolution: number
    attendanceRate: number
    approvalRate: number
    studentCount: number
  }[]
  upcomingLessons: {
    id: string
    subject: string
    className: string
    startTime: string
    endTime: string
    room: string
    day: string
    studentCount: number
    status: "completed" | "in_progress" | "upcoming" | "cancelled"
  }[]
  assessments: {
    toGrade: number
    published: number
    scheduled: number
    correctionDeadline: string | null
    recentExams: {
      id: string
      title: string
      className: string
      date: string
      status: "pendente" | "corrigido" | "publicado" | "agendado"
    }[]
  }
  studentInsights: {
    mostImproved: {
      id: string
      name: string
      subject: string
      evolutionPercent: number
      trend: "up"
    }[]
    mostDeclined: {
      id: string
      name: string
      subject: string
      evolutionPercent: number
      trend: "down"
    }[]
  }
  recentAnnouncements: {
    id: string
    title: string
    description: string
    priority: string
    category: "escola" | "coordenação" | "sistema"
    createdAt: string
  }[]
}

export function useTeacherDashboard(teacherId: string | null) {
  const [data, setData] = useState<TeacherDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const refetch = useCallback(async () => {
    if (!teacherId) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/teachers/${teacherId}/dashboard`)
      if (!res.ok) throw new Error("Erro ao carregar dashboard")
      const json = await res.json()
      setData(json)
    } catch {
      setError("Não foi possível carregar o dashboard do professor.")
    } finally {
      setLoading(false)
    }
  }, [teacherId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { data, loading, error, refetch }
}
