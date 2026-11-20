import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockAuth, mockPrisma } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockPrisma: {
    student: { findUnique: vi.fn() },
    parent: { findFirst: vi.fn() },
    teacher: { findFirst: vi.fn() },
    result: { findMany: vi.fn() },
    attendance: { findMany: vi.fn() },
  },
}))

vi.mock("@/lib/auth", () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

import { GET } from "@/app/api/students/[id]/portfolio/route"

function makeStudent(overrides: Record<string, unknown> = {}) {
  return {
    id: "stu-1",
    name: "Ana Silva",
    email: "ana@escola.ao",
    phone: "+244900000001",
    foto: null,
    gender: "feminino",
    dateOfBirth: new Date("2010-05-10"),
    documentType: "BI",
    documentNumber: "00123456LA012",
    classId: "class-1",
    userId: "user-stu-1",
    schoolId: "school-1",
    class: { id: "class-1", name: "10ª A", grade: 10, period: "regular" },
    school: { id: "school-1", name: "Colégio Angola", city: "Luanda", logo: null },
    ...overrides,
  }
}

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: {
      id: "user-admin-1",
      role: "school_admin",
      isActive: true,
      emailVerified: true,
      twoFactorEnabled: false,
      twoFactorVerifiedAt: null,
      schoolId: "school-1",
      schoolStatus: "ativa",
      ...overrides,
    },
  }
}

describe("GET /api/students/[id]/portfolio — requireRole, 2FA, tenant & RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.result.findMany.mockResolvedValue([])
    mockPrisma.attendance.findMany.mockResolvedValue([])
  })

  it("rejects unauthenticated requests with 401", async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(401)
  })

  it("rejects inactive user accounts with 403", async () => {
    mockAuth.mockResolvedValue(makeSession({ isActive: false }))
    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(403)
    expect(mockPrisma.student.findUnique).not.toHaveBeenCalled()
  })

  it("rejects users with 2FA enabled but not verified with 403", async () => {
    mockAuth.mockResolvedValue(
      makeSession({ twoFactorEnabled: true, twoFactorVerifiedAt: null })
    )
    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toContain("dois passos")
    expect(mockPrisma.student.findUnique).not.toHaveBeenCalled()
  })

  it("blocks cross-tenant access with 404", async () => {
    mockAuth.mockResolvedValue(makeSession({ schoolId: "school-2" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent({ schoolId: "school-1" }))

    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(404)
  })

  it("blocks a teacher who does NOT teach the student's class with 403", async () => {
    mockAuth.mockResolvedValue(makeSession({ id: "user-t1", role: "teacher" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent({ classId: "class-1" }))
    mockPrisma.teacher.findFirst.mockResolvedValue({
      teacherClasses: [{ classId: "class-2" }],
    })

    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(403)
  })

  it("blocks a teacher when student has no class assigned with 403", async () => {
    mockAuth.mockResolvedValue(makeSession({ id: "user-t1", role: "teacher" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent({ classId: null, class: null }))
    mockPrisma.teacher.findFirst.mockResolvedValue({
      teacherClasses: [{ classId: "class-1" }],
    })

    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(403)
  })

  it("allows a teacher who teaches the student's class with 200", async () => {
    mockAuth.mockResolvedValue(
      makeSession({
        id: "user-t1",
        role: "teacher",
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date().toISOString(),
      })
    )
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent({ classId: "class-1" }))
    mockPrisma.teacher.findFirst.mockResolvedValue({
      teacherClasses: [{ classId: "class-1" }],
    })

    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.student.id).toBe("stu-1")
  })

  it("blocks a student accessing another student's portfolio and allows own portfolio", async () => {
    mockAuth.mockResolvedValue(makeSession({ id: "user-other", role: "student" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent({ userId: "user-stu-1" }))

    const denied = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(denied.status).toBe(403)

    mockAuth.mockResolvedValue(makeSession({ id: "user-stu-1", role: "student" }))
    const allowed = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(allowed.status).toBe(200)
  })

  it("scopes parent access to linked children within the same school", async () => {
    mockAuth.mockResolvedValue(makeSession({ id: "user-p1", role: "parent" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent())
    mockPrisma.parent.findFirst.mockResolvedValue({ students: [{ id: "stu-other" }] })

    const denied = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(denied.status).toBe(403)
    expect(mockPrisma.parent.findFirst).toHaveBeenCalledWith({
      where: { userId: "user-p1", schoolId: "school-1" },
      select: { students: { select: { id: true } } },
    })

    mockPrisma.parent.findFirst.mockResolvedValue({ students: [{ id: "stu-1" }] })
    const allowed = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(allowed.status).toBe(200)
  })

  it("allows school_admin for students in the same school", async () => {
    mockAuth.mockResolvedValue(makeSession({ role: "school_admin" }))
    mockPrisma.student.findUnique.mockResolvedValue(makeStudent())

    const res = await GET(new Request("http://localhost/api/students/stu-1/portfolio"), {
      params: Promise.resolve({ id: "stu-1" }),
    })
    expect(res.status).toBe(200)
  })
})
