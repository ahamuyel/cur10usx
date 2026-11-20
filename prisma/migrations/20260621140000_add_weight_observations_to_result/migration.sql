-- Add weight and observations columns to Result table
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE "Result" ADD COLUMN IF NOT EXISTS "observations" TEXT;
