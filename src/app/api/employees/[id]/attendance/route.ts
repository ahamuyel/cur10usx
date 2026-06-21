import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { logAudit, auditUser } from "@/lib/audit"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee || employee.schoolId !== schoolId) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    const where: Record<string, unknown> = {
      employeeId: id,
      schoolId,
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate)
    }

    const records = await prisma.staffAttendance.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const employee = await prisma.employee.findUnique({ where: { id } })
    if (!employee || employee.schoolId !== schoolId) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { date, status, entryTime, exitTime, justification } = body

    if (!date || !status) {
      return NextResponse.json({ error: "Data e estado são obrigatórios" }, { status: 400 })
    }

    const validStatuses = ["presente", "ausente", "atrasado", "falta_justificada", "dispensa"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const recordDate = new Date(date)
    recordDate.setHours(0, 0, 0, 0)

    const record = await prisma.staffAttendance.upsert({
      where: {
        employeeId_date: { employeeId: id, date: recordDate },
      },
      update: {
        status,
        ...(entryTime !== undefined ? { entryTime: entryTime ? new Date(entryTime) : null } : {}),
        ...(exitTime !== undefined ? { exitTime: exitTime ? new Date(exitTime) : null } : {}),
        ...(justification !== undefined ? { justification: justification || null } : {}),
      },
      create: {
        employeeId: id,
        date: recordDate,
        status,
        entryTime: entryTime ? new Date(entryTime) : null,
        exitTime: exitTime ? new Date(exitTime) : null,
        justification: justification || null,
        schoolId,
      },
    })

    logAudit({
      ...auditUser(session!),
      action: "CREATE",
      entity: "StaffAttendance",
      entityId: record.id,
      schoolId,
      description: `Presença do funcionário ${employee.name} em ${date}: ${status}`,
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
