-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS    "deliveredAt" TIMESTAMP(3);
