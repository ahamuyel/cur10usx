import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { comparePassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { authConfig, PERMISSION_KEYS } from "./auth.config";

const loginIpLimiter = rateLimit({ maxRequests: 10, windowMs: 5 * 60 * 1000, key: "login-ip" }) // 10 per 5 min per IP
const loginAccountLimiter = rateLimit({ maxRequests: 5, windowMs: 5 * 60 * 1000, key: "login-account" }) // 5 per 5 min per email

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  )
}

function extractPermissions(perm: Record<string, unknown> | null): string[] {
  if (!perm) return [];
  return PERMISSION_KEYS.filter((key) => perm[key] === true);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...(process.env.GOOGLE_AUTH_ENABLED === "true"
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        try {
          const email = credentials.email as string;
          const password = credentials.password as string;

          if (!email || !password) return null;

          // Rate limiting by IP
          const ip = getIp(request!)
          const ipLimit = await loginIpLimiter(ip)
          if (!ipLimit.success) {
            const resetSec = Math.ceil((ipLimit.resetAt.getTime() - Date.now()) / 1000)
            console.warn(`[RateLimit] Login blocked for IP ${ip} — retry in ${resetSec}s`)
            return null
          }

          // Rate limiting by Account (email)
          const accountLimit = await loginAccountLimiter(email.toLowerCase())
          if (!accountLimit.success) {
            const resetSec = Math.ceil((accountLimit.resetAt.getTime() - Date.now()) / 1000)
            console.warn(`[RateLimit] Login blocked for account ${email} — retry in ${resetSec}s`)
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email },
          include: { school: { select: { slug: true, status: true } } },
          });
          if (!user) return null;

          if (!user.hashedPassword) return null;

          const isValid = await comparePassword(password, user.hashedPassword);
          if (!isValid) return null;

          if (!user.isActive) return null;
          if (!user.emailVerified) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            schoolId: user.schoolId,
            schoolSlug: user.school?.slug ?? null,
            schoolStatus: user.school?.status ?? null,
            isActive: user.isActive,
            mustChangePassword: user.mustChangePassword,
            profileComplete: user.profileComplete,
            emailVerified: user.emailVerified ? new Date() : null,
            hasPassword: !!user.hashedPassword,
            sessionVersion: user.sessionVersion,
            twoFactorEnabled: user.twoFactorEnabled,
          };
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Enforce email_verified check on Google OAuth profile
        if (profile && "email_verified" in profile && profile.email_verified === false) {
          console.warn(`[Security] Rejeitado login Google OAuth: e-mail não verificado na Google para ${user.email}`)
          return false
        }

        const email = user.email!;

        const existing = await prisma.user.findUnique({
          where: { email },
          include: { school: { select: { slug: true } } },
        });

        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              provider:
                existing.provider === "google"
                  ? "google"
                  : existing.hashedPassword
                    ? "both"
                    : "google",
              providerId: account.providerAccountId,
              image: user.image ?? existing.image,
              emailVerified: true,
            },
          });
          // ✅ Passa o ID real da DB para o token
          user.id = existing.id;
          return true;
        }

        // Novo utilizador Google
        const created = await prisma.user.create({
          data: {
            name: user.name ?? email.split("@")[0],
            email,
            provider: "google",
            providerId: account.providerAccountId,
            image: user.image,
            isActive: true,
            profileComplete: false,
            emailVerified: true,
            role: "student",
          },
        });
        // ✅ Passa o ID real da DB para o token
        user.id = created.id;
        return true;
      }
      return true;
    },

    async jwt(params) {
      const updatedToken = await authConfig.callbacks!.jwt!(params);

      // Refresh from DB on every request to keep token in sync with latest user data
      // (approvals, role changes, school associations, etc.)
      // NOTE: Skip this in Edge Runtime (middleware) to avoid Prisma incompatibility
      if (updatedToken.id && process.env.NEXT_RUNTIME !== "edge") {
        const dbUser = await prisma.user.findUnique({
          where: { id: updatedToken.id as string },
          select: {
            id: true,
            role: true,
            schoolId: true,
            isActive: true,
            image: true,
            mustChangePassword: true,
            profileComplete: true,
            emailVerified: true,
            sessionVersion: true,
            hashedPassword: true,
            twoFactorEnabled: true,
            twoFactorVerifiedAt: true,
            school: { select: { slug: true, features: true, status: true } },
            adminPermission: {
              select: {
                level: true,
                ...Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true])),
              },
            },
          },
        });

        if (!dbUser) {
          return null as any
        }

        if (dbUser) {
          // Session invalidation — if sessionVersion changed (password reset, etc.), discard token
          if (dbUser.sessionVersion !== (updatedToken.sessionVersion as number)) {
            return null as any;
          }

          updatedToken.id = dbUser.id;
          updatedToken.role = dbUser.role;
          updatedToken.schoolId = dbUser.schoolId ?? null;
          updatedToken.schoolSlug = dbUser.school?.slug ?? null;
          updatedToken.schoolStatus = dbUser.school?.status ?? null;
          updatedToken.isActive = dbUser.isActive;
          updatedToken.mustChangePassword = dbUser.mustChangePassword;
          updatedToken.profileComplete = dbUser.profileComplete;
          updatedToken.emailVerified = dbUser.emailVerified ? new Date() : null;
          updatedToken.adminLevel = dbUser.adminPermission?.level ?? null;
          updatedToken.permissions = extractPermissions(
            dbUser.adminPermission as unknown as Record<string, unknown>,
          );
          updatedToken.schoolFeatures =
            (dbUser.school?.features as Record<string, boolean>) ?? null;
          const img = dbUser.image;
          updatedToken.userImage = img && !img.startsWith("data:") ? img : null;
          updatedToken.sessionVersion = dbUser.sessionVersion;
          updatedToken.hasPassword = !!dbUser.hashedPassword;
          updatedToken.twoFactorEnabled = dbUser.twoFactorEnabled;
        }
      }

      return updatedToken;
    },
  },
});
