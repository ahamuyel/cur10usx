import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requirePermission, getSchoolId } from "@/lib/api-auth"
import { getOrDefaultAcademicYearId } from "@/lib/academic-year"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requirePermission(
      ["school_admin", "teacher"],
      undefined,
      { requireSchool: true }
    )
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const role = session!.user.role
    const { searchParams } = new URL(req.url)
    const teacherId = searchParams.get("teacherId") || ""
    const providedAcademicYearId = searchParams.get("academicYearId")
    const academicYearId = await getOrDefaultAcademicYearId(schoolId, providedAcademicYearId)

    let whereTeacherId: string | string[] | undefined

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: { userId: session!.user.id, schoolId },
        select: { id: true },
      })
      if (!teacher) {
        return NextResponse.json({ error: "Perfil de professor não encontrado" }, { status: 404 })
      }
      whereTeacherId = teacher.id
    } else if (teacherId) {
      whereTeacherId = teacherId
    }

    const academicYearFilter = academicYearId ? { academicYearId } : {}

    const attendanceWhere: Record<string, unknown> = {
      schoolId,
      ...academicYearFilter,
      ...(whereTeacherId ? { teacherId: whereTeacherId } : {}),
    }

    const [records, teachers, totalLessonsScheduled] = await Promise.all([
      prisma.teacherAttendance.findMany({
        where: attendanceWhere,
        orderBy: { date: "desc" },
        include: {
          teacher: { select: { id: true, name: true } },
        },
      }),
      prisma.teacher.findMany({
        where: { schoolId, ...(whereTeacherId && typeof whereTeacherId === "string" ? { id: whereTeacherId } : {}) },
        select: {
          id: true,
          name: true,
          email: true,
          teacherClasses: {
            include: { class: { select: { id: true, name: true } } },
          },
          teacherSubjects: {
            include: { subject: { select: { id: true, name: true } } },
          },
        },
      }),
      prisma.scheduleSlot.count({
        where: {
          schoolId,
          ...(whereTeacherId && typeof whereTeacherId === "string" ? { teacherId: whereTeacherId } : {}),
          ...academicYearFilter,
        },
      }),
    ])

    const perTeacher: Record<string, {
      id: string
      name: string
      totalLessons: number
      taughtCount: number
      cancelledCount: number
      lateCount: number
      absentCount: number
      aulasPrevistas: number
    }> = {}

    for (const t of teachers) {
      perTeacher[t.id] = {
        id: t.id,
        name: t.name,
        totalLessons: 0,
        taughtCount: 0,
        cancelledCount: 0,
        lateCount: 0,
        absentCount: 0,
        aulasPrevistas: 0,
      }
    }

    for (const r of records) {
      if (!perTeacher[r.teacherId]) {
        const t = teachers.find((x) => x.id === r.teacherId)
        perTeacher[r.teacherId] = {
          id: r.teacherId,
          name: t?.name || "Desconhecido",
          totalLessons: 0,
          taughtCount: 0,
          cancelledCount: 0,
          lateCount: 0,
          absentCount: 0,
          aulasPrevistas: 0,
        }
      }
      perTeacher[r.teacherId].totalLessons++
      perTeacher[r.teacherId].aulasPrevistas += r.aulasPrevistas
      if (r.status === "leccionada") perTeacher[r.teacherId].taughtCount++
      else if (r.status === "cancelada") perTeacher[r.teacherId].cancelledCount++
      else if (r.status === "atrasada") perTeacher[r.teacherId].lateCount++
      else if (r.status === "ausente") perTeacher[r.teacherId].absentCount++
    }

    const dashboardData = Object.values(perTeacher).map((t) => ({
      ...t,
      compliancePercentage: t.totalLessons > 0
        ? Math.round(((t.taughtCount + t.cancelledCount) / t.totalLessons) * 100)
        : 0,
    }))

    const totalAulasPrevistas = dashboardData.reduce((s, t) => s + t.aulasPrevistas, 0)
    const totalTaught = dashboardData.reduce((s, t) => s + t.taughtCount, 0)
    const totalAbsences = dashboardData.reduce((s, t) => s + t.absentCount, 0)
    const totalLates = dashboardData.reduce((s, t) => s + t.lateCount, 0)
    const totalRecords = dashboardData.reduce((s, t) => s + t.totalLessons, 0)

    const overallCompliance = totalRecords > 0
      ? Math.round(((totalTaught + dashboardData.reduce((s, t) => s + t.cancelledCount, 0)) / totalRecords) * 100)
      : 0

    return NextResponse.json({
      teachers: dashboardData,
      summary: {
        totalTeachers: teachers.length,
        totalLessonsScheduled,
        totalAttendanceRecords: totalRecords,
        totalAulasPrevistas,
        totalTaught,
        totalAbsences,
        totalLates,
        overallCompliance,
      },
    })
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
