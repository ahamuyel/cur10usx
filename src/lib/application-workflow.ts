import type { ApplicationStatus, Prisma } from "@prisma/client"
import { createAccountInviteInTx, sendAccountInviteForApplication } from "@/lib/account-invite"
import { auditUser } from "@/lib/audit"
import {
  createEnrollmentForApplication,
  ensureApplicationUser,
  ensureRoleRecord,
  type ApplicationRecord,
} from "@/lib/application-membership"
import { prisma } from "@/lib/prisma"

type Tx = Prisma.TransactionClient

export type WorkflowActor = {
  userId: string
  userName: string
  userRole: string
  schoolId: string
  ipAddress?: string
}

export type WorkflowResult = {
  applicationId: string
  status: ApplicationStatus
  userId?: string
  inviteToken?: string
}

export class WorkflowError extends Error {}

export function actorFromSession(
  session: {
    user: {
      id: string
      name?: string | null
      role?: string | null
      schoolId?: string | null
    }
  },
  req: Request
): WorkflowActor {
  return {
    ...auditUser(session as { user: { id: string; name?: string | null; role?: string } }),
    schoolId: session.user.schoolId!,
    ipAddress:
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined,
  }
}

const PENDING_STATUSES: ApplicationStatus[] = ["pendente", "em_analise"]

async function loadApplication(tx: Tx, applicationId: string, schoolId?: string) {
  const application = (await tx.application.findUnique({
    where: { id: applicationId },
    include: { school: { select: { name: true } } },
  })) as ApplicationRecord | null

  if (!application || (schoolId && application.schoolId !== schoolId)) {
    throw new WorkflowError("Solicitação não encontrada")
  }
  return application
}

async function writeAudit(
  tx: Tx,
  actor: WorkflowActor,
  application: ApplicationRecord,
  description: string,
  oldStatus: ApplicationStatus,
  newStatus: ApplicationStatus
) {
  await tx.auditLog.create({
    data: {
      userId: actor.userId,
      userName: actor.userName,
      userRole: actor.userRole,
      action: "UPDATE",
      entity: "Application",
      entityId: application.id,
      schoolId: application.schoolId,
      description,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      ipAddress: actor.ipAddress,
    },
  })
}

async function notifyApplicant(
  tx: Tx,
  application: ApplicationRecord,
  userId: string | null,
  title: string,
  message: string
) {
  if (!userId) return
  await tx.notification.create({
    data: {
      userId,
      title,
      message,
      link: "/minha-area",
      type: "application",
      schoolId: application.schoolId,
    },
  })
}

export async function approveApplicationInTx(
  tx: Tx,
  input: { applicationId: string; actor: WorkflowActor }
): Promise<WorkflowResult> {
  const application = await loadApplication(tx, input.applicationId, input.actor.schoolId)
  if (!PENDING_STATUSES.includes(application.status)) {
    throw new WorkflowError("Solicitação não pode ser aprovada no estado atual")
  }

  await tx.application.update({
    where: { id: application.id },
    data: { status: "aprovada", approvedAt: new Date(), rejectReason: null },
  })
  await writeAudit(tx, input.actor, application, "Solicitação aprovada", application.status, "aprovada")
  await notifyApplicant(
    tx,
    application,
    application.userId,
    "Solicitação aprovada",
    `A sua solicitação na ${application.school.name} foi aprovada.`
  )

  return { applicationId: application.id, status: "aprovada", userId: application.userId ?? undefined }
}

export async function enrollApplicationInTx(
  tx: Tx,
  input: { applicationId: string; actor: WorkflowActor; classId?: string | null }
): Promise<WorkflowResult> {
  const application = await loadApplication(tx, input.applicationId, input.actor.schoolId)
  if (application.status !== "aprovada") {
    throw new WorkflowError("Solicitação precisa estar aprovada para matricular")
  }

  const user = await ensureApplicationUser(tx, application, { active: true })
  await ensureRoleRecord(tx, application, user.id, input.classId)
  await createEnrollmentForApplication(tx, application, input.classId)

  const invite = user.hashedPassword
    ? undefined
    : await createAccountInviteInTx(tx, application.id)

  await tx.application.update({
    where: { id: application.id },
    data: {
      status: "matriculada",
      enrolledAt: new Date(),
      userId: user.id,
      rejectReason: null,
    },
  })
  await writeAudit(tx, input.actor, application, "Matrícula concluída", application.status, "matriculada")
  await notifyApplicant(
    tx,
    application,
    user.id,
    "Matrícula confirmada",
    `A sua matrícula na ${application.school.name} foi concluída.`
  )

  return {
    applicationId: application.id,
    status: "matriculada",
    userId: user.id,
    inviteToken: invite?.token,
  }
}

export async function hireApplicationInTx(
  tx: Tx,
  input: { applicationId: string; actor: WorkflowActor }
): Promise<WorkflowResult> {
  const application = await loadApplication(tx, input.applicationId, input.actor.schoolId)
  if (application.status !== "aprovada") {
    throw new WorkflowError("Solicitação precisa estar aprovada para contratar")
  }
  if (application.role !== "teacher" && application.role !== "school_admin") {
    throw new WorkflowError("Apenas solicitações de docentes podem ser contratadas")
  }

  const user = await ensureApplicationUser(tx, application, { active: true })
  await ensureRoleRecord(tx, application, user.id)

  const invite = user.hashedPassword
    ? undefined
    : await createAccountInviteInTx(tx, application.id)

  await tx.application.update({
    where: { id: application.id },
    data: {
      status: "contratada",
      hiredAt: new Date(),
      userId: user.id,
      rejectReason: null,
    },
  })
  await writeAudit(tx, input.actor, application, "Contratação concluída", application.status, "contratada")
  await notifyApplicant(
    tx,
    application,
    user.id,
    "Contratação confirmada",
    `A sua contratação na ${application.school.name} foi concluída.`
  )

  return {
    applicationId: application.id,
    status: "contratada",
    userId: user.id,
    inviteToken: invite?.token,
  }
}

export async function rejectApplicationInTx(
  tx: Tx,
  input: { applicationId: string; actor: WorkflowActor; reason: string }
): Promise<WorkflowResult> {
  const application = await loadApplication(tx, input.applicationId, input.actor.schoolId)
  if (!PENDING_STATUSES.includes(application.status)) {
    throw new WorkflowError("Solicitação não pode ser rejeitada no estado atual")
  }

  await tx.application.update({
    where: { id: application.id },
    data: {
      status: "rejeitada",
      rejectReason: input.reason,
      rejectedAt: new Date(),
      inviteToken: null,
      inviteTokenExpiresAt: null,
      inviteTokenUsedAt: null,
    },
  })
  await writeAudit(tx, input.actor, application, "Solicitação rejeitada", application.status, "rejeitada")
  await notifyApplicant(
    tx,
    application,
    application.userId,
    "Solicitação não aprovada",
    `A sua solicitação na ${application.school.name} não foi aprovada.`
  )

  return { applicationId: application.id, status: "rejeitada", userId: application.userId ?? undefined }
}

export async function resendInviteInTx(
  tx: Tx,
  input: { applicationId: string; actor: WorkflowActor }
): Promise<WorkflowResult> {
  const application = await loadApplication(tx, input.applicationId, input.actor.schoolId)
  if (!["aprovada", "matriculada", "contratada"].includes(application.status)) {
    throw new WorkflowError("Não há convite disponível para esta solicitação")
  }

  const invite = await createAccountInviteInTx(tx, application.id)
  await writeAudit(tx, input.actor, application, "Convite reenviado", application.status, application.status)
  await notifyApplicant(
    tx,
    application,
    application.userId,
    "Convite reenviado",
    `Foi enviado um novo convite para aceder à ${application.school.name}.`
  )

  return {
    applicationId: application.id,
    status: application.status,
    userId: application.userId ?? undefined,
    inviteToken: invite.token,
  }
}

export function approveApplication(input: { applicationId: string; actor: WorkflowActor }) {
  return prisma.$transaction((tx) => approveApplicationInTx(tx, input))
}

export function enrollApplication(input: {
  applicationId: string
  actor: WorkflowActor
  classId?: string | null
}) {
  return prisma.$transaction((tx) => enrollApplicationInTx(tx, input))
}

export function hireApplication(input: { applicationId: string; actor: WorkflowActor }) {
  return prisma.$transaction((tx) => hireApplicationInTx(tx, input))
}

export function rejectApplication(input: {
  applicationId: string
  actor: WorkflowActor
  reason: string
}) {
  return prisma.$transaction((tx) => rejectApplicationInTx(tx, input))
}

export async function resendApplicationInvite(input: { applicationId: string; actor: WorkflowActor }) {
  const result = await prisma.$transaction((tx) => resendInviteInTx(tx, input))
  if (result.inviteToken) {
    await sendAccountInviteForApplication(result.applicationId, result.inviteToken)
  }
  return result
}
