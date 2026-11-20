import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const employeeId = searchParams.get("employeeId") || ""
    const department = searchParams.get("department") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    const groupBy = searchParams.get("groupBy") || "employee" // employee | department

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "startDate e endDate são obrigatórios" }, { status: 400 })
    }

    const dateFilter = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    }

    const employeeWhere: Record<string, unknown> = {
      schoolId,
      isActive: true,
      ...(employeeId ? { id: employeeId } : {}),
      ...(department ? { department } : {}),
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, name: true, role: true, department: true },
    })

    if (employees.length === 0) {
      return NextResponse.json({ data: [], summary: null })
    }

    const attendances = await prisma.staffAttendance.findMany({
      where: {
        employeeId: { in: employees.map((e) => e.id) },
        date: dateFilter,
        schoolId,
      },
    })

    if (groupBy === "department") {
      const deptMap = new Map<string, {
        department: string
        employees: string[]
        totalDays: number
        presentCount: number
        absentCount: number
        lateCount: number
        justifiedCount: number
        excusedCount: number
      }>()

      for (const emp of employees) {
        const dept = emp.department || "Sem departamento"
        if (!deptMap.has(dept)) {
          deptMap.set(dept, {
            department: dept,
            employees: [],
            totalDays: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            justifiedCount: 0,
            excusedCount: 0,
          })
        }
        const entry = deptMap.get(dept)!
        entry.employees.push(emp.name)
      }

      for (const att of attendances) {
        const emp = employees.find((e) => e.id === att.employeeId)
        const dept = emp?.department || "Sem departamento"
        const entry = deptMap.get(dept)
        if (entry) {
          entry.totalDays++
          if (att.status === "presente") entry.presentCount++
          else if (att.status === "ausente") entry.absentCount++
          else if (att.status === "atrasado") entry.lateCount++
          else if (att.status === "falta_justificada") entry.justifiedCount++
          else if (att.status === "dispensa") entry.excusedCount++
        }
      }

      const data = Array.from(deptMap.values()).map((entry) => ({
        ...entry,
        compliancePercentage: entry.totalDays > 0
          ? Math.round(((entry.presentCount + entry.justifiedCount + entry.excusedCount) / entry.totalDays) * 100)
          : 0,
      }))

      return NextResponse.json({ data, groupBy: "department" })
    }

    // Default: group by employee
    const data = employees.map((emp) => {
      const empAttendances = attendances.filter((a) => a.employeeId === emp.id)
      const totalDays = empAttendances.length
      const presentCount = empAttendances.filter((a) => a.status === "presente").length
      const absentCount = empAttendances.filter((a) => a.status === "ausente").length
      const lateCount = empAttendances.filter((a) => a.status === "atrasado").length
      const justifiedCount = empAttendances.filter((a) => a.status === "falta_justificada").length
      const excusedCount = empAttendances.filter((a) => a.status === "dispensa").length
      const compliancePercentage = totalDays > 0
        ? Math.round(((presentCount + justifiedCount + excusedCount) / totalDays) * 100)
        : 0

      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        department: emp.department,
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        justifiedCount,
        excusedCount,
        compliancePercentage,
      }
    })

    const totals = data.reduce(
      (acc, cur) => ({
        totalDays: acc.totalDays + cur.totalDays,
        presentCount: acc.presentCount + cur.presentCount,
        absentCount: acc.absentCount + cur.absentCount,
        lateCount: acc.lateCount + cur.lateCount,
        justifiedCount: acc.justifiedCount + cur.justifiedCount,
        excusedCount: acc.excusedCount + cur.excusedCount,
      }),
      { totalDays: 0, presentCount: 0, absentCount: 0, lateCount: 0, justifiedCount: 0, excusedCount: 0 }
    )

    const summary = {
      ...totals,
      compliancePercentage: totals.totalDays > 0
        ? Math.round(((totals.presentCount + totals.justifiedCount + totals.excusedCount) / totals.totalDays) * 100)
        : 0,
    }

    return NextResponse.json({ data, summary, groupBy: "employee" })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
