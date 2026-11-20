import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole, getSchoolId } from "@/lib/api-auth"

export async function GET(req: Request) {
  try {
    const { error: authError, session } = await requireRole(["school_admin"], { requireSchool: true })
    if (authError) return authError

    const schoolId = getSchoolId(session!)
    const { searchParams } = new URL(req.url)
    const fromStr = searchParams.get("from")
    const toStr = searchParams.get("to")

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const fromDate = fromStr ? new Date(fromStr) : startOfMonth
    const toDate = toStr ? new Date(toStr) : endOfMonth

    // Fetch teachers who are active users or don't have accounts yet (pending account link)
    const teachers = await prisma.teacher.findMany({
      where: {
        schoolId,
        OR: [
          { userId: null },
          { user: { isActive: true } },
        ],
      },
      include: {
        lessons: {
          include: {
            academicYear: true,
          },
        },
        user: { select: { image: true } },
      },
    })

    // Fetch all lesson records in the date range for the school
    const records = await prisma.lessonRecord.findMany({
      where: {
        lesson: {
          schoolId,
        },
        date: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        lesson: true,
      },
    })

    const daysMap: Record<number, string> = {
      1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta", 6: "Sábado", 0: "Domingo",
    }

    const report = teachers.map((teacher) => {
      let lessonsScheduled = 0

      // Loop through each day in the range
      const loopDate = new Date(fromDate)
      loopDate.setHours(0, 0, 0, 0)
      const loopEnd = new Date(toDate)
      loopEnd.setHours(23, 59, 59, 999)

      while (loopDate <= loopEnd) {
        const dayName = daysMap[loopDate.getDay()]
        for (const lesson of teacher.lessons) {
          if (lesson.day === dayName) {
            // Verify if the lesson falls within its academic year bounds
            if (lesson.academicYear) {
              const start = new Date(lesson.academicYear.startDate)
              const stop = new Date(lesson.academicYear.endDate)
              if (loopDate < start || loopDate > stop) {
                continue
              }
            }
            lessonsScheduled++
          }
        }
        loopDate.setDate(loopDate.getDate() + 1)
      }

      const teacherRecords = records.filter((r) => r.lesson.teacherId === teacher.id)
      const lessonsRecorded = teacherRecords.filter((r) => r.status === "REALIZADA").length
      const lessonsPending = teacherRecords.filter((r) => r.status === "PENDING").length
      const lessonsMissed = teacherRecords.filter((r) => r.status === "FALTOU").length

      const attendanceRate = lessonsScheduled > 0
        ? Math.round((lessonsRecorded / lessonsScheduled) * 100 * 10) / 10
        : 100

      return {
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        teacherFoto: teacher.foto || teacher.user?.image || null,
        lessonsScheduled,
        lessonsRecorded,
        lessonsPending,
        lessonsMissed,
        attendanceRate,
      }
    })

    // Sort by attendanceRate ascending (piores primeiro)
    report.sort((a, b) => a.attendanceRate - b.attendanceRate)

    return NextResponse.json(report)
  } catch (error) {
    console.error(`[API Error] ${error}`)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
