import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id } = await params

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        teacherClasses: {
          include: {
            class: {
              include: {
                _count: { select: { students: true } },
              },
            },
          },
        },
        teacherSubjects: {
          include: { subject: true },
        },
      },
    })

    if (!teacher || teacher.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: "Professor não encontrado" }, { status: 404 })
    }

    const classIds = teacher.teacherClasses.map((tc) => tc.classId)
    const subjectIds = teacher.teacherSubjects.map((ts) => ts.subjectId)

    const today = new Date()
    const daysMap: Record<number, string> = {
      1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo",
    }
    const currentDay = daysMap[today.getDay()]

    const [lessons, exams, assignments, students, attendances, results, announcements, lessonRecords] =
      await Promise.all([
        prisma.lesson.findMany({
          where: {
            teacherId: id,
            schoolId: teacher.schoolId,
          },
          include: {
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true, _count: { select: { students: true } } } },
          },
          orderBy: [{ day: "asc" }, { startTime: "asc" }],
        }),

        prisma.exam.findMany({
          where: {
            teacherId: id,
            schoolId: teacher.schoolId,
          },
          include: {
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
          orderBy: { date: "desc" },
          take: 50,
        }),

        prisma.assignment.findMany({
          where: {
            teacherId: id,
            schoolId: teacher.schoolId,
          },
          include: {
            subject: { select: { id: true, name: true } },
            class: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: "desc" },
          take: 50,
        }),

        prisma.student.findMany({
          where: {
            classId: { in: classIds },
            schoolId: teacher.schoolId,
          },
          select: {
            id: true,
            name: true,
            classId: true,
            class: { select: { name: true } },
          },
        }),

        prisma.attendance.findMany({
          where: {
            classId: { in: classIds },
            schoolId: teacher.schoolId,
            date: { gte: new Date(today.getTime() - 30 * 86400000) },
          },
          select: {
            id: true,
            studentId: true,
            date: true,
            status: true,
            classId: true,
            justificationId: true,
          },
        }),

        prisma.result.findMany({
          where: {
            subjectId: { in: subjectIds },
            schoolId: teacher.schoolId,
            student: { classId: { in: classIds } },
          },
          include: {
            student: { select: { id: true, name: true, class: { select: { name: true } } } },
            subject: { select: { id: true, name: true } },
            exam: { select: { id: true, title: true } },
            assignment: { select: { id: true, title: true } },
          },
          orderBy: { date: "desc" },
          take: 200,
        }),

        prisma.announcement.findMany({
          where: {
            schoolId: teacher.schoolId,
            OR: [
              { classId: { in: classIds } },
              { classId: null, courseId: null },
            ],
          },
          include: {
            author: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),

        prisma.lessonRecord.findMany({
          where: {
            lesson: {
              teacherId: id,
              schoolId: teacher.schoolId,
            },
          },
          select: {
            id: true,
            date: true,
            status: true,
            recordedAt: true,
            validatedAt: true,
          },
          orderBy: { date: "desc" },
        }),
      ])

    const studentIds = students.map((s) => s.id)
    const studentClassMap = new Map(students.map((s) => [s.id, s.class?.name || ""]))

    // Attention students - those with declining performance, absences, low scores
    const attentionStudents = buildAttentionStudents(
      results,
      attendances,
      assignments,
      studentIds,
      studentClassMap,
      subjectIds,
    )

    // Class performance averages
    const classPerformance = buildClassPerformance(
      classIds,
      teacher.teacherClasses,
      results,
      students,
      attendances,
    )

    // Upcoming lessons
    const todayLessons = lessons
      .filter((l) => l.day === currentDay)
      .map((l) => ({
        id: l.id,
        subject: l.subject.name,
        className: l.class.name,
        startTime: l.startTime,
        endTime: l.endTime,
        room: l.room || "",
        day: l.day,
        studentCount: l.class._count.students,
        status: "upcoming" as const,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const currentTime = today.toTimeString().slice(0, 5)
    const enrichedLessons = todayLessons.map((l) => ({
      ...l,
      status: (currentTime >= l.startTime && currentTime <= l.endTime
        ? "in_progress"
        : l.startTime > currentTime
          ? "upcoming"
          : "completed") as "in_progress" | "upcoming" | "completed",
    }))

    // Assessment center
    const publishedExams = exams.filter((e) => {
      const hasResults = results.some((r) => r.examId === e.id)
      return hasResults || new Date(e.date) < today
    })

    // Student insights: most improved vs declined
    const studentInsights = buildStudentInsights(results, studentIds, subjectIds)

    // Summary metrics
    const totalStudents = students.length
    const totalLessons = lessons.length
    const totalClasses = teacher.teacherClasses.length
    const examsToGradeCount = exams.filter((e) => {
      const examResultCount = results.filter((r) => r.examId === e.id).length
      const classStudentCount = students.filter(
        (s) => s.classId === e.classId,
      ).length
      return examResultCount < classStudentCount
    }).length

    const allScores = results.map((r) => r.score)
    const generalAverage =
      allScores.length > 0
        ? allScores.reduce((a, b) => a + b, 0) / allScores.length
        : 0

    const presentAttendances = attendances.filter((a) => a.status === "presente").length
    const attendanceRate =
      attendances.length > 0
        ? Math.round((presentAttendances / attendances.length) * 100)
        : 0

    const atRiskCount = attentionStudents.filter((a) => a.priority === "crítica").length

    const unjustifiedAbsencesCount = attendances.filter(
      (a) => a.status === "ausente" && !a.justificationId
    ).length

    // Lesson validation stats
    const totalRecorded = lessonRecords.length
    const validatedCount = lessonRecords.filter((r) => r.status === "REALIZADA").length
    const rejectedCount = lessonRecords.filter((r) => r.status === "REJEITADA").length
    const pendingCount = lessonRecords.filter((r) => r.status === "PENDING").length
    const noShowCount = lessonRecords.filter((r) => r.status === "FALTOU").length
    const substituteCount = lessonRecords.filter((r) => r.status === "SUBSTITUIDA").length
    const processedCount = validatedCount + rejectedCount + noShowCount + substituteCount
    const validationRate = processedCount > 0 ? Math.round((validatedCount / processedCount) * 100) : 0

    // Monthly history (last 6 months)
    const monthlyMap = new Map<string, { validated: number; rejected: number; pending: number; total: number }>()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    for (const r of lessonRecords) {
      const d = new Date(r.date)
      if (d < sixMonthsAgo) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (!monthlyMap.has(key)) monthlyMap.set(key, { validated: 0, rejected: 0, pending: 0, total: 0 })
      const entry = monthlyMap.get(key)!
      entry.total++
      if (r.status === "REALIZADA") entry.validated++
      else if (r.status === "REJEITADA") entry.rejected++
      else if (r.status === "PENDING") entry.pending++
    }
    const monthlyHistory = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }))

    return NextResponse.json({
      teacher: {
        id: teacher.id,
        name: teacher.name,
      },
      summary: {
        totalClasses,
        totalStudents,
        totalLessons,
        totalExamsToGrade: examsToGradeCount,
        totalStudentsAttention: attentionStudents.length,
        totalMeetings: 0,
        generalAverage: Math.round(generalAverage * 10) / 10,
        attendanceRate,
        assessmentsCompleted: publishedExams.length,
        studentsAtRisk: atRiskCount,
        unjustifiedAbsences: unjustifiedAbsencesCount,
      },
      attentionStudents,
      classPerformance,
      upcomingLessons: enrichedLessons,
      assessments: {
        toGrade: examsToGradeCount,
        published: publishedExams.length,
        scheduled: exams.filter((e) => new Date(e.date) >= today).length,
        correctionDeadline: null,
        recentExams: exams.slice(0, 10).map((e) => {
          const examDate = new Date(e.date)
          const isPending = !results.some((r) => r.examId === e.id) && examDate < today
          const daysPending = isPending
            ? Math.floor((today.getTime() - examDate.getTime()) / 86400000)
            : undefined
          return {
            id: e.id,
            title: e.title || "Avaliação",
            className: e.class.name,
            date: e.date.toISOString(),
            daysPending,
            status: results.some((r) => r.examId === e.id)
              ? ("publicado" as const)
              : examDate < today
                ? ("pendente" as const)
                : ("agendado" as const),
          }
        }),
      },
      studentInsights,
      recentAnnouncements: announcements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        priority: a.priority,
        category: (a.author?.name
          ? "coordenação"
          : "escola") as "escola" | "coordenação" | "sistema",
        createdAt: a.createdAt.toISOString(),
      })),
      lessonValidation: {
        totalRecorded,
        validatedCount,
        rejectedCount,
        pendingCount,
        noShowCount,
        substituteCount,
        validationRate,
        monthlyHistory,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

function buildAttentionStudents(
  results: Array<{
    studentId: string
    score: number
    date: Date
    subjectId: string
    student: { id: string; name: string; class: { name: string } | null }
    subject: { id: string; name: string }
  }>,
  attendances: Array<{
    studentId: string
    date: Date
    status: string
    classId: string
  }>,
  _assignments: Array<{ id: string }>,
  _studentIds: string[],
  studentClassMap: Map<string, string>,
  _subjectIds: string[],
) {
  const studentScores = new Map<
    string,
    { scores: number[]; subject: string; name: string; className: string }[]
  >()

  for (const r of results) {
    if (!studentScores.has(r.studentId)) {
      studentScores.set(r.studentId, [])
    }
    studentScores.get(r.studentId)!.push({
      scores: [r.score],
      subject: r.subject.name,
      name: r.student.name,
      className: r.student.class?.name || studentClassMap.get(r.studentId) || "",
    })
  }

  const studentAbsences = new Map<string, number>()
  for (const a of attendances) {
    if (a.status === "ausente") {
      studentAbsences.set(a.studentId, (studentAbsences.get(a.studentId) || 0) + 1)
    }
  }

  const attention: Array<{
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
  }> = []

  for (const [studentId, subs] of studentScores) {
    const firstEntry = subs[0]
    if (!firstEntry) continue
    const scores = subs.flatMap((s) => s.scores)
    if (scores.length === 0) continue
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const absences = studentAbsences.get(studentId) || 0
    const lastScore = scores[scores.length - 1]

    if (avg < 10) {
      attention.push({
        id: studentId,
        name: firstEntry.name,
        className: firstEntry.className,
        subject: firstEntry.subject,
        priority: "crítica",
        reason: `Média ${avg.toFixed(1)} — abaixo do mínimo`,
        averageBelow: avg,
        lastScore,
        trend: "down",
      })
    } else if (absences >= 5) {
      attention.push({
        id: studentId,
        name: firstEntry.name,
        className: firstEntry.className,
        subject: firstEntry.subject,
        priority: "crítica",
        reason: `${absences} Faltas consecutivas`,
        consecutiveAbsences: absences,
        lastScore,
        trend: "down",
      })
    } else if (avg < 12 && avg >= 10) {
      attention.push({
        id: studentId,
        name: firstEntry.name,
        className: firstEntry.className,
        subject: firstEntry.subject,
        priority: "moderada",
        reason: `Média ${avg.toFixed(1)} — precisa de atenção`,
        averageBelow: avg,
        lastScore,
        trend: scores.length > 1 && scores[scores.length - 1] < scores[0] ? "down" : "stable",
      })
    } else if (absences >= 3) {
      attention.push({
        id: studentId,
        name: firstEntry.name,
        className: firstEntry.className,
        subject: firstEntry.subject,
        priority: "informativa",
        reason: `${absences} Faltas registadas`,
        consecutiveAbsences: absences,
        lastScore,
        trend: "stable",
      })
    }
  }

  return attention.sort((a, b) => {
    const order = { crítica: 0, moderada: 1, informativa: 2 }
    return order[a.priority] - order[b.priority]
  })
}

function buildClassPerformance(
  classIds: string[],
  teacherClasses: Array<{
    class: {
      id: string
      name: string
      _count: { students: number }
    }
  }>,
  results: Array<{
    score: number
    studentId: string
  }>,
  students: Array<{
    id: string
    classId: string | null
  }>,
  attendances: Array<{
    studentId: string
    status: string
  }>,
) {
  return teacherClasses.map((tc) => {
    const classStudentIds = students
      .filter((s) => s.classId === tc.class.id)
      .map((s) => s.id)

    const classResults = results.filter((r) =>
      classStudentIds.includes(r.studentId),
    )

    const classScores = classResults.map((r) => r.score)
    const avg =
      classScores.length > 0
        ? classScores.reduce((a, b) => a + b, 0) / classScores.length
        : 0

    const classAttendances = attendances.filter((a) =>
      classStudentIds.includes(a.studentId),
    )
    const present = classAttendances.filter((a) => a.status === "presente").length
    const attendanceRate =
      classAttendances.length > 0
        ? Math.round((present / classAttendances.length) * 100)
        : 0

    const approvalRate =
      classScores.length > 0
        ? Math.round(
            (classScores.filter((s) => s >= 10).length / classScores.length) * 100,
          )
        : 0

    return {
      classId: tc.class.id,
      className: tc.class.name,
      average: Math.round(avg * 10) / 10,
      monthlyEvolution: 0,
      attendanceRate,
      approvalRate,
      studentCount: tc.class._count.students,
    }
  })
}

function buildStudentInsights(
  results: Array<{
    student: { id: string; name: string; class: { name: string } | null }
    subject: { id: string; name: string }
    score: number
    date: Date
  }>,
  _studentIds: string[],
  _subjectIds: string[],
) {
  const studentMap = new Map<
    string,
    {
      name: string
      subject: string
      scores: { score: number; date: Date }[]
    }
  >()

  for (const r of results) {
    const sid = r.student.id
    if (!studentMap.has(sid)) {
      studentMap.set(sid, {
        name: r.student.name,
        subject: r.subject.name,
        scores: [],
      })
    }
    studentMap.get(sid)!.scores.push({
      score: r.score,
      date: r.date,
    })
  }

  const insights: Array<{
    id: string
    name: string
    subject: string
    evolutionPercent: number
    trend: "up" | "down"
  }> = []

  for (const [id, data] of studentMap) {
    const sorted = data.scores.sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    )
    if (sorted.length < 2) continue

    const first = sorted[0].score
    const last = sorted[sorted.length - 1].score
    if (first === 0) continue

    const evolution = ((last - first) / first) * 100

    if (Math.abs(evolution) < 5) continue

    insights.push({
      id,
      name: data.name,
      subject: data.subject,
      evolutionPercent: Math.round(evolution * 10) / 10,
      trend: evolution > 0 ? "up" : "down",
    })
  }

  const sortedUp = insights
    .filter((i) => i.trend === "up")
    .sort((a, b) => b.evolutionPercent - a.evolutionPercent)
    .slice(0, 5)

  const sortedDown = insights
    .filter((i) => i.trend === "down")
    .sort((a, b) => a.evolutionPercent - b.evolutionPercent)
    .slice(0, 5)

  return {
    mostImproved: sortedUp,
    mostDeclined: sortedDown,
  }
}
