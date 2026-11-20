-- AlterEnum
-- Adding AGENDADA and REJEITADA to LessonRecordStatus
ALTER TYPE "LessonRecordStatus" ADD VALUE 'AGENDADA';
ALTER TYPE "LessonRecordStatus" ADD VALUE 'REJEITADA';
