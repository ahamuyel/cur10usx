/**
 * Decides whether the current session may be marked as 2FA-verified.
 *
 * The client's `update({ twoFactorVerifiedAt })` call is only a signal: the
 * session is verified only if the server recorded a successful TOTP check
 * (`User.twoFactorVerifiedAt`) at or after this session's login (`authTime`).
 * A verification from an earlier login, or a token without `authTime`
 * (issued before this check existed), is not accepted.
 */
export function isTwoFactorVerifiedForSession(
  dbVerifiedAt: Date | null | undefined,
  authTime: unknown,
): boolean {
  if (!dbVerifiedAt) return false
  if (typeof authTime !== "number" || !Number.isFinite(authTime)) return false
  // Small tolerance for clock skew between the app and the database.
  const SKEW_MS = 5_000
  return dbVerifiedAt.getTime() >= authTime - SKEW_MS
}
