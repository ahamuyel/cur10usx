import { describe, expect, it } from "vitest"
import { isTwoFactorVerifiedForSession } from "@/lib/two-factor-session"

describe("isTwoFactorVerifiedForSession", () => {
  const login = Date.parse("2026-11-20T10:00:00Z")

  it("rejects when the server never recorded a TOTP verification", () => {
    expect(isTwoFactorVerifiedForSession(null, login)).toBe(false)
    expect(isTwoFactorVerifiedForSession(undefined, login)).toBe(false)
  })

  it("rejects a verification from an earlier login", () => {
    const yesterday = new Date(login - 24 * 60 * 60 * 1000)
    expect(isTwoFactorVerifiedForSession(yesterday, login)).toBe(false)
  })

  it("rejects tokens without a valid authTime", () => {
    const now = new Date(login + 1000)
    expect(isTwoFactorVerifiedForSession(now, undefined)).toBe(false)
    expect(isTwoFactorVerifiedForSession(now, "123")).toBe(false)
    expect(isTwoFactorVerifiedForSession(now, Number.NaN)).toBe(false)
  })

  it("accepts a verification recorded after this login", () => {
    expect(isTwoFactorVerifiedForSession(new Date(login + 30_000), login)).toBe(true)
  })

  it("tolerates small clock skew", () => {
    expect(isTwoFactorVerifiedForSession(new Date(login - 2_000), login)).toBe(true)
    expect(isTwoFactorVerifiedForSession(new Date(login - 60_000), login)).toBe(false)
  })
})
