/**
 * Centralized Academic Scoring & Health Calculations
 * Aligned with product specification (40/30/20/10)
 */

export interface MetricBreakdown {
  academicPerformance: number // 40%
  attendance: number          // 30%
  schoolActivity: number      // 20% (participation / submissions)
  administrativeEfficiency: number // 10%
}

/**
 * Standard health status classification based on score
 */
export function getHealthStatus(score: number): string {
  if (score >= 90) return "Excelente"
  if (score >= 75) return "Boa"
  if (score >= 60) return "Atenção"
  return "Crítica"
}

/**
 * Normalizes an average grade (0 to 20 scale in Angola system) to a 0-100 percentage.
 */
export function calculateAcademicPerformance(averageGrade: number): number {
  if (averageGrade <= 0) return 0
  const percentage = (averageGrade / 20) * 100
  return Math.min(100, Math.max(0, Math.round(percentage)))
}

/**
 * Standardized attendance rate calculation across all modules.
 * Counts presence and tardiness (atrasado) consistently.
 */
export function calculateAttendancePercentage(
  presente: number,
  atrasado: number,
  totalAttendance: number
): number {
  if (totalAttendance <= 0) return 0
  const rate = ((presente + atrasado) / totalAttendance) * 100
  return Math.min(100, Math.max(0, Math.round(rate)))
}

/**
 * Calculates submission / activity completion rate (0-100).
 */
export function calculateSubmissionRate(submittedCount: number, totalSubmissions: number): number {
  if (totalSubmissions <= 0) return 0
  const rate = (submittedCount / totalSubmissions) * 100
  return Math.min(100, Math.max(0, Math.round(rate)))
}

/**
 * Computes the Global Academic Health Score according to the 40/30/20/10 spec:
 * - 40% Academic Performance
 * - 30% Attendance
 * - 20% School Activity / Submissions
 * - 10% Administrative Efficiency
 */
export function calculateGlobalHealthScore(breakdown: MetricBreakdown): number {
  const score = Math.round(
    breakdown.academicPerformance * 0.40 +
    breakdown.attendance * 0.30 +
    breakdown.schoolActivity * 0.20 +
    breakdown.administrativeEfficiency * 0.10
  )
  return Math.min(100, Math.max(0, score))
}

/**
 * Computes Class Health Score (40% performance + 30% attendance + 30% activity)
 */
export function calculateClassHealthScore(
  academicPerformance: number,
  attendance: number,
  schoolActivity: number
): number {
  const score = Math.round(
    academicPerformance * 0.40 +
    attendance * 0.30 +
    schoolActivity * 0.30
  )
  return Math.min(100, Math.max(0, score))
}

/**
 * Computes Student Risk Score (40% academic risk + 30% attendance risk + 30% submission risk)
 */
export function calculateStudentRiskScore(
  academicPerformance: number,
  attendance: number,
  submissionRate: number
): number {
  const riskFromAcademic = 100 - academicPerformance
  const riskFromAttendance = 100 - attendance
  const riskFromSubmissions = 100 - submissionRate

  const riskScore = Math.round(
    riskFromAcademic * 0.40 +
    riskFromAttendance * 0.30 +
    riskFromSubmissions * 0.30
  )
  return Math.min(100, Math.max(0, riskScore))
}
