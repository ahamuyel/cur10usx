import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], undefined, { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId") || ""
    const trimester = searchParams.get("trimester") || ""
    const academicYear = searchParams.get("academicYear") || ""
    const academicYearIdParam = searchParams.get("academicYearId") || ""

    if (!studentId) {
      return NextResponse.json({ error: "studentId é obrigatório" }, { status: 400 })
    }

    // Default to current academic year if no filter provided
    const academicYearId = academicYearIdParam || (!academicYear ? await getOrDefaultAcademicYearId(schoolId) : undefined)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      studentId,
      ...(trimester ? { trimester } : {}),
      ...(academicYear ? { academicYear } : {}),
      ...(academicYearId ? { academicYearId } : {}),
    }

    // Student: own results only (ignore studentId from searchParams)
    if (role === "student") {
      const student = await prisma.student.findFirst({ where: { userId, schoolId }, select: { id: true } })
      where.studentId = student?.id ?? "none"
    }

    // Parent: children's results only
    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      where.studentId = parent ? { in: parent.students.map((s) => s.id) } : "none"
    }

    // Teacher: only students in their classes and subjects they teach
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId, schoolId },
        include: { teacherClasses: true, teacherSubjects: true },
      })
      if (!teacher) {
        where.subjectId = "none"
        where.student = { classId: "none" }
      } else {
        where.subjectId = { in: teacher.teacherSubjects.map((ts) => ts.subjectId) }
        where.student = { classId: { in: teacher.teacherClasses.map((tc) => tc.classId) } }
      }
    }

    const results = await prisma.result.findMany({
      where,
      include: { subject: { select: { id: true, name: true } } },
    })

    // Group by subject
    const bySubject: Record<string, { subjectId: string; subjectName: string; scores: number[] }> = {}
    for (const r of results) {
      if (!bySubject[r.subjectId]) {
        bySubject[r.subjectId] = { subjectId: r.subjectId, subjectName: r.subject.name, scores: [] }
      }
      bySubject[r.subjectId].scores.push(r.score)
    }

    const subjectAverages = Object.values(bySubject).map((s) => ({
      subjectId: s.subjectId,
      subjectName: s.subjectName,
      average: Math.round((s.scores.reduce((a, b) => a + b, 0) / s.scores.length) * 100) / 100,
      count: s.scores.length,
    }))

    const generalAverage = subjectAverages.length
      ? Math.round((subjectAverages.reduce((a, b) => a + b.average, 0) / subjectAverages.length) * 100) / 100
      : 0

    return NextResponse.json({
      studentId,
      subjectAverages,
      generalAverage,
      totalResults: results.length,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
