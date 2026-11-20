import type { Application, Prisma } from "@prisma/client"

type Tx = Prisma.TransactionClient

export type ApplicationRecord = Application & {
  school: { id: string; name: string }
}

/**
 * Cria (ou reactiva) o utilizador associado a uma solicitação.
 * Sem palavra-passe quando o convite ainda não foi aceite — nunca geramos
 * palavras-passe temporárias neste fluxo.
 */
export async function ensureApplicationUser(
  tx: Tx,
  application: ApplicationRecord,
  options: { hashedPassword?: string | null; active?: boolean } = {}
) {
  const existing = await tx.user.findUnique({ where: { email: application.email } })
  const isActive = options.active ?? (application.status === "matriculada" || application.status === "contratada")

  if (existing) {
    const data: Prisma.UserUpdateInput = {
      isActive,
      school: { connect: { id: application.schoolId } },
      role: application.role,
      emailVerified: true,
      profileComplete: true,
      mustChangePassword: false,
    }
    if (options.hashedPassword) {
      data.hashedPassword = options.hashedPassword
      data.sessionVersion = { increment: 1 }
    }
    return tx.user.update({ where: { id: existing.id }, data })
  }

  return tx.user.create({
    data: {
      name: application.name,
      email: application.email,
      hashedPassword: options.hashedPassword ?? null,
      role: application.role,
      schoolId: application.schoolId,
      isActive,
      emailVerified: true,
      profileComplete: true,
    },
  })
}

/** Garante o registo específico do papel (Aluno/Professor/Encarregado/Admin). */
export async function ensureRoleRecord(
  tx: Tx,
  application: ApplicationRecord,
  userId: string,
  classId?: string | null
): Promise<string | null> {
  const common = {
    name: application.name,
    email: application.email,
    phone: application.phone,
    userId,
    schoolId: application.schoolId,
  }

  switch (application.role) {
    case "student": {
      const existing = await tx.student.findFirst({
        where: { OR: [{ userId }, { email: application.email }] },
      })
      if (existing) {
        if (classId && existing.classId !== classId) {
          await tx.student.update({ where: { id: existing.id }, data: { classId } })
        }
        return existing.id
      }
      const student = await tx.student.create({
        data: {
          ...common,
          address: "",
          ...(classId ? { classId } : {}),
          ...(application.gender ? { gender: application.gender } : {}),
          ...(application.documentType ? { documentType: application.documentType } : {}),
          ...(application.documentNumber ? { documentNumber: application.documentNumber } : {}),
          ...(application.dateOfBirth ? { dateOfBirth: application.dateOfBirth } : {}),
        },
      })
      return student.id
    }
    case "teacher": {
      const existing = await tx.teacher.findFirst({
        where: { OR: [{ userId }, { email: application.email }] },
      })
      if (existing) return existing.id
      const teacher = await tx.teacher.create({
        data: { ...common, address: "" },
      })
      return teacher.id
    }
    case "parent": {
      const existing = await tx.parent.findFirst({
        where: { OR: [{ userId }, { email: application.email }] },
      })
      if (existing) return existing.id
      const parent = await tx.parent.create({
        data: { ...common, address: "" },
      })
      return parent.id
    }
    case "school_admin": {
      await tx.adminPermission.upsert({
        where: { userId },
        create: {
          userId,
          level: "primary",
          schoolId: application.schoolId,
          canManageEmployees: true,
        },
        update: { schoolId: application.schoolId, canManageEmployees: true },
      })
      return userId
    }
    default:
      return null
  }
}

/** Cria a matrícula no ano lectivo corrente quando há turma associada. */
export async function createEnrollmentForApplication(
  tx: Tx,
  application: ApplicationRecord,
  classId?: string | null
) {
  if (application.role !== "student" || !classId) return null

  const academicYear = await tx.academicYear.findFirst({
    where: { schoolId: application.schoolId, isCurrent: true },
    select: { id: true },
  })
  if (!academicYear) return null

  const student = await tx.student.findFirst({
    where: { schoolId: application.schoolId, email: application.email },
    select: { id: true },
  })
  if (!student) return null

  const existing = await tx.enrollment.findUnique({
    where: {
      studentId_academicYearId: {
        studentId: student.id,
        academicYearId: academicYear.id,
      },
    },
  })
  if (existing) return existing

  return tx.enrollment.create({
    data: {
      studentId: student.id,
      classId,
      academicYearId: academicYear.id,
      schoolId: application.schoolId,
    },
  })
}
