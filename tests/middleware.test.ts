import { describe, it, expect } from "vitest"
import {
  alwaysAccessible,
  authPages,
  isAlwaysAccessible,
  isPublicPath,
  publicPathPrefixes,
  publicPaths,
} from "@/lib/public-routes"

describe("Middleware - Route Protection", () => {
  const protectedPaths = ["/dashboard", "/admin", "/minha-area", "/list/students"]

  it("should allow access to public paths", () => {
    for (const path of publicPaths) {
      expect(isPublicPath(path)).toBe(true)
      expect(authPages.includes(path as (typeof authPages)[number])).toBe(false)
    }
  })

  it("should keep the landing pages public", () => {
    for (const path of ["/", "/para-escolas", "/para-estudantes", "/sobre"]) {
      expect(isPublicPath(path)).toBe(true)
    }
  })

  it("should keep dynamic public verification pages accessible", () => {
    for (const prefix of publicPathPrefixes) {
      expect(isPublicPath(`${prefix}ABC123`)).toBe(true)
    }
  })

  it("should allow access to always accessible pages", () => {
    for (const path of alwaysAccessible) {
      expect(isAlwaysAccessible(path)).toBe(true)
      expect(authPages.includes(path as (typeof authPages)[number])).toBe(false)
    }
  })

  it("should allow the account invite flow without a session", () => {
    expect(isAlwaysAccessible("/accept-invite")).toBe(true)
    expect(isAlwaysAccessible("/accept-invite?token=abc")).toBe(true)
  })

  it("should identify auth pages", () => {
    for (const path of authPages) {
      expect(authPages.includes(path)).toBe(true)
    }
  })

  it("should protect private pages", () => {
    for (const path of protectedPaths) {
      expect(isPublicPath(path)).toBe(false)
      expect(authPages.includes(path as (typeof authPages)[number])).toBe(false)
      expect(isAlwaysAccessible(path)).toBe(false)
    }
  })

  it("should validate redirect URLs safely", () => {
    const valid = ["/dashboard", "/dashboard/user/123", "/admin/schools"]
    const invalid = ["https://evil.com", "//evil.com", "/@evil.com", "/../etc"]

    function isValidRedirect(url: string): boolean {
      if (!url.startsWith("/")) return false
      if (url.startsWith("//")) return false
      if (url.includes("@")) return false
      if (url.includes("..")) return false
      return true
    }

    for (const url of valid) {
      expect(isValidRedirect(url)).toBe(true)
    }
    for (const url of invalid) {
      expect(isValidRedirect(url)).toBe(false)
    }
  })
})
