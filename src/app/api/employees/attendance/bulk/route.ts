import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { logAudit, auditUser } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(["school_admin"], "canManageAttendance", { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const body = await req.json()
    const { date, records } = body

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "Data e registos são obrigatórios" }, { status: 400 })
    }

    const validStatuses = ["presente", "ausente", "atrasado", "falta_justificada", "dispensa"]
    const recordDate = new Date(date)
    recordDate.setHours(0, 0, 0, 0)

    const employeeIds = records.map((r: { employeeId: string }) => r.employeeId)
    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds }, schoolId },
      select: { id: true },
    })
    const validEmployeeIds = new Set(employees.map((e) => e.id))

    const results: { employeeId: string; status: string; created: boolean }[] = []

    for (const record of records) {
      const { employeeId, status, entryTime, exitTime } = record

      if (!employeeId || !status) continue
      if (!validStatuses.includes(status)) continue
      if (!validEmployeeIds.has(employeeId)) continue

      const existing = await prisma.staffAttendance.findUnique({
        where: { employeeId_date: { employeeId, date: recordDate } },
      })

      if (existing) {
        await prisma.staffAttendance.update({
          where: { id: existing.id },
          data: {
            status,
            ...(entryTime !== undefined ? { entryTime: entryTime ? new Date(entryTime) : null } : {}),
            ...(exitTime !== undefined ? { exitTime: exitTime ? new Date(exitTime) : null } : {}),
          },
        })
        results.push({ employeeId, status, created: false })
      } else {
        await prisma.staffAttendance.create({
          data: {
            employeeId,
            date: recordDate,
            status,
            entryTime: entryTime ? new Date(entryTime) : null,
            exitTime: exitTime ? new Date(exitTime) : null,
            schoolId,
          },
        })
        results.push({ employeeId, status, created: true })
      }
    }

    logAudit({
      ...auditUser(session!),
      action: "CREATE",
      entity: "StaffAttendance",
      schoolId,
      description: `Presenças em bloco registadas para ${results.length} funcionário(s) em ${date}`,
    })

    return NextResponse.json({ success: true, count: results.length, results }, { status: 201 })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
