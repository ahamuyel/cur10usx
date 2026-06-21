import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const { id: studentId } = await params

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: { select: { id: true, name: true, grade: true } },
      },
    })

    if (!student) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    // Multi-tenant + role security
    if (session.user.schoolId !== student.schoolId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (session.user.role === "student" && student.userId !== session.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }
    if (session.user.role === "parent") {
      const parent = await prisma.parent.findUnique({
        where: { userId: session.user.id },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === studentId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    const now = new Date()

    // Fetch all data in parallel
    const [results, attendances, upcomingExams, upcomingAssignments, pendingSubmissions] = await Promise.all([
      prisma.result.findMany({
        where: { studentId, schoolId: student.schoolId },
        include: { subject: { select: { id: true, name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.findMany({
        where: { studentId, schoolId: student.schoolId },
        include: { lesson: { include: { subject: { select: { id: true, name: true } } } } },
        orderBy: { date: "asc" },
      }),
      prisma.exam.findMany({
        where: {
          classId: student.classId || undefined,
          date: { gte: now },
        },
        include: { subject: { select: { name: true } } },
        orderBy: { date: "asc" },
        take: 5,
      }),
      prisma.assignment.findMany({
        where: {
          classId: student.classId || undefined,
          dueDate: { gte: now },
        },
        include: { subject: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
      prisma.assignmentSubmission.count({
        where: { studentId, status: "pendente" },
      }),
    ])

    // --- Subject averages (cada disciplina pesa igualmente) ---
    const subjectMap: Record<string, { name: string; scores: number[] }> = {}
    for (const r of results) {
      if (!subjectMap[r.subjectId]) {
        subjectMap[r.subjectId] = { name: r.subject.name, scores: [] }
      }
      subjectMap[r.subjectId].scores.push(r.score)
    }
    const subjectAverages = Object.entries(subjectMap).map(([subjectId, data]) => ({
      subjectId,
      subjectName: data.name,
      average: Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10,
      count: data.scores.length,
    }))

    // --- General average (média das médias — cada disciplina pesa igual) ---
    const subjectAvgValues = subjectAverages.map((s) => s.average)
    const generalAverage = subjectAvgValues.length > 0
      ? Math.round((subjectAvgValues.reduce((a, b) => a + b, 0) / subjectAvgValues.length) * 10) / 10
      : 0

    // --- Attendance summary ---
    const presente = attendances.filter((a) => a.status === "presente").length
    const ausente = attendances.filter((a) => a.status === "ausente").length
    const atrasado = attendances.filter((a) => a.status === "atrasado").length
    const totalAttendance = attendances.length
    const totalAbsences = ausente

    // --- Absences by subject ---
    const absencesBySubject: Record<string, number> = {}
    for (const a of attendances) {
      if (a.status === "ausente" && a.lesson?.subject?.name) {
        const name = a.lesson.subject.name
        absencesBySubject[name] = (absencesBySubject[name] || 0) + 1
      }
    }
    const absencesBySubjectArray = Object.entries(absencesBySubject)
      .map(([subjectName, count]) => ({ subjectName, count }))
      .sort((a, b) => b.count - a.count)

    // --- Subject with most absences ---
    const subjectWithMostAbsences = absencesBySubjectArray[0]?.subjectName || null

    // --- Attendance by month ---
    const attendanceByMonth: { month: string; presente: number; ausente: number; atrasado: number }[] = []
    const monthMap: Record<string, { p: number; au: number; at: number }> = {}
    for (const a of attendances) {
      const d = new Date(a.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (!monthMap[key]) monthMap[key] = { p: 0, au: 0, at: 0 }
      if (a.status === "presente") monthMap[key].p++
      else if (a.status === "ausente") monthMap[key].au++
      else if (a.status === "atrasado") monthMap[key].at++
    }
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    for (const [key, counts] of Object.entries(monthMap).sort()) {
      const monthIdx = parseInt(key.split("-")[1]) - 1
      attendanceByMonth.push({
        month: monthNames[monthIdx],
        presente: counts.p,
        ausente: counts.au,
        atrasado: counts.at,
      })
    }

    // --- Results by trimester (for evolution chart) ---
    const trimesterMap: Record<string, Record<string, { name: string; scores: number[] }>> = {}
    const trimesterLabels: Record<string, string> = {
      primeiro: "1º Trimestre",
      segundo: "2º Trimestre",
      terceiro: "3º Trimestre",
    }
    for (const r of results) {
      const tri = r.trimester || "primeiro"
      if (!trimesterMap[tri]) trimesterMap[tri] = {}
      if (!trimesterMap[tri][r.subjectId]) {
        trimesterMap[tri][r.subjectId] = { name: r.subject.name, scores: [] }
      }
      trimesterMap[tri][r.subjectId].scores.push(r.score)
    }
    const trimesterEvolution = ["primeiro", "segundo", "terceiro"]
      .filter((t) => trimesterMap[t])
      .map((t) => {
        const subjects: Record<string, number> = {}
        for (const [, data] of Object.entries(trimesterMap[t])) {
          subjects[data.name] = Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 10) / 10
        }
        const allAvgs = Object.values(subjects)
        const generalAvg = allAvgs.length > 0
          ? Math.round((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length) * 10) / 10
          : 0
        return {
          trimester: t,
          label: trimesterLabels[t] || t,
          subjects,
          generalAverage: generalAvg,
        }
      })

    // --- Previous period average ---
    const previousAverage = trimesterEvolution.length >= 2
      ? trimesterEvolution[trimesterEvolution.length - 2].generalAverage
      : 0

    // --- Subject trends (comparação trimestral por disciplina) ---
    const subjectTrends: Record<string, { currentAverage: number; previousAverage: number; trend: number }> = {}
    if (trimesterEvolution.length >= 2) {
      const current = trimesterEvolution[trimesterEvolution.length - 1]
      const previous = trimesterEvolution[trimesterEvolution.length - 2]
      for (const [subjectName, avg] of Object.entries(current.subjects)) {
        const prevAvg = previous.subjects[subjectName] ?? avg
        subjectTrends[subjectName] = {
          currentAverage: avg,
          previousAverage: prevAvg,
          trend: Math.round((avg - prevAvg) * 10) / 10,
        }
      }
      // Subjects in previous but not in current
      for (const [subjectName, prevAvg] of Object.entries(previous.subjects)) {
        if (!subjectTrends[subjectName]) {
          subjectTrends[subjectName] = {
            currentAverage: prevAvg,
            previousAverage: prevAvg,
            trend: 0,
          }
        }
      }
    }

    // --- Score distribution ---
    const scoreDistribution = {
      excelente: results.filter((r) => r.score >= 16).length,
      bom: results.filter((r) => r.score >= 13 && r.score < 16).length,
      suficiente: results.filter((r) => r.score >= 10 && r.score < 13).length,
      insuficiente: results.filter((r) => r.score < 10).length,
    }

    // --- Last result per subject ---
    const subjectLastScores: Record<string, { score: number; type: string; date: string }> = {}
    for (const r of results) {
      if (!subjectLastScores[r.subjectId]) {
        subjectLastScores[r.subjectId] = {
          score: r.score,
          type: r.type,
          date: r.date.toISOString(),
        }
      }
    }

    // --- Recent results (last 10) ---
    const recentResults = results.slice(0, 10).map((r) => ({
      id: r.id,
      subjectName: r.subject.name,
      score: r.score,
      type: r.type,
      date: r.date.toISOString(),
      trimester: r.trimester,
    }))

    // --- Class rank & size ---
    let classRank: number | null = null
    let classSize: number | null = null

    if (student.classId) {
      const classStudents = await prisma.student.findMany({
        where: { classId: student.classId, schoolId: student.schoolId },
        select: { id: true },
      })
      classSize = classStudents.length

      const classStudentIds = classStudents.map((s) => s.id)
      const classResults = await prisma.result.findMany({
        where: { studentId: { in: classStudentIds }, schoolId: student.schoolId },
        select: { studentId: true, score: true, subjectId: true },
      })

      // Group by subject per student (per-subject average, same as generalAverage)
      const studentSubjectMap: Record<string, Record<string, number[]>> = {}
      for (const r of classResults) {
        if (!studentSubjectMap[r.studentId]) studentSubjectMap[r.studentId] = {}
        if (!studentSubjectMap[r.studentId][r.subjectId]) studentSubjectMap[r.studentId][r.subjectId] = []
        studentSubjectMap[r.studentId][r.subjectId].push(r.score)
      }

      const studentAverages: { studentId: string; average: number }[] = Object.entries(studentSubjectMap).map(
        ([studentId, subjects]) => {
          const subjectAvgs = Object.values(subjects).map(
            (scores) => Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
          )
          const avg = subjectAvgs.length > 0
            ? Math.round((subjectAvgs.reduce((a, b) => a + b, 0) / subjectAvgs.length) * 10) / 10
            : 0
          return { studentId, average: avg }
        },
      )

      studentAverages.sort((a, b) => b.average - a.average)

      const currentAvg = generalAverage
      let rank = 1
      for (const sa of studentAverages) {
        if (sa.average > currentAvg) rank++
      }
      classRank = rank
    }

    // --- Attendance warning (based on absences, not percentage) ---
    const attendanceWarning = totalAbsences >= 5 || absencesBySubjectArray.some((s) => s.count >= 3)

    // --- Subjects needing attention (average < 10) ---
    const subjectsNeedingAttention = subjectAverages
      .filter((s) => s.average < 10)
      .map((s) => s.subjectName)

    return NextResponse.json({
      student: {
        id: student.id,
        name: student.name,
        class: student.class,
        targetAverage: student.targetAverage,
      },
      targetAverage: student.targetAverage,
      generalAverage,
      previousAverage,
      classRank,
      classSize,
      attendanceWarning,
      totalAbsences,
      absencesBySubject: absencesBySubjectArray,
      subjectWithMostAbsences,
      totalResults: results.length,
      pendingSubmissions,
      subjectAverages,
      subjectsNeedingAttention,
      subjectLastScores,
      subjectTrends,
      scoreDistribution,
      attendance: { total: totalAttendance, presente, ausente, atrasado },
      attendanceByMonth,
      trimesterEvolution,
      recentResults,
      upcomingExams: upcomingExams.map((e) => ({
        id: e.id,
        title: e.title || e.subject.name,
        subjectName: e.subject.name,
        date: e.date,
      })),
      upcomingAssignments: upcomingAssignments.map((a) => ({
        id: a.id,
        title: a.title,
        subjectName: a.subject.name,
        dueDate: a.dueDate,
      })),
    })
  } catch (error) {
    console.error("Erro no dashboard do aluno:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
