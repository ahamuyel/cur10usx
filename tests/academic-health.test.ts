import { describe, it, expect } from "vitest"
import {
  getHealthStatus,
  calculateAcademicPerformance,
  calculateAttendancePercentage,
  calculateSubmissionRate,
  calculateGlobalHealthScore,
  calculateClassHealthScore,
  calculateStudentRiskScore,
} from "@/lib/score"

describe("Academic Scoring & Health Engine", () => {
  describe("getHealthStatus", () => {
    it("returns Excelente for score >= 90", () => {
      expect(getHealthStatus(95)).toBe("Excelente")
      expect(getHealthStatus(90)).toBe("Excelente")
    })

    it("returns Boa for 75 <= score < 90", () => {
      expect(getHealthStatus(89)).toBe("Boa")
      expect(getHealthStatus(75)).toBe("Boa")
    })

    it("returns Atenção for 60 <= score < 75", () => {
      expect(getHealthStatus(74)).toBe("Atenção")
      expect(getHealthStatus(60)).toBe("Atenção")
    })

    it("returns Crítica for score < 60", () => {
      expect(getHealthStatus(59)).toBe("Crítica")
      expect(getHealthStatus(0)).toBe("Crítica")
    })
  })

  describe("calculateAcademicPerformance", () => {
    it("converts 0-20 grade scale to 0-100 percentage", () => {
      expect(calculateAcademicPerformance(20)).toBe(100)
      expect(calculateAcademicPerformance(10)).toBe(50)
      expect(calculateAcademicPerformance(14)).toBe(70)
      expect(calculateAcademicPerformance(0)).toBe(0)
    })

    it("handles edge cases and bounds", () => {
      expect(calculateAcademicPerformance(-5)).toBe(0)
      expect(calculateAcademicPerformance(25)).toBe(100)
    })
  })

  describe("calculateAttendancePercentage", () => {
    it("calculates presence + tardiness out of total attendance", () => {
      // 80 presente, 10 atrasado out of 100 total = 90%
      expect(calculateAttendancePercentage(80, 10, 100)).toBe(90)
    })

    it("returns 0 when total attendance is 0", () => {
      expect(calculateAttendancePercentage(0, 0, 0)).toBe(0)
    })
  })

  describe("calculateSubmissionRate", () => {
    it("calculates percentage of completed submissions", () => {
      expect(calculateSubmissionRate(15, 20)).toBe(75)
    })

    it("returns 0 when total is 0", () => {
      expect(calculateSubmissionRate(0, 0)).toBe(0)
    })
  })

  describe("calculateGlobalHealthScore (40/30/20/10 spec)", () => {
    it("applies exact weight distribution: 40% performance, 30% attendance, 20% activity, 10% admin", () => {
      const breakdown = {
        academicPerformance: 100, // 40
        attendance: 100,          // 30
        schoolActivity: 100,      // 20
        administrativeEfficiency: 100, // 10
      }
      expect(calculateGlobalHealthScore(breakdown)).toBe(100)

      const mixedBreakdown = {
        academicPerformance: 50,  // 20
        attendance: 80,           // 24
        schoolActivity: 60,       // 12
        administrativeEfficiency: 90, // 9
      }
      // 20 + 24 + 12 + 9 = 65
      expect(calculateGlobalHealthScore(mixedBreakdown)).toBe(65)
    })
  })

  describe("calculateClassHealthScore", () => {
    it("combines performance (40%), attendance (30%), and activity (30%)", () => {
      expect(calculateClassHealthScore(80, 80, 80)).toBe(80)
    })
  })

  describe("calculateStudentRiskScore", () => {
    it("computes inverted risk score", () => {
      // High performance (100%), high attendance (100%), high submissions (100%) -> Risk 0
      expect(calculateStudentRiskScore(100, 100, 100)).toBe(0)
      // Low performance (0%), low attendance (0%), low submissions (0%) -> Risk 100
      expect(calculateStudentRiskScore(0, 0, 0)).toBe(100)
    })
  })
})
