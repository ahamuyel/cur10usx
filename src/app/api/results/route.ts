import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { createResultSchema } from "@/lib/validations/academic"
import { createNotification } from "@/lib/notifications"
import { buildOrderBy } from "@/lib/query-helpers"
import { requestSnapshot } from "@/lib/snapshot-queue"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher", "student", "parent"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const userId = session!.user.id
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const studentId = searchParams.get("studentId") || ""
    const subjectId = searchParams.get("subjectId") || ""
    const trimester = searchParams.get("trimester") || ""
    const academicYear = searchParams.get("academicYear") || ""
    const academicYearId = searchParams.get("academicYearId") || ""
    const classId = searchParams.get("classId") || ""
    const teacherId = searchParams.get("teacherId") || ""
    const type = searchParams.get("type") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      schoolId,
      ...(studentId ? { studentId } : {}),
      ...(subjectId ? { subjectId } : {}),
      ...(trimester ? { trimester } : {}),
      ...(type ? { type } : {}),
      ...(academicYear ? { academicYear } : {}),
      ...(academicYearId ? { academicYearId } : {}),
      ...(classId ? { student: { classId } } : {}),
    }

    if (teacherId) {
      const teacher = await prisma.teacher.findFirst({
        where: { id: teacherId, schoolId },
        select: {
          teacherClasses: { select: { classId: true } },
          teacherSubjects: { select: { subjectId: true } }
        }
      })
      const teacherClassIds = teacher?.teacherClasses.map((tc) => tc.classId) || []
      const teacherSubjectIds = teacher?.teacherSubjects.map((ts) => ts.subjectId) || []
      where.subjectId = { in: teacherSubjectIds }
      where.student = { ...where.student, classId: { in: teacherClassIds } }
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

    // Teacher: only results of subjects they teach in classes they are assigned to
    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId, schoolId },
        include: {
          teacherClasses: true,
          teacherSubjects: true,
        }
      })
      if (!teacher) {
        where.subjectId = "none"
        where.student = { classId: "none" }
      } else {
        const teacherClassIds = teacher.teacherClasses.map((tc) => tc.classId)
        const teacherSubjectIds = teacher.teacherSubjects.map((ts) => ts.subjectId)
        where.subjectId = { in: teacherSubjectIds }
        where.student = { ...where.student, classId: { in: teacherClassIds } }
      }
    }

    const orderBy = buildOrderBy(searchParams, ["score", "date", "type"], { date: "desc" })

    const [data, total] = await Promise.all([
      prisma.result.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          student: { select: { id: true, name: true } },
          subject: { select: { id: true, name: true } },
          exam: { select: { id: true, title: true } },
          assignment: { select: { id: true, title: true } },
        },
      }),
      prisma.result.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const parsed = createResultSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { date, trimester, academicYear, assignmentId, ...rest } = parsed.data

    // Teacher validation: must teach this subject in this student's class
    if (session!.user.role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        include: {
          teacherClasses: true,
          teacherSubjects: true,
        }
      })
      if (!teacher) {
        return NextResponse.json({ error: "Perfil de professor não encontrado" }, { status: 403 })
      }
      const student = await prisma.student.findUnique({
        where: { id: rest.studentId },
        select: { classId: true }
      })
      if (!student || !student.classId) {
        return NextResponse.json({ error: "Aluno não está enturmado" }, { status: 400 })
      }
      const hasClass = teacher.teacherClasses.some((tc) => tc.classId === student.classId)
      const hasSubject = teacher.teacherSubjects.some((ts) => ts.subjectId === rest.subjectId)
      if (!hasClass || !hasSubject) {
        return NextResponse.json({ error: "Sem permissão para lançar nesta turma/disciplina" }, { status: 403 })
      }
    }

    // Auto-fill academicYearId from current year
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, body.academicYearId)

    // Lock: prevent adding results to a closed year
    if (academicYearId) {
      const year = await prisma.academicYear.findUnique({ where: { id: academicYearId } })
      if (year?.status === "encerrado") {
        return NextResponse.json({ error: "Ano letivo encerrado. Não é possível adicionar notas." }, { status: 403 })
      }
      if (year?.status === "em_encerramento") {
        return NextResponse.json({ error: "Ano letivo em encerramento. Novas notas bloqueadas." }, { status: 403 })
      }
    }

    const result = await prisma.result.create({
      data: {
        ...rest,
        date: new Date(date),
        trimester: trimester || null,
        academicYear: academicYear || null,
        academicYearId: academicYearId || null,
        assignmentId: assignmentId || null,
        schoolId,
      },
    })

    // Notify student
    const student = await prisma.student.findUnique({ where: { id: rest.studentId }, select: { userId: true } })
    if (student?.userId) {
      const subject = await prisma.subject.findUnique({ where: { id: rest.subjectId }, select: { name: true } })
      await createNotification({
        userId: student.userId,
        title: `Nova nota: ${subject?.name || "Disciplina"}`,
        message: `Nota: ${rest.score}/20`,
        type: "nota",
        link: "/list/results",
        schoolId,
      })
    }

    logAudit({ ...auditUser(session!), action: "CREATE", entity: "Result", entityId: result.id, schoolId, description: `Nota ${rest.score} registada para aluno ${rest.studentId}` })

    await requestSnapshot(schoolId)

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
