-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('in_progress', 'completed');

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LearningPath" DROP CONSTRAINT "LearningPath_curriculumUnitId_fkey";

-- DropForeignKey
ALTER TABLE "MasteryScore" DROP CONSTRAINT "MasteryScore_exerciseId_fkey";

-- DropIndex
DROP INDEX "Answer_exerciseId_studentId_key";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "CurriculumCourse" ADD COLUMN     "subjectId" TEXT;

-- AlterTable
ALTER TABLE "MasteryScore" DROP COLUMN "topicTitle",
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lessonId" TEXT,
ADD COLUMN     "topicId" TEXT,
ALTER COLUMN "exerciseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleSlotRecord" RENAME CONSTRAINT "LessonRecord_pkey" TO "ScheduleSlotRecord_pkey";

-- CreateTable
CREATE TABLE "StudentLessonProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentLessonProgress_studentId_idx" ON "StudentLessonProgress"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentLessonProgress_studentId_lessonId_key" ON "StudentLessonProgress"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "Answer_studentId_exerciseId_idx" ON "Answer"("studentId", "exerciseId");

-- CreateIndex
CREATE INDEX "Answer_studentId_answeredAt_idx" ON "Answer"("studentId", "answeredAt");

-- CreateIndex
CREATE INDEX "MasteryScore_studentId_subjectId_idx" ON "MasteryScore"("studentId", "subjectId");

-- CreateIndex
CREATE INDEX "MasteryScore_topicId_idx" ON "MasteryScore"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "MasteryScore_studentId_topicId_key" ON "MasteryScore"("studentId", "topicId");

-- RenameForeignKey
ALTER TABLE "ScheduleSlot" RENAME CONSTRAINT "Lesson_academicYearId_fkey" TO "ScheduleSlot_academicYearId_fkey";

-- RenameForeignKey
ALTER TABLE "ScheduleSlot" RENAME CONSTRAINT "Lesson_classId_fkey" TO "ScheduleSlot_classId_fkey";

-- RenameForeignKey
ALTER TABLE "ScheduleSlot" RENAME CONSTRAINT "Lesson_schoolId_fkey" TO "ScheduleSlot_schoolId_fkey";

-- RenameForeignKey
ALTER TABLE "ScheduleSlot" RENAME CONSTRAINT "Lesson_subjectId_fkey" TO "ScheduleSlot_subjectId_fkey";

-- RenameForeignKey
ALTER TABLE "ScheduleSlot" RENAME CONSTRAINT "Lesson_teacherId_fkey" TO "ScheduleSlot_teacherId_fkey";

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ScheduleSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumCourse" ADD CONSTRAINT "CurriculumCourse_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "CurriculumTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentLessonProgress" ADD CONSTRAINT "StudentLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_curriculumUnitId_fkey" FOREIGN KEY ("curriculumUnitId") REFERENCES "CurriculumUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

