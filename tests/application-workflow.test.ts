import { describe, it, expect, vi } from "vitest"
import {
  acceptAccountInviteInTx,
  createAccountInviteInTx,
  INVITE_TTL_MS,
  InviteError,
} from "@/lib/account-invite"
import type { WorkflowActor } from "@/lib/application-workflow"
import {
  approveApplicationInTx,
  enrollApplicationInTx,
  hireApplicationInTx,
  rejectApplicationInTx,
  resendInviteInTx,
  WorkflowError,
} from "@/lib/application-workflow"

type Tx = Parameters<typeof approveApplicationInTx>[0]

const actor: WorkflowActor = {
  userId: "admin-1",
  userName: "Admin",
  userRole: "school_admin",
  schoolId: "school-1",
  ipAddress: "127.0.0.1",
}

const baseApplication = {
  id: "app-1",
  name: "Ana Silva",
  email: "ana@example.com",
  phone: "912345678",
  role: "student" as const,
  status: "aprovada" as const,
  message: null,
  rejectReason: null,
  trackingToken: "track-1",
  schoolId: "school-1",
  userId: null,
  gender: null,
  documentType: null,
  documentNumber: null,
  dateOfBirth: null,
  desiredGrade: null,
  desiredCourseId: null,
  inviteToken: null,
  inviteTokenExpiresAt: null,
  inviteTokenUsedAt: null,
  inviteSentAt: null,
  approvedAt: null,
  hiredAt: null,
  enrolledAt: null,
  rejectedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  school: { id: "school-1", name: "Escola Exemplo" },
}

function makeTx(overrides: Record<string, unknown> = {}) {
  const app = { ...baseApplication, ...overrides } as Record<string, any>
  const state: Record<string, any> = {
    user: null,
    student: null,
    teacher: null,
    parent: null,
    adminPermission: null,
    enrollment: null,
  }
  const calls: Record<string, any[]> = { auditLogs: [], notifications: [] }

  const tx = {
    application: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id && where.id !== app.id) return null
        if (where.inviteToken && where.inviteToken !== app.inviteToken) return null
        return { ...app }
      }),
      update: vi.fn(async ({ data }: any) => {
        Object.assign(app, data)
        return app
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const tokenMatches = !where.inviteToken || where.inviteToken === app.inviteToken
        const notUsed =
          !("inviteTokenUsedAt" in where) ||
          (where.inviteTokenUsedAt === null ? app.inviteTokenUsedAt === null : true)
        if (!tokenMatches || !notUsed) return { count: 0 }
        Object.assign(app, data)
        return { count: 1 }
      }),
    },
    user: {
      findUnique: vi.fn(async () => state.user),
      create: vi.fn(async ({ data }: any) => {
        state.user = { id: "user-1", sessionVersion: 0, ...data }
        return state.user
      }),
      update: vi.fn(async ({ data }: any) => {
        const increment =
          data.sessionVersion && typeof data.sessionVersion === "object"
            ? (state.user.sessionVersion ?? 0) + 1
            : data.sessionVersion
        state.user = {
          ...state.user,
          ...data,
          ...(data.sessionVersion && typeof data.sessionVersion === "object"
            ? { sessionVersion: increment }
            : {}),
        }
        return state.user
      }),
    },
    student: {
      findFirst: vi.fn(async () => state.student),
      create: vi.fn(async ({ data }: any) => {
        state.student = { id: "student-1", ...data }
        return state.student
      }),
      update: vi.fn(async ({ data }: any) => {
        state.student = { ...state.student, ...data }
        return state.student
      }),
    },
    teacher: {
      findFirst: vi.fn(async () => state.teacher),
      create: vi.fn(async ({ data }: any) => {
        state.teacher = { id: "teacher-1", ...data }
        return state.teacher
      }),
    },
    parent: {
      findFirst: vi.fn(async () => state.parent),
      create: vi.fn(async ({ data }: any) => {
        state.parent = { id: "parent-1", ...data }
        return state.parent
      }),
    },
    adminPermission: {
      upsert: vi.fn(async ({ create, update }: any) => {
        state.adminPermission = { ...create, ...update }
        return state.adminPermission
      }),
    },
    academicYear: {
      findFirst: vi.fn(async () => ({ id: "year-1" })),
    },
    enrollment: {
      findUnique: vi.fn(async () => state.enrollment),
      create: vi.fn(async ({ data }: any) => {
        state.enrollment = { id: "enrollment-1", ...data }
        return state.enrollment
      }),
    },
    auditLog: {
      create: vi.fn(async ({ data }: any) => {
        calls.auditLogs.push(data)
        return { id: `audit-${calls.auditLogs.length}`, ...data }
      }),
    },
    notification: {
      create: vi.fn(async ({ data }: any) => {
        calls.notifications.push(data)
        return { id: `notification-${calls.notifications.length}`, ...data }
      }),
    },
  }

  return { tx: tx as unknown as Tx, app, state, calls }
}

describe("Application workflow", () => {
  it("approves a pending application with audit log and notification", async () => {
    const { tx, app, calls } = makeTx({ status: "pendente", userId: "existing-user" })

    const result = await approveApplicationInTx(tx, { applicationId: app.id, actor })

    expect(result.status).toBe("aprovada")
    expect(app.status).toBe("aprovada")
    expect(app.approvedAt).toBeInstanceOf(Date)
    expect(app.rejectReason).toBeNull()
    expect(calls.auditLogs).toHaveLength(1)
    expect(calls.auditLogs[0]).toMatchObject({
      action: "UPDATE",
      entity: "Application",
      entityId: app.id,
      schoolId: "school-1",
      description: "Solicitação aprovada",
      oldValue: { status: "pendente" },
      newValue: { status: "aprovada" },
      ipAddress: "127.0.0.1",
    })
    expect(calls.notifications).toHaveLength(1)
    expect(calls.notifications[0]).toMatchObject({
      userId: "existing-user",
      title: "Solicitação aprovada",
      type: "application",
    })
  })

  it("enrolls an approved application, creates records and issues a 48h invite", async () => {
    const { tx, app, state, calls } = makeTx()

    const result = await enrollApplicationInTx(tx, {
      applicationId: app.id,
      actor,
      classId: "class-1",
    })

    expect(result.status).toBe("matriculada")
    expect(app.status).toBe("matriculada")
    expect(app.enrolledAt).toBeInstanceOf(Date)
    expect(state.user).toMatchObject({
      email: "ana@example.com",
      role: "student",
      schoolId: "school-1",
      isActive: true,
    })
    expect(state.user.hashedPassword).toBeNull()
    expect(state.student).toMatchObject({ userId: "user-1", classId: "class-1" })
    expect(state.enrollment).toMatchObject({
      studentId: "student-1",
      classId: "class-1",
      academicYearId: "year-1",
    })
    expect(app.inviteToken).toBe(result.inviteToken)
    expect(app.inviteSentAt).toBeInstanceOf(Date)
    expect(
      app.inviteTokenExpiresAt.getTime() - app.inviteSentAt.getTime()
    ).toBe(INVITE_TTL_MS)
    expect(calls.auditLogs[0].description).toBe("Matrícula concluída")
    expect(calls.notifications[0]).toMatchObject({
      userId: "user-1",
      title: "Matrícula confirmada",
    })
  })

  it("hires an approved teacher and marks the application as contratada", async () => {
    const { tx, app, state, calls } = makeTx({ role: "teacher" })

    const result = await hireApplicationInTx(tx, { applicationId: app.id, actor })

    expect(result.status).toBe("contratada")
    expect(app.status).toBe("contratada")
    expect(app.hiredAt).toBeInstanceOf(Date)
    expect(state.teacher).toMatchObject({ userId: "user-1", schoolId: "school-1" })
    expect(result.inviteToken).toBeTruthy()
    expect(calls.auditLogs[0]).toMatchObject({
      description: "Contratação concluída",
      newValue: { status: "contratada" },
    })
    expect(calls.notifications[0]).toMatchObject({
      title: "Contratação confirmada",
      userId: "user-1",
    })
  })

  it("does not allow hiring a student", async () => {
    const { tx, app } = makeTx()

    await expect(
      hireApplicationInTx(tx, { applicationId: app.id, actor })
    ).rejects.toThrow(WorkflowError)
  })

  it("rejects a pending application, clears invite data and notifies", async () => {
    const { tx, app, calls } = makeTx({
      status: "pendente",
      userId: "existing-user",
      inviteToken: "old-token",
      inviteTokenExpiresAt: new Date(),
    })

    const result = await rejectApplicationInTx(tx, {
      applicationId: app.id,
      actor,
      reason: "Perfil não correspondente",
    })

    expect(result.status).toBe("rejeitada")
    expect(app.status).toBe("rejeitada")
    expect(app.rejectReason).toBe("Perfil não correspondente")
    expect(app.rejectedAt).toBeInstanceOf(Date)
    expect(app.inviteToken).toBeNull()
    expect(app.inviteTokenExpiresAt).toBeNull()
    expect(app.inviteTokenUsedAt).toBeNull()
    expect(calls.auditLogs[0].description).toBe("Solicitação rejeitada")
    expect(calls.notifications[0]).toMatchObject({ title: "Solicitação não aprovada" })
  })

  it("accepts an invite once and rejects a second use", async () => {
    const { tx, app, state } = makeTx({ status: "matriculada" })
    await createAccountInviteInTx(tx, app.id)
    const token = app.inviteToken

    const first = await acceptAccountInviteInTx(tx, {
      token,
      password: "Password123",
    })

    expect(first.user.hashedPassword).toBeTruthy()
    expect(first.user.hashedPassword).not.toBe("Password123")
    expect(app.inviteTokenUsedAt).toBeInstanceOf(Date)
    expect(app.userId).toBe("user-1")

    await expect(
      acceptAccountInviteInTx(tx, { token, password: "Password123" })
    ).rejects.toThrow(InviteError)
  })

  it("rejects an expired invite", async () => {
    const now = Date.now()
    const { tx, app } = makeTx({
      status: "contratada",
      inviteToken: "expired-token",
      inviteTokenExpiresAt: new Date(now - 1000),
    })

    await expect(
      acceptAccountInviteInTx(tx, {
        token: "expired-token",
        password: "Password123",
      })
    ).rejects.toThrow("Convite expirado")
  })

  it("resends an invite with a new token and a fresh 48h validity", async () => {
    const { tx, app, calls } = makeTx({ status: "contratada", userId: "user-1" })
    await createAccountInviteInTx(tx, app.id)
    const firstToken = app.inviteToken
    const firstSentAt = app.inviteSentAt

    const result = await resendInviteInTx(tx, { applicationId: app.id, actor })

    expect(result.inviteToken).toBeTruthy()
    expect(result.inviteToken).not.toBe(firstToken)
    expect(app.inviteToken).toBe(result.inviteToken)
    expect(app.inviteSentAt.getTime()).toBeGreaterThanOrEqual(firstSentAt.getTime())
    expect(app.inviteTokenUsedAt).toBeNull()
    expect(
      app.inviteTokenExpiresAt.getTime() - app.inviteSentAt.getTime()
    ).toBe(INVITE_TTL_MS)
    expect(calls.auditLogs[0].description).toBe("Convite reenviado")
    expect(calls.notifications[0]).toMatchObject({ title: "Convite reenviado" })

    await expect(
      acceptAccountInviteInTx(tx, { token: firstToken, password: "Password123" })
    ).rejects.toThrow("Convite inválido")
  })
})
