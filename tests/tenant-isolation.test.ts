import { describe, it, expect } from "vitest"
import { validateTenantAccess, getTenantContext } from "@/lib/security/tenant-guard"
import type { Session } from "next-auth"

describe("Tenant Isolation & Guard Security Tests", () => {
  it("should reject unauthenticated sessions", () => {
    const { error, context } = validateTenantAccess(null)
    expect(error).not.toBeNull()
    expect(context).toBeNull()
  })

  it("should reject sessions without schoolId", () => {
    const mockSession: Session = {
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "school_admin",
        schoolId: null,
        schoolStatus: null,
      },
      expires: "2026-12-31",
    }
    const { error, context } = validateTenantAccess(mockSession)
    expect(error).not.toBeNull()
    expect(context).toBeNull()
  })

  it("should reject sessions with pending or non-active school status for regular users", () => {
    const mockSession: Session = {
      user: {
        id: "user-1",
        email: "user@example.com",
        role: "school_admin",
        schoolId: "school-123",
        schoolStatus: "pendente",
      },
      expires: "2026-12-31",
    }
    const { error, context } = validateTenantAccess(mockSession)
    expect(error).not.toBeNull()
    expect(context).toBeNull()
  })

  it("should allow active school tenant sessions", () => {
    const mockSession: Session = {
      user: {
        id: "user-1",
        email: "admin@school.com",
        role: "school_admin",
        schoolId: "school-123",
        schoolStatus: "ativa",
        permissions: ["canManageStudents"],
      },
      expires: "2026-12-31",
    }
    const { error, context } = validateTenantAccess(mockSession)
    expect(error).toBeNull()
    expect(context).toEqual({
      schoolId: "school-123",
      userId: "user-1",
      role: "school_admin",
      permissions: ["canManageStudents"],
      schoolStatus: "ativa",
    })
  })

  it("should allow super_admin across all tenant boundaries", () => {
    const mockSession: Session = {
      user: {
        id: "super-1",
        email: "super@platform.com",
        role: "super_admin",
        schoolId: null,
        schoolStatus: null,
      },
      expires: "2026-12-31",
    }
    const { error, context } = validateTenantAccess(mockSession)
    expect(error).toBeNull()
    expect(context?.role).toBe("super_admin")
  })

  it("should extract tenant context properly with getTenantContext", () => {
    const mockSession: Session = {
      user: {
        id: "teacher-1",
        role: "teacher",
        schoolId: "school-abc",
        schoolStatus: "ativa",
      },
      expires: "2026-12-31",
    }
    const ctx = getTenantContext(mockSession)
    expect(ctx.schoolId).toBe("school-abc")
    expect(ctx.userId).toBe("teacher-1")
    expect(ctx.role).toBe("teacher")
  })

  it("should throw error in getTenantContext if schoolId missing", () => {
    const mockSession: Session = {
      user: {
        id: "user-without-school",
        role: "student",
        schoolId: null,
      },
      expires: "2026-12-31",
    }
    expect(() => getTenantContext(mockSession)).toThrowError("[TenantGuard] schoolId ausente na sessão")
  })
})
