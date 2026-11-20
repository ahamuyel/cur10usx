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

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { id: true, isActive: true } } },
    })

    if (!employee || employee.schoolId !== schoolId) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""

    const attWhere: Record<string, unknown> = { employeeId: id, schoolId }
    if (startDate || endDate) {
      attWhere.date = {}
      if (startDate) (attWhere.date as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (attWhere.date as Record<string, unknown>).lte = new Date(endDate)
    }

    const attendances = await prisma.staffAttendance.findMany({
      where: attWhere,
      orderBy: { date: "desc" },
    })

    const totalDays = attendances.length
    const presentCount = attendances.filter((a) => a.status === "presente").length
    const absentCount = attendances.filter((a) => a.status === "ausente").length
    const lateCount = attendances.filter((a) => a.status === "atrasado").length
    const justifiedCount = attendances.filter((a) => a.status === "falta_justificada").length
    const excusedCount = attendances.filter((a) => a.status === "dispensa").length

    return NextResponse.json({
      ...employee,
      hasAccount: !!employee.userId,
      userActive: employee.user?.isActive ?? null,
      attendanceStats: {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        justifiedCount,
        excusedCount,
      },
      attendances,
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageEmployees", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    const body = await req.json()
    const { name, email, phone, address, role, department } = body

    if (email && email !== existing.email) {
      const emailExists = await prisma.employee.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: "Este e-mail já está cadastrado" }, { status: 409 })
      }
    }

    if (role && !["secretaria", "tesouraria", "biblioteca", "recursos_humanos", "coordenacao", "direcao", "outros"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 })
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email: email || null } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(address !== undefined ? { address: address || null } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(department !== undefined ? { department: department || null } : {}),
      },
    })

    logAudit({
      ...auditUser(session!),
      action: "UPDATE",
      entity: "Employee",
      entityId: id,
      schoolId,
      description: `Funcionário ${existing.name} actualizado`,
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageEmployees", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { id } = await params

    const existing = await prisma.employee.findUnique({ where: { id } })
    if (!existing || existing.schoolId !== schoolId) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 })
    }

    const employee = await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    })

    logAudit({
      ...auditUser(session!),
      action: "DELETE",
      entity: "Employee",
      entityId: id,
      schoolId,
      description: `Funcionário ${existing.name} desactivado`,
    })

    return NextResponse.json(employee)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
