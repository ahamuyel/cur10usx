import { NextResponse } from "next/server"
import type { Session } from "next-auth"

export interface TenantContext {
  schoolId: string
  userId: string
  role: string
  permissions: string[]
  schoolStatus: string | null
}

/**
 * Extracts and verifies the Tenant Context from a valid NextAuth session.
 * Throws an explicit Error if schoolId or userId is missing.
 */
export function getTenantContext(session: Session): TenantContext {
  if (!session?.user?.id) {
    throw new Error("[TenantGuard] User ID ausente na sessão")
  }
  const schoolId = session.user.schoolId
  if (!schoolId) {
    throw new Error("[TenantGuard] schoolId ausente na sessão")
  }

  return {
    schoolId,
    userId: session.user.id,
    role: session.user.role || "student",
    permissions: session.user.permissions || [],
    schoolStatus: session.user.schoolStatus || null,
  }
}

/**
 * Validates that the request has an active school tenant context.
 * Returns a NextResponse 403 error if the tenant context is invalid or school is inactive.
 */
export function validateTenantAccess(session: Session | null): { error: NextResponse | null; context: TenantContext | null } {
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
      context: null,
    }
  }

  if (session.user.role === "super_admin") {
    return {
      error: null,
      context: {
        schoolId: session.user.schoolId || "system",
        userId: session.user.id,
        role: "super_admin",
        permissions: session.user.permissions || [],
        schoolStatus: "ativa",
      },
    }
  }

  const schoolId = session.user.schoolId
  if (!schoolId) {
    return {
      error: NextResponse.json({ error: "Escola não associada" }, { status: 403 }),
      context: null,
    }
  }

  if (session.user.schoolStatus !== "ativa") {
    return {
      error: NextResponse.json({ error: "Escola não ativa ou pendente de aprovação" }, { status: 403 }),
      context: null,
    }
  }

  return {
    error: null,
    context: {
      schoolId,
      userId: session.user.id,
      role: session.user.role || "student",
      permissions: session.user.permissions || [],
      schoolStatus: session.user.schoolStatus,
    },
  }
}
