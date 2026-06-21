import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["student", "parent", "teacher", "school_admin"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const role = session!.user.role

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status") || ""
    const studentIdParam = searchParams.get("studentId") || ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { schoolId }

    if (status) where.status = status

    if (role === "student") {
      const student = await prisma.student.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!student) {
        return NextResponse.json({ error: "Perfil de aluno não encontrado" }, { status: 404 })
      }
      where.studentId = student.id
    } else if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { students: { select: { id: true } } },
      })
      if (!parent || parent.students.length === 0) {
        return NextResponse.json({ data: [], total: 0, page, totalPages: 0 })
      }
      where.studentId = { in: parent.students.map((s) => s.id) }
      if (studentIdParam) {
        const linkedIds = parent.students.map((s) => s.id)
        if (!linkedIds.includes(studentIdParam)) {
          return NextResponse.json({ error: "Sem permissão para este aluno" }, { status: 403 })
        }
        where.studentId = studentIdParam
      }
    } else if (studentIdParam) {
      where.studentId = studentIdParam
    }

    const [data, total] = await Promise.all([
      prisma.justification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              class: { select: { id: true, name: true } },
            },
          },
          reviewedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.justification.count({ where }),
    ])

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["student", "parent"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const role = session!.user.role

    const body = await req.json()
    const { studentId, date, reason, reasonDescription, documentUrl, attendanceIds } = body

    if (!studentId || !date || !reason) {
      return NextResponse.json({ error: "Campos obrigatórios: studentId, date, reason" }, { status: 400 })
    }

    const validReasons = [
      "consulta_medica", "doenca", "falecimento_familiar",
      "atividade_desportiva", "representacao_institucional",
      "problema_pessoal", "outro",
    ]
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: "Motivo inválido" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, userId: true, parents: { select: { id: true } } },
    })

    if (!student || student.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aluno não encontrado ou não pertence a esta escola" }, { status: 404 })
    }

    if (role === "student" && student.userId !== userId) {
      return NextResponse.json({ error: "Sem permissão para justificar faltas deste aluno" }, { status: 403 })
    }

    if (role === "parent") {
      const parent = await prisma.parent.findFirst({
        where: { userId, schoolId },
        select: { id: true },
      })
      if (!parent || !student.parents.some((p) => p.id === parent.id)) {
        return NextResponse.json({ error: "Sem permissão para justificar faltas deste aluno" }, { status: 403 })
      }
    }

    const justification = await prisma.justification.create({
      data: {
        studentId,
        date: new Date(date),
        reason,
        reasonDescription: reasonDescription || null,
        documentUrl: documentUrl || null,
        schoolId,
      },
    })

    if (attendanceIds?.length > 0) {
      const attendances = await prisma.attendance.findMany({
        where: {
          id: { in: attendanceIds },
          studentId,
          schoolId,
        },
        select: { id: true },
      })

      if (attendances.length !== attendanceIds.length) {
        return NextResponse.json(
          { error: "Uma ou mais presenças não encontradas ou não pertencem ao aluno" },
          { status: 400 }
        )
      }

      await prisma.attendance.updateMany({
        where: { id: { in: attendanceIds } },
        data: {
          justificationId: justification.id,
          status: "falta_justificada",
        },
      })
    }

    const created = await prisma.justification.findUnique({
      where: { id: justification.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            class: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
