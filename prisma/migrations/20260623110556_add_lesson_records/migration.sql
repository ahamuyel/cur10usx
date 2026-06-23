-- CreateEnum
CREATE TYPE "JustificationStatus" AS ENUM ('pendente', 'em_analise', 'aprovada', 'rejeitada', 'informacao_adicional');

-- CreateEnum
CREATE TYPE "JustificationReason" AS ENUM ('consulta_medica', 'doenca', 'falecimento_familiar', 'atividade_desportiva', 'representacao_institucional', 'problema_pessoal', 'outro');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('secretaria', 'tesouraria', 'biblioteca', 'recursos_humanos', 'coordenacao', 'direcao', 'outros');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('declaracao_frequencia', 'certificado_aproveitamento', 'certificado_merito', 'declaracao_matricula', 'historico_escolar', 'certificado_conclusao');

-- CreateEnum
CREATE TYPE "LessonRecordStatus" AS ENUM ('PENDING', 'REALIZADA', 'FALTOU', 'SUBSTITUIDA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AttendanceStatus" ADD VALUE 'falta_justificada';
ALTER TYPE "AttendanceStatus" ADD VALUE 'falta_injustificada';
ALTER TYPE "AttendanceStatus" ADD VALUE 'dispensa';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "justificationId" TEXT;

-- AlterTable
ALTER TABLE "GlobalGradingConfig" ADD COLUMN     "honorRollMinAttendance" DOUBLE PRECISION DEFAULT 90,
ADD COLUMN     "honorRollMinGrade" DOUBLE PRECISION NOT NULL DEFAULT 16,
ADD COLUMN     "honorRollNoAbsences" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "GradingConfig" ADD COLUMN     "honorRollMinAttendance" DOUBLE PRECISION DEFAULT 90,
ADD COLUMN     "honorRollMinGrade" DOUBLE PRECISION NOT NULL DEFAULT 16,
ADD COLUMN     "honorRollNoAbsences" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "targetAverage" DOUBLE PRECISION DEFAULT 14.0;

-- CreateTable
CREATE TABLE "TeacherAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "aulasPrevistas" INTEGER NOT NULL DEFAULT 1,
    "teacherId" TEXT NOT NULL,
    "academicYearId" TEXT,
    "schoolId" TEXT NOT NULL,

    CONSTRAINT "TeacherAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Justification" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" "JustificationReason" NOT NULL,
    "reasonDescription" TEXT,
    "documentUrl" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'pendente',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Justification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "foto" TEXT,
    "role" "EmployeeRole" NOT NULL,
    "department" TEXT,
    "userId" TEXT,
    "schoolId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "justification" TEXT,
    "employeeId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentVerification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "studentName" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "className" TEXT,
    "courseName" TEXT,
    "academicYear" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "metadata" JSONB,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedByIp" TEXT,
    "serialNumber" INTEGER NOT NULL,

    CONSTRAINT "DocumentVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonRecord" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "LessonRecordStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "adminNotes" TEXT,
    "recordedBy" TEXT NOT NULL,
    "validatedBy" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "LessonRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAttendance_teacherId_date_key" ON "TeacherAttendance"("teacherId", "date");

-- CreateIndex
CREATE INDEX "Justification_studentId_idx" ON "Justification"("studentId");

-- CreateIndex
CREATE INDEX "Justification_status_idx" ON "Justification"("status");

-- CreateIndex
CREATE INDEX "Justification_schoolId_idx" ON "Justification"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_key" ON "Employee"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE INDEX "Employee_schoolId_idx" ON "Employee"("schoolId");

-- CreateIndex
CREATE INDEX "StaffAttendance_schoolId_idx" ON "StaffAttendance"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_employeeId_date_key" ON "StaffAttendance"("employeeId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVerification_code_key" ON "DocumentVerification"("code");

-- CreateIndex
CREATE INDEX "DocumentVerification_code_idx" ON "DocumentVerification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVerification_schoolId_serialNumber_key" ON "DocumentVerification"("schoolId", "serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LessonRecord_lessonId_date_key" ON "LessonRecord"("lessonId", "date");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_justificationId_fkey" FOREIGN KEY ("justificationId") REFERENCES "Justification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherAttendance" ADD CONSTRAINT "TeacherAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Justification" ADD CONSTRAINT "Justification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentVerification" ADD CONSTRAINT "DocumentVerification_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonRecord" ADD CONSTRAINT "LessonRecord_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
