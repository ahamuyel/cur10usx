/**
 * Public base URL of the app, used to build absolute URLs (e.g. Open Graph images).
 *
 * Order: explicit AUTH_URL → this Vercel deployment's URL (previews get their
 * own URL) → Vercel production domain → localhost for local dev.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL
  if (explicit) return new URL(explicit)

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelHost) return new URL(`https://${vercelHost}`)

  return new URL("http://localhost:3000")
}
