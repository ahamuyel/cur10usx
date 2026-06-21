export interface SubjectAverage {
  subjectId: string
  subjectName: string
  average: number
  count: number
}

export interface SubjectLastScore {
  score: number
  type: string
  date: string
}

export interface SubjectTrend {
  currentAverage: number
  previousAverage: number
  trend: number
}

export interface AbsencesBySubject {
  subjectName: string
  count: number
}

export interface ScoreDistribution {
  excelente: number
  bom: number
  suficiente: number
  insuficiente: number
}

export interface AttendanceByMonth {
  month: string
  presente: number
  ausente: number
  atrasado: number
}

export interface TrimesterEvolution {
  trimester: string
  label: string
  subjects: Record<string, number>
  generalAverage: number
}

export interface DashboardData {
  student: {
    id: string
    name: string
    class: { id: string; name: string; grade: number } | null
    targetAverage: number | null
  }
  targetAverage: number | null
  generalAverage: number
  previousAverage: number
  classRank: number | null
  classSize: number | null
  attendanceWarning: boolean
  totalAbsences: number
  absencesBySubject: AbsencesBySubject[]
  subjectWithMostAbsences: string | null
  totalResults: number
  pendingSubmissions: number
  subjectAverages: SubjectAverage[]
  subjectsNeedingAttention: string[]
  subjectLastScores: Record<string, SubjectLastScore>
  subjectTrends: Record<string, SubjectTrend>
  scoreDistribution: ScoreDistribution
  attendance: { total: number; presente: number; ausente: number; atrasado: number }
  attendanceByMonth: AttendanceByMonth[]
  trimesterEvolution: TrimesterEvolution[]
  recentResults: {
    id: string
    subjectName: string
    score: number
    type: string
    date: string
    trimester: string | null
  }[]
  upcomingExams: { id: string; title: string; subjectName: string; date: string }[]
  upcomingAssignments: { id: string; title: string; subjectName: string; dueDate: string }[]
}
