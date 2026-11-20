import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher", "student", "parent"],
      undefined,
      { requireSchool: true },
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id: studentId } = await params
    const role = session!.user.role

    const studentRecord = await prisma.student.findUnique({
      where: { id: studentId },
      select: { schoolId: true, classId: true, userId: true },
    })

    if (!studentRecord || studentRecord.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 })
    }

    if (role === "student" && studentRecord.userId !== session!.user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { students: { select: { id: true } } },
      })
      if (!parent || !parent.students.some((s) => s.id === studentId)) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        include: { teacherClasses: true },
      })
      const hasClass = teacher?.teacherClasses.some((tc) => tc.classId === studentRecord.classId)
      if (!teacher || !hasClass) {
        return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
      }
    }

    const [history, allResults, allAttendances, academicYears, lessonsWithTeachers] = await Promise.all([
      prisma.academicHistory.findMany({
        where: { studentId, schoolId },
        include: {
          academicYear: { select: { id: true, name: true, startDate: true, endDate: true } },
          school: { select: { id: true, name: true } },
        },
        orderBy: [{ academicYear: { startDate: "asc" } }],
      }),
      prisma.result.findMany({
        where: { studentId, schoolId },
        include: {
          subject: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.attendance.findMany({
        where: { studentId, schoolId },
        include: {
          lesson: {
            include: {
              subject: { select: { id: true, name: true } },
              teacher: { select: { name: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.academicYear.findMany({
        where: { schoolId },
        select: { id: true, name: true, startDate: true, endDate: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.scheduleSlot.findMany({
        where: {
          classId: studentRecord?.classId || undefined,
          schoolId,
        },
        select: {
          id: true,
          subjectId: true,
          teacher: { select: { id: true, name: true } },
        },
      }),
    ])

    const subjectTeacherMap: Record<string, string | null> = {}
    for (const lesson of lessonsWithTeachers) {
      if (lesson.subjectId && lesson.teacher) {
        subjectTeacherMap[lesson.subjectId] = lesson.teacher.name
      }
    }
    const lessonCountBySubject: Record<string, number> = {}
    for (const lesson of lessonsWithTeachers) {
      if (lesson.subjectId) {
        lessonCountBySubject[lesson.subjectId] = (lessonCountBySubject[lesson.subjectId] || 0) + 1
      }
    }

    const trimesterLabels: Record<string, string> = {
      primeiro: "1º Trimestre",
      segundo: "2º Trimestre",
      terceiro: "3º Trimestre",
    }

    const trimesterOrder = ["primeiro", "segundo", "terceiro"]

    const resultsBySubject: Record<string, {
      subjectId: string
      subjectName: string
      teacherName: string | null
      totalLessons: number
      results: { id: string; score: number; type: string; date: string; trimester: string | null; weight: number | null; observations: string | null }[]
      trimesterAverages: Record<string, number>
      totalAverage: number
      absences: number
      absenceDates: string[]
    }> = {}

    for (const r of allResults) {
      if (!resultsBySubject[r.subjectId]) {
        resultsBySubject[r.subjectId] = {
          subjectId: r.subjectId,
          subjectName: r.subject.name,
          teacherName: subjectTeacherMap[r.subjectId] || null,
          totalLessons: lessonCountBySubject[r.subjectId] || 0,
          results: [],
          trimesterAverages: {},
          totalAverage: 0,
          absences: 0,
          absenceDates: [],
        }
      }
      resultsBySubject[r.subjectId].results.push({
        id: r.id,
        score: r.score,
        type: r.type,
        date: r.date.toISOString(),
        trimester: r.trimester,
        weight: r.weight,
        observations: r.observations,
      })
    }

    for (const a of allAttendances) {
      const subjId = a.lesson?.subject?.id
      if (subjId && resultsBySubject[subjId]) {
        if (a.status === "ausente") {
          resultsBySubject[subjId].absences++
          resultsBySubject[subjId].absenceDates.push(a.date.toISOString())
        }
      }
    }

    for (const [, subject] of Object.entries(resultsBySubject)) {
      const triScores: Record<string, number[]> = {}
      for (const r of subject.results) {
        const tri = r.trimester || "primeiro"
        if (!triScores[tri]) triScores[tri] = []
        triScores[tri].push(r.score)
      }
      for (const [tri, scores] of Object.entries(triScores)) {
        subject.trimesterAverages[tri] =
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      }
      const allScores = subject.results.map((r) => r.score)
      subject.totalAverage =
        allScores.length > 0
          ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
          : 0
    }

    const overallYear = (() => {
      const subjectAvgs = Object.values(resultsBySubject).map((s) => s.totalAverage)
      return subjectAvgs.length > 0
        ? Math.round((subjectAvgs.reduce((a, b) => a + b, 0) / subjectAvgs.length) * 10) / 10
        : 0
    })()

    const yearTrimesterEvolution = trimesterOrder
      .filter((t) => Object.values(resultsBySubject).some((s) => s.trimesterAverages[t] !== undefined))
      .map((t) => {
        const triAvgs = Object.values(resultsBySubject)
          .map((s) => s.trimesterAverages[t])
          .filter((v): v is number => v !== undefined)
        const avg = triAvgs.length > 0
          ? Math.round((triAvgs.reduce((a, b) => a + b, 0) / triAvgs.length) * 10) / 10
          : 0
        return {
          trimester: t,
          label: trimesterLabels[t] || t,
          generalAverage: avg,
        }
      })

    const attendancesBySubject: Record<string, { present: number; absent: number; late: number }> = {}
    for (const a of allAttendances) {
      const name = a.lesson?.subject?.name || "Desconhecida"
      if (!attendancesBySubject[name]) attendancesBySubject[name] = { present: 0, absent: 0, late: 0 }
      if (a.status === "presente") attendancesBySubject[name].present++
      else if (a.status === "ausente") attendancesBySubject[name].absent++
      else if (a.status === "atrasado") attendancesBySubject[name].late++
    }

    const timeline: {
      date: string
      month: string
      monthKey: string
      events: { type: "exam" | "absence"; subjectName: string; score?: number; label: string }[]
    }[] = []

    const timelineMap: Record<string, {
      date: string
      month: string
      monthKey: string
      events: { type: "exam" | "absence"; subjectName: string; score?: number; label: string }[]
    }> = {}

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    for (const r of allResults.slice(0, 100)) {
      const d = new Date(r.date)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (!timelineMap[monthKey]) {
        timelineMap[monthKey] = {
          date: d.toISOString(),
          month: monthNames[d.getMonth()],
          monthKey,
          events: [],
        }
      }
      timelineMap[monthKey].events.push({
        type: "exam",
        subjectName: r.subject.name,
        score: r.score,
        label: `${r.type} — ${r.score.toFixed(1)}`,
      })
    }

    for (const a of allAttendances.filter((a) => a.status === "ausente")) {
      const d = new Date(a.date)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (!timelineMap[monthKey]) {
        timelineMap[monthKey] = {
          date: d.toISOString(),
          month: monthNames[d.getMonth()],
          monthKey,
          events: [],
        }
      }
      timelineMap[monthKey].events.push({
        type: "absence",
        subjectName: a.lesson?.subject?.name || "Desconhecida",
        label: `Falta em ${a.lesson?.subject?.name || "Desconhecida"}`,
      })
    }

    for (const key of Object.keys(timelineMap).sort().reverse()) {
      timeline.push(timelineMap[key])
    }

    return NextResponse.json({
      student: {
        id: studentId,
        overallAverage: overallYear,
        totalAssessments: allResults.length,
        totalAbsences: allAttendances.filter((a) => a.status === "ausente").length,
        totalSubjects: Object.keys(resultsBySubject).length,
      },
      academicHistory: history.map((h) => ({
        id: h.id,
        academicYear: h.academicYear,
        school: h.school,
        grade: h.grade,
        className: h.className,
        courseName: h.courseName,
        finalAverage: h.finalAverage,
        status: h.status,
        failedSubjects: h.failedSubjects,
        observation: h.observation,
        subjectResults: h.subjectResults,
        decidedAt: h.decidedAt,
      })),
      currentYear: {
        overallAverage: overallYear,
        subjects: Object.values(resultsBySubject).map((s) => ({
          subjectId: s.subjectId,
          subjectName: s.subjectName,
          teacherName: s.teacherName,
          totalLessons: s.totalLessons,
          totalAverage: s.totalAverage,
          trimesterAverages: s.trimesterAverages,
          results: s.results,
          absences: s.absences,
          absenceDates: s.absenceDates,
        })),
        attendancesBySubject,
        trimesterEvolution: yearTrimesterEvolution,
        timeline,
      },
      academicYears,
    })
  } catch (error) {
    console.error("[API Error]", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
