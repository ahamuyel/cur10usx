import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  applyRounding,
  calculateTrimesterAverage,
  calculateFinalAverage,
  determineStatus,
  resolveGradingConfig,
  evaluateStudent,
  evaluateClass,
} from "@/lib/evaluation-engine"

// ─── Pure Functions ─────────────────────────────────────────────────

describe("applyRounding", () => {
  it("should round to nearest", () => {
    expect(applyRounding(14.567, "arredondar", 1)).toBe(14.6)
    expect(applyRounding(14.567, "arredondar", 2)).toBe(14.57)
    expect(applyRounding(14.5, "arredondar", 0)).toBe(15)
  })

  it("should truncate", () => {
    expect(applyRounding(14.567, "truncar", 1)).toBe(14.5)
    expect(applyRounding(14.999, "truncar", 1)).toBe(14.9)
  })

  it("should ceil", () => {
    expect(applyRounding(14.1, "teto", 0)).toBe(15)
    expect(applyRounding(14.001, "teto", 1)).toBe(14.1)
  })
})

describe("calculateTrimesterAverage", () => {
  it("should return null for empty results", () => {
    expect(calculateTrimesterAverage([], null, "arredondar", 1)).toBeNull()
  })

  it("should calculate simple average without formula", () => {
    const results = [
      { score: 14, type: "Prova" },
      { score: 16, type: "Prova" },
      { score: 18, type: "Trabalho" },
    ]
    expect(calculateTrimesterAverage(results, null, "arredondar", 1)).toBe(16)
  })

  it("should calculate weighted average using formula", () => {
    const results = [
      { score: 12, type: "Prova" },
      { score: 18, type: "Trabalho" },
    ]
    const formula = { prova: 0.6, trabalho: 0.4 }
    const avg = calculateTrimesterAverage(results, formula, "arredondar", 1)
    expect(avg).toBeCloseTo((12 * 0.6 + 18 * 0.4) / (0.6 + 0.4), 1)
  })

  it("should fallback to simple average when formula types dont match", () => {
    const results = [
      { score: 14, type: "Prova" },
      { score: 16, type: "Trabalho" },
    ]
    const formula = { participacao: 1.0 }
    expect(calculateTrimesterAverage(results, formula, "arredondar", 1)).toBe(15)
  })
})

describe("calculateFinalAverage", () => {
  it("should return null when no valid trimesters", () => {
    expect(calculateFinalAverage([null, null, null], [0.33, 0.33, 0.34], "arredondar", 1)).toBeNull()
  })

  it("should apply weighted formula with 3 trimesters", () => {
    const avg = calculateFinalAverage([12, 14, 16], [0.33, 0.33, 0.34], "arredondar", 1)
    const expected = (12 * 0.33 + 14 * 0.33 + 16 * 0.34) / (0.33 + 0.33 + 0.34)
    expect(avg).toBeCloseTo(expected, 1)
  })

  it("should use simple average with 2 trimesters", () => {
    const avg = calculateFinalAverage([12, 14, null], [0.33, 0.33, 0.34], "arredondar", 1)
    expect(avg).toBe(13)
  })
})

describe("determineStatus", () => {
  const defaultConfig = {
    trimesterWeights: [0.33, 0.33, 0.34],
    passingGrade: 10,
    resourceMinGrade: 8,
    maxFailedSubjects: 2,
    trimesterFormula: null,
    finalFormula: null,
    directFailGrade: null,
    roundingMode: "arredondar" as const,
    roundingScale: 1,
    recursoAllowed: true,
  }

  it("should approve when all subjects pass", () => {
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 14, passed: true, inRecurso: false },
    ]
    expect(determineStatus(results, defaultConfig).status).toBe("aprovada")
  })

  it("should fail when no grades", () => {
    expect(determineStatus([], defaultConfig).status).toBe("reprovada")
  })

  it("should flag recurso when within limits", () => {
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 9, passed: false, inRecurso: true },
      { subjectId: "2", subjectName: "Fis", t1: null, t2: null, t3: null, finalAverage: 15, passed: true, inRecurso: false },
    ]
    expect(determineStatus(results, defaultConfig).status).toBe("em_recurso")
  })

  it("should fail when too many failed subjects", () => {
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 9, passed: false, inRecurso: true },
      { subjectId: "2", subjectName: "Fis", t1: null, t2: null, t3: null, finalAverage: 8, passed: false, inRecurso: true },
      { subjectId: "3", subjectName: "Qui", t1: null, t2: null, t3: null, finalAverage: 7, passed: false, inRecurso: true },
    ]
    expect(determineStatus(results, defaultConfig).status).toBe("reprovada")
  })

  it("should fail on direct fail grade", () => {
    const config = { ...defaultConfig, directFailGrade: 6 }
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 5, passed: false, inRecurso: false },
    ]
    expect(determineStatus(results, config).status).toBe("reprovada")
  })

  it("should fail when recurso not allowed", () => {
    const config = { ...defaultConfig, recursoAllowed: false }
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 9, passed: false, inRecurso: true },
    ]
    expect(determineStatus(results, config).status).toBe("reprovada")
  })

  it("should fail when subject is not recurso-eligible (below resourceMinGrade)", () => {
    const results = [
      { subjectId: "1", subjectName: "Mat", t1: null, t2: null, t3: null, finalAverage: 5, passed: false, inRecurso: false },
    ]
    expect(determineStatus(results, defaultConfig).status).toBe("reprovada")
  })
})

// ─── Integration (mocked Prisma) ────────────────────────────────────

vi.mock("@/lib/prisma", () => ({
  prisma: {
    gradingConfig: { findMany: vi.fn() },
    globalGradingConfig: { findMany: vi.fn() },
    enrollment: { findFirst: vi.fn(), findMany: vi.fn() },
    result: { findMany: vi.fn() },
    courseSubject: { findMany: vi.fn() },
  },
}))

const { prisma } = await import("@/lib/prisma")

describe("resolveGradingConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return school config when found", async () => {
    vi.mocked(prisma.gradingConfig.findMany).mockResolvedValue([
      {
        id: "cfg1",
        schoolId: "school1",
        academicYearId: "year1",
        classGrade: 10,
        courseId: null,
        trimesterWeights: [0.3, 0.3, 0.4],
        passingGrade: 10,
        resourceMinGrade: 8,
        maxFailedSubjects: 2,
        trimesterFormula: null,
        finalFormula: null,
        directFailGrade: null,
        roundingMode: "arredondar",
        roundingScale: 1,
        recursoAllowed: true,
        globalGradingConfigId: null,
        overrides: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        academicYearId: "year1",
        globalGradingConfig: null,
      },
    ])

    const config = await resolveGradingConfig("school1", "year1", 10)
    expect(config.passingGrade).toBe(10)
    expect(config.trimesterWeights).toEqual([0.3, 0.3, 0.4])
  })

  it("should fallback to Angola defaults when no configs exist", async () => {
    vi.mocked(prisma.gradingConfig.findMany).mockResolvedValue([])
    vi.mocked(prisma.globalGradingConfig.findMany).mockResolvedValue([])

    const config = await resolveGradingConfig("school1", "year1")
    expect(config.passingGrade).toBe(10)
    expect(config.trimesterWeights).toEqual([0.33, 0.33, 0.34])
  })
})

describe("evaluateStudent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return null when no enrollment found", async () => {
    vi.mocked(prisma.enrollment.findFirst).mockResolvedValue(null)
    const result = await evaluateStudent("student1", "year1", "school1")
    expect(result).toBeNull()
  })

  it("should calculate evaluation correctly", async () => {
    vi.mocked(prisma.enrollment.findFirst).mockResolvedValue({
      id: "enroll1",
      studentId: "student1",
      classId: "class1",
      academicYearId: "year1",
      schoolId: "school1",
      status: "ativa",
      finalAverage: null,
      failedSubjects: null,
      observation: null,
      decidedAt: null,
      enrolledAt: new Date(),
      student: { id: "student1", name: "João" },
      class: { id: "class1", grade: 10, courseId: "course1" },
    } as any)

    vi.mocked(prisma.gradingConfig.findMany).mockResolvedValue([])
    vi.mocked(prisma.globalGradingConfig.findMany).mockResolvedValue([])

    vi.mocked(prisma.result.findMany).mockResolvedValue([
      { id: "r1", score: 14, type: "Prova", date: new Date(), trimester: "primeiro", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
      { id: "r2", score: 15, type: "Prova", date: new Date(), trimester: "segundo", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
      { id: "r3", score: 16, type: "Prova", date: new Date(), trimester: "terceiro", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    vi.mocked(prisma.courseSubject.findMany).mockResolvedValue([
      { id: "cs1", courseId: "course1", subjectId: "subj1", course: { id: "course1", name: "Curso A" }, subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    const result = await evaluateStudent("student1", "year1", "school1")
    expect(result).not.toBeNull()
    expect(result!.studentId).toBe("student1")
    expect(result!.studentName).toBe("João")
    expect(result!.grade).toBe(10)
    expect(result!.subjectResults).toHaveLength(1)
    expect(result!.subjectResults[0].subjectName).toBe("Matemática")
    expect(result!.subjectResults[0].t1).toBeCloseTo(14, 0)
    expect(result!.subjectResults[0].t2).toBeCloseTo(15, 0)
    expect(result!.subjectResults[0].t3).toBeCloseTo(16, 0)
    expect(result!.subjectResults[0].passed).toBe(true)
    expect(result!.status).toBe("aprovada")
  })

  it("should mark as failed when below passing grade", async () => {
    vi.mocked(prisma.enrollment.findFirst).mockResolvedValue({
      id: "enroll1",
      studentId: "student1",
      classId: "class1",
      academicYearId: "year1",
      schoolId: "school1",
      status: "ativa",
      finalAverage: null,
      failedSubjects: null,
      observation: null,
      decidedAt: null,
      enrolledAt: new Date(),
      student: { id: "student1", name: "Maria" },
      class: { id: "class1", grade: 10, courseId: "course1" },
    } as any)

    vi.mocked(prisma.gradingConfig.findMany).mockResolvedValue([])
    vi.mocked(prisma.globalGradingConfig.findMany).mockResolvedValue([])

    vi.mocked(prisma.result.findMany).mockResolvedValue([
      { id: "r1", score: 5, type: "Prova", date: new Date(), trimester: "primeiro", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    vi.mocked(prisma.courseSubject.findMany).mockResolvedValue([
      { id: "cs1", courseId: "course1", subjectId: "subj1", course: { id: "course1", name: "Curso A" }, subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    const result = await evaluateStudent("student1", "year1", "school1")
    expect(result).not.toBeNull()
    expect(result!.status).toBe("reprovada")
    expect(result!.subjectResults[0].passed).toBe(false)
  })
})

describe("evaluateClass (batched)", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should evaluate all students and return correct counts", async () => {
    vi.mocked(prisma.enrollment.findMany).mockResolvedValue([
      {
        id: "enroll1",
        studentId: "student1",
        classId: "class1",
        academicYearId: "year1",
        schoolId: "school1",
        status: "ativa",
        finalAverage: null,
        failedSubjects: null,
        observation: null,
        decidedAt: null,
        enrolledAt: new Date(),
        student: { id: "student1", name: "João" },
        class: { id: "class1", grade: 10, courseId: "course1" },
      },
      {
        id: "enroll2",
        studentId: "student2",
        classId: "class1",
        academicYearId: "year1",
        schoolId: "school1",
        status: "ativa",
        finalAverage: null,
        failedSubjects: null,
        observation: null,
        decidedAt: null,
        enrolledAt: new Date(),
        student: { id: "student2", name: "Maria" },
        class: { id: "class1", grade: 10, courseId: "course1" },
      },
    ] as any)

    vi.mocked(prisma.gradingConfig.findMany).mockResolvedValue([])
    vi.mocked(prisma.globalGradingConfig.findMany).mockResolvedValue([])

    vi.mocked(prisma.result.findMany).mockResolvedValue([
      { id: "r1", score: 14, type: "Prova", date: new Date(), trimester: "primeiro", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
      { id: "r2", score: 15, type: "Prova", date: new Date(), trimester: "segundo", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
      { id: "r3", score: 16, type: "Prova", date: new Date(), trimester: "terceiro", studentId: "student1", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
      { id: "r4", score: 5, type: "Prova", date: new Date(), trimester: "primeiro", studentId: "student2", subjectId: "subj1", examId: null, assignmentId: null, academicYear: null, academicYearId: "year1", schoolId: "school1", subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    vi.mocked(prisma.courseSubject.findMany).mockResolvedValue([
      { id: "cs1", courseId: "course1", subjectId: "subj1", course: { id: "course1", name: "Curso A" }, subject: { id: "subj1", name: "Matemática" } },
    ] as any)

    const evaluations = await evaluateClass("class1", "year1", "school1")
    expect(evaluations).toHaveLength(2)

    const joao = evaluations.find((e) => e.studentName === "João")
    const maria = evaluations.find((e) => e.studentName === "Maria")
    expect(joao).toBeDefined()
    expect(maria).toBeDefined()
    expect(joao!.status).toBe("aprovada")
    expect(maria!.status).toBe("reprovada")
  })
})
