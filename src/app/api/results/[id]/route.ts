import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { updateResultSchema } from "@/lib/validations/academic"
import { logAudit, auditUser } from "@/lib/audit"
import { requestSnapshot } from "@/lib/snapshot-queue"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const result = await prisma.result.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        exam: { select: { id: true, title: true } },
      },
    })

    if (!result || result.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.result.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    // Teacher scope: only edit results of subjects they teach in classes they are assigned to
    if (session!.user.role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        include: {
          teacherClasses: true,
          teacherSubjects: true,
        },
      })
      if (!teacher) return NextResponse.json({ error: "Perfil de professor não encontrado" }, { status: 403 })
      const student = await prisma.student.findUnique({ where: { id: existing.studentId }, select: { classId: true } })
      if (!student || !student.classId) {
        return NextResponse.json({ error: "Aluno não enturmado" }, { status: 403 })
      }
      const hasClass = teacher.teacherClasses.some((tc) => tc.classId === student.classId)
      const hasSubject = teacher.teacherSubjects.some((ts) => ts.subjectId === existing.subjectId)
      
      const body = await req.json()
      const newSubjectId = body.subjectId || existing.subjectId
      const hasNewSubject = teacher.teacherSubjects.some((ts) => ts.subjectId === newSubjectId)
      
      if (!hasClass || !hasSubject || !hasNewSubject) {
        return NextResponse.json({ error: "Sem permissão para gerir esta nota (fora do seu contexto pedagógico)" }, { status: 403 })
      }
      
      // Pass the body down so we don't call req.json() again since it can only be consumed once
      req.json = async () => body
    }

    const body = await req.json()
    const parsed = updateResultSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { date, ...rest } = parsed.data

    const result = await prisma.result.update({
      where: { id },
      data: {
        ...rest,
        ...(date !== undefined ? { date: new Date(date) } : {}),
      },
    })

    logAudit({ ...auditUser(session!), action: "UPDATE", entity: "Result", entityId: id, schoolId, description: `Nota actualizada para ${existing.score}` })

    await requestSnapshot(schoolId)

    return NextResponse.json(result)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin", "teacher"], "canManageResults", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.result.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Resultado não encontrado" }, { status: 404 })
    }

    // Teacher scope: only delete results of subjects they teach in classes they are assigned to
    if (session!.user.role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        include: {
          teacherClasses: true,
          teacherSubjects: true,
        },
      })
      if (!teacher) return NextResponse.json({ error: "Perfil de professor não encontrado" }, { status: 403 })
      const student = await prisma.student.findUnique({ where: { id: existing.studentId }, select: { classId: true } })
      if (!student || !student.classId) {
        return NextResponse.json({ error: "Aluno não enturmado" }, { status: 403 })
      }
      const hasClass = teacher.teacherClasses.some((tc) => tc.classId === student.classId)
      const hasSubject = teacher.teacherSubjects.some((ts) => ts.subjectId === existing.subjectId)
      if (!hasClass || !hasSubject) {
        return NextResponse.json({ error: "Sem permissão para eliminar esta nota" }, { status: 403 })
      }
    }

    await prisma.result.delete({ where: { id } })

    logAudit({ ...auditUser(session!), action: "DELETE", entity: "Result", entityId: id, schoolId, description: `Nota ${existing.score} eliminada` })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
