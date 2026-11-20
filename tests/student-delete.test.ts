import { describe, it, expect, vi } from "vitest"
import { readFileSync } from "node:fs"
import path from "node:path"
import { deleteStudentById } from "@/lib/student-actions"

describe("Student list deletion fix", () => {
  it("calls DELETE /api/students/{id} and never /api/classes/{id}", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }) as unknown as typeof fetch

    const result = await deleteStudentById("stu_123", mockFetch)

    expect(result).toEqual({ ok: true })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith("/api/students/stu_123", {
      method: "DELETE",
    })
  })

  it("propagates server error message on failure", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Sem permissão para esta ação" }),
    }) as unknown as typeof fetch

    const result = await deleteStudentById("stu_123", mockFetch)

    expect(result).toEqual({
      ok: false,
      error: "Sem permissão para esta ação",
    })
  })

  it("rejects empty student id without calling fetch", async () => {
    const mockFetch = vi.fn() as unknown as typeof fetch

    const result = await deleteStudentById("   ", mockFetch)

    expect(result.ok).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("list/students/page.tsx uses deleteStudentById and does not DELETE /api/classes", () => {
    const pagePath = path.resolve(
      process.cwd(),
      "src/app/(dashboard)/list/students/page.tsx"
    )
    const source = readFileSync(pagePath, "utf-8")

    expect(source).toContain("deleteStudentById")
    expect(source).not.toMatch(/\/api\/classes\/.*DELETE/)
  })
})
