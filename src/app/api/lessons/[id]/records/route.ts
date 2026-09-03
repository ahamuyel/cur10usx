import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"
import { z } from "zod"

const createRecordSchema = z.object({
  date: z.string().refine((val) => {
    const d = new Date(val)
    return !isNaN(d.getTime())
  }, { message: "Data inválida" }).refine((val) => {
    const d = new Date(val)
    const now = new Date()
    return d <= now
  }, { message: "A data não pode ser no futuro" }),
  notes: z.string().optional(),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error: authError, session } = await requireRole(["teacher"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const userId = session!.user.id
    const { id: lessonId } = await params

    const body = await req.json()
    const parsed = createRecordSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const dateObj = new Date(parsed.data.date)

    // Verify teacher exists and matches user
    const teacher = await prisma.teacher.findFirst({
      where: { userId, schoolId },
    })
    if (!teacher) {
      return NextResponse.json({ error: "Professor não encontrado para esta escola" }, { status: 404 })
    }

    // Verify lesson exists, belongs to school and the teacher
    const lesson = await prisma.scheduleSlot.findUnique({
      where: { id: lessonId },
    })
    if (!lesson || lesson.schoolId !== schoolId) {
      return NextResponse.json({ error: "Aula não encontrada" }, { status: 404 })
    }
    if (lesson.teacherId !== teacher.id) {
      return NextResponse.json({ error: "Esta aula não pertence ao professor autenticado" }, { status: 403 })
    }

    // Validate the date is within the active academic year (active semester/bounds)
    const activeYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    })
    if (!activeYear) {
      return NextResponse.json({ error: "Nenhum ano letivo ativo para esta escola" }, { status: 400 })
    }
    if (dateObj < new Date(activeYear.startDate) || dateObj > new Date(activeYear.endDate)) {
      return NextResponse.json({ error: "A data deve estar dentro do ano letivo ativo" }, { status: 400 })
    }

    // Check unique constraint for [lessonId, date]
    const existing = await prisma.lessonRecord.findUnique({
      where: {
        lessonId_date: {
          lessonId,
          date: dateObj,
        },
      },
    })
    if (existing) {
      return NextResponse.json({ error: "Já existe um registo para esta aula nesta data" }, { status: 409 })
    }

    const record = await prisma.lessonRecord.create({
      data: {
        lessonId,
        date: dateObj,
        status: "PENDING",
        notes: parsed.data.notes || null,
        recordedBy: userId,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
