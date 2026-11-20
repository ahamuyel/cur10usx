-- Rename constraints before renaming tables (PostgreSQL doesn't auto-rename constraints)
ALTER TABLE "Lesson" RENAME CONSTRAINT "Lesson_pkey" TO "ScheduleSlot_pkey";

-- AlterTable: Rename Lesson -> ScheduleSlot
ALTER TABLE "Lesson" RENAME TO "ScheduleSlot";

-- AlterTable: Rename LessonRecord -> ScheduleSlotRecord
ALTER TABLE "LessonRecord" RENAME TO "ScheduleSlotRecord";

-- Rename foreign key constraints
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";
ALTER TABLE "ScheduleSlotRecord" DROP CONSTRAINT "LessonRecord_lessonId_fkey";

-- Rename indexes
ALTER INDEX "LessonRecord_lessonId_date_key" RENAME TO "ScheduleSlotRecord_lessonId_date_key";

-- Add new foreign keys
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ScheduleSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduleSlotRecord" ADD CONSTRAINT "ScheduleSlotRecord_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "ScheduleSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum: ContentType
CREATE TYPE "ContentType" AS ENUM ('teorico', 'pratico', 'video', 'misto');

-- CreateEnum: ExerciseType
CREATE TYPE "ExerciseType" AS ENUM ('multiple_choice', 'fill_in', 'step_by_step', 'true_false', 'drag_and_drop', 'short_answer', 'listening');

-- CreateTable: Curriculum
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'AO',
    "version" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CurriculumCourse
CREATE TABLE "CurriculumCourse" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "cycleLevel" "EducationLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CurriculumUnit
CREATE TABLE "CurriculumUnit" (
    "id" TEXT NOT NULL,
    "curriculumCourseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable: CurriculumTopic
CREATE TABLE "CurriculumTopic" (
    "id" TEXT NOT NULL,
    "curriculumUnitId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurriculumTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Lesson (educational content - replaces scheduling Lesson)
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "curriculumTopicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL DEFAULT 'teorico',
    "estimatedMinutes" INTEGER,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LessonContent
CREATE TABLE "LessonContent" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LessonContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Exercise
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "type" "ExerciseType" NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "difficulty" INTEGER NOT NULL DEFAULT 1,
    "order" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Answer
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "timeSpentMs" INTEGER,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable: MasteryScore
CREATE TABLE "MasteryScore" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicTitle" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StudentXP
CREATE TABLE "StudentXP" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentXP_pkey" PRIMARY KEY ("id")
);

-- CreateTable: XPEvent
CREATE TABLE "XPEvent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable: StudentStreak
CREATE TABLE "StudentStreak" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable: LearningPath
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "curriculumCourseId" TEXT NOT NULL,
    "curriculumUnitId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'in_progress',

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Unique constraints
CREATE UNIQUE INDEX "CurriculumCourse_curriculumId_name_key" ON "CurriculumCourse"("curriculumId", "name");
CREATE UNIQUE INDEX "CurriculumUnit_curriculumCourseId_order_key" ON "CurriculumUnit"("curriculumCourseId", "order");
CREATE UNIQUE INDEX "CurriculumTopic_curriculumUnitId_order_key" ON "CurriculumTopic"("curriculumUnitId", "order");
CREATE UNIQUE INDEX "Lesson_curriculumTopicId_order_key" ON "Lesson"("curriculumTopicId", "order");
CREATE UNIQUE INDEX "Exercise_lessonId_order_key" ON "Exercise"("lessonId", "order");
CREATE UNIQUE INDEX "Answer_exerciseId_studentId_key" ON "Answer"("exerciseId", "studentId");
CREATE UNIQUE INDEX "StudentXP_studentId_key" ON "StudentXP"("studentId");
CREATE UNIQUE INDEX "StudentStreak_studentId_key" ON "StudentStreak"("studentId");
CREATE UNIQUE INDEX "LearningPath_studentId_curriculumCourseId_key" ON "LearningPath"("studentId", "curriculumCourseId");

-- CreateIndex: Performance indexes
CREATE INDEX "XPEvent_studentId_createdAt_idx" ON "XPEvent"("studentId", "createdAt");

-- AddForeignKey: CurriculumCourse -> Curriculum
ALTER TABLE "CurriculumCourse" ADD CONSTRAINT "CurriculumCourse_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CurriculumUnit -> CurriculumCourse
ALTER TABLE "CurriculumUnit" ADD CONSTRAINT "CurriculumUnit_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: CurriculumTopic -> CurriculumUnit
ALTER TABLE "CurriculumTopic" ADD CONSTRAINT "CurriculumTopic_curriculumUnitId_fkey" FOREIGN KEY ("curriculumUnitId") REFERENCES "CurriculumUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Lesson (content) -> CurriculumTopic
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_curriculumTopicId_fkey" FOREIGN KEY ("curriculumTopicId") REFERENCES "CurriculumTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Lesson (content) -> School
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: LessonContent -> Lesson
ALTER TABLE "LessonContent" ADD CONSTRAINT "LessonContent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Exercise -> Lesson
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Answer -> Exercise
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Answer -> Student
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: MasteryScore -> Exercise
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: MasteryScore -> Student
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: MasteryScore -> Subject
ALTER TABLE "MasteryScore" ADD CONSTRAINT "MasteryScore_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: StudentXP -> Student
ALTER TABLE "StudentXP" ADD CONSTRAINT "StudentXP_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: XPEvent -> Student
ALTER TABLE "XPEvent" ADD CONSTRAINT "XPEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: StudentStreak -> Student
ALTER TABLE "StudentStreak" ADD CONSTRAINT "StudentStreak_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: LearningPath -> Student
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: LearningPath -> CurriculumCourse
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_curriculumCourseId_fkey" FOREIGN KEY ("curriculumCourseId") REFERENCES "CurriculumCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: LearningPath -> CurriculumUnit
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_curriculumUnitId_fkey" FOREIGN KEY ("curriculumUnitId") REFERENCES "CurriculumUnit"("id");
