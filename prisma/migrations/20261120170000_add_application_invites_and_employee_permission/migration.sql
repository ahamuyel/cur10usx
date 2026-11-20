-- AlterEnum
ALTER TYPE "ApplicationStatus" ADD VALUE 'contratada';

-- AlterTable
ALTER TABLE "AdminPermission" ADD COLUMN     "canManageEmployees" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "enrolledAt" TIMESTAMP(3),
ADD COLUMN     "hiredAt" TIMESTAMP(3),
ADD COLUMN     "inviteSentAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "inviteTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteTokenUsedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Application_inviteToken_key" ON "Application"("inviteToken");

-- Backfill: administradores de escola já geriam funcionários
UPDATE "AdminPermission" AS ap
SET "canManageEmployees" = true
FROM "User" AS u
WHERE ap."userId" = u."id" AND u."role" = 'school_admin'::"Role";
