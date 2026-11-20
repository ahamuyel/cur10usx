-- CreateTable
CREATE TABLE IF NOT EXISTS "AcademicHealthSnapshot" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "academicPerformance" INTEGER NOT NULL,
    "attendance" INTEGER NOT NULL,
    "schoolActivity" INTEGER NOT NULL,
    "administrativeEfficiency" INTEGER NOT NULL,
    "snapshotDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "academicYearId" TEXT,

    CONSTRAINT "AcademicHealthSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AcademicHealthSnapshot_schoolId_snapshotDate_idx" ON "AcademicHealthSnapshot"("schoolId", "snapshotDate");

-- AddForeignKey
ALTER TABLE "AcademicHealthSnapshot" ADD CONSTRAINT "AcademicHealthSnapshot_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcademicHealthSnapshot" ADD CONSTRAINT "AcademicHealthSnapshot_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
