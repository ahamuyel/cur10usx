import { randomBytes } from "crypto"
import type { Prisma } from "@prisma/client"
import { ensureApplicationUser, ensureRoleRecord, type ApplicationRecord } from "@/lib/application-membership"
import { sendAccountInvite } from "@/lib/email"
import { hashPassword } from "@/lib/password"
import { prisma } from "@/lib/prisma"

type Tx = Prisma.TransactionClient

export const INVITE_TTL_MS = 48 * 60 * 60 * 1000

export class InviteError extends Error {}

export function createInviteToken(): string {
  return randomBytes(32).toString("base64url")
}

export function createInviteExpiry(now = new Date()): Date {
  return new Date(now.getTime() + INVITE_TTL_MS)
}

/**
 * Cria ou renova o convite de uma solicitação. O token é de uso único e
 * expira 48 horas após a emissão. Um reenvio invalida o token anterior.
 */
export async function createAccountInviteInTx(tx: Tx, applicationId: string) {
  const sentAt = new Date()
  const token = createInviteToken()
  const expiresAt = createInviteExpiry(sentAt)

  await tx.application.update({
    where: { id: applicationId },
    data: {
      inviteToken: token,
      inviteTokenExpiresAt: expiresAt,
      inviteTokenUsedAt: null,
      inviteSentAt: sentAt,
    },
  })

  return { token, expiresAt, sentAt }
}

export async function createAccountInvite(applicationId: string) {
  return prisma.$transaction((tx) => createAccountInviteInTx(tx, applicationId))
}

export async function sendAccountInviteForApplication(applicationId: string, token: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { school: { select: { name: true } } },
  })
  if (!application) throw new InviteError("Solicitação não encontrada")
  await sendAccountInvite(application.email, application.name, application.school.name, token)
}

/** Reenvia o convite, gerando um novo token e reiniciando a validade de 48h. */
export async function resendAccountInvite(applicationId: string) {
  const invite = await createAccountInvite(applicationId)
  await sendAccountInviteForApplication(applicationId, invite.token)
  return invite
}

/** Aceita o convite: define a palavra-passe e consumiu o token exatamente uma vez. */
export async function acceptAccountInviteInTx(
  tx: Tx,
  input: { token: string; password: string }
) {
  const application = (await tx.application.findUnique({
    where: { inviteToken: input.token },
    include: { school: { select: { name: true } } },
  })) as ApplicationRecord | null

  if (!application) throw new InviteError("Convite inválido")
  if (!application.inviteTokenExpiresAt || application.inviteTokenExpiresAt <= new Date()) {
    throw new InviteError("Convite expirado")
  }
  if (application.inviteTokenUsedAt) throw new InviteError("Convite já utilizado")

  const hashedPassword = await hashPassword(input.password)
  const user = await ensureApplicationUser(tx, application, { hashedPassword })
  await ensureRoleRecord(tx, application, user.id)

  const claimed = await tx.application.updateMany({
    where: {
      id: application.id,
      inviteToken: input.token,
      inviteTokenUsedAt: null,
    },
    data: { inviteTokenUsedAt: new Date(), userId: user.id },
  })
  if (claimed.count !== 1) throw new InviteError("Convite já utilizado")

  return { user, application }
}

export async function acceptAccountInvite(input: { token: string; password: string }) {
  return prisma.$transaction((tx) => acceptAccountInviteInTx(tx, input))
}
