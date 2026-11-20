import type { NextAuthConfig } from "next-auth";

export const PERMISSION_KEYS = [
  "canManageApplications",
  "canManageTeachers",
  "canManageStudents",
  "canManageParents",
  "canManageClasses",
  "canManageCourses",
  "canManageSubjects",
  "canManageLessons",
  "canManageExams",
  "canManageAssignments",
  "canManageResults",
  "canManageAttendance",
  "canManageMessages",
  "canManageAnnouncements",
  "canManageAdmins",
] as const;

export const authConfig = {
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", updateAge: 60, maxAge: 24 * 60 * 60 },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "next-auth-callback-url",
      options: {
        httpOnly: false,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [], // Configured in auth.ts
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId ?? null;
        token.schoolSlug = (user as any).schoolSlug ?? null;
        token.schoolStatus = (user as any).schoolStatus ?? null;
        token.isActive = (user as any).isActive;
        token.mustChangePassword = (user as any).mustChangePassword ?? false;
        token.profileComplete = (user as any).profileComplete ?? true;
        token.emailVerified = (user as any).emailVerified ? new Date() : null;
        const img = (user as any).image;
        token.userImage = img && !img.startsWith("data:") ? img : null;
        token.sessionVersion = (user as any).sessionVersion ?? 0;
        token.hasPassword = (user as any).hasPassword ?? false;
        token.twoFactorEnabled = (user as any).twoFactorEnabled ?? false;
        token.twoFactorVerifiedAt = null;
      }

      if (trigger === "update" && session?.twoFactorVerifiedAt) {
        token.twoFactorVerifiedAt = session.twoFactorVerifiedAt;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.schoolId = (token.schoolId as string) ?? null;
        session.user.schoolSlug = (token.schoolSlug as string) ?? null;
        session.user.schoolStatus = (token.schoolStatus as string) ?? null;
        session.user.isActive = token.isActive as boolean;
        session.user.mustChangePassword = (token.mustChangePassword as boolean) ?? false;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.emailVerified = (token.emailVerified as Date | null) ?? null;
        session.user.adminLevel = (token.adminLevel as string) ?? null;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.schoolFeatures = (token.schoolFeatures as Record<string, boolean>) ?? null;
        session.user.image = (token.userImage as string) ?? null;
        session.user.hasPassword = (token.hasPassword as boolean) ?? false;
        session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
        session.user.twoFactorVerifiedAt = (token.twoFactorVerifiedAt as string) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
