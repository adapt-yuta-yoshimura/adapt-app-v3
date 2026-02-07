-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'pending_approval', 'active', 'archived');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEventType" ADD VALUE 'course_created';
ALTER TYPE "AuditEventType" ADD VALUE 'course_approval_requested';
ALTER TYPE "AuditEventType" ADD VALUE 'course_approved';
ALTER TYPE "AuditEventType" ADD VALUE 'course_published';
ALTER TYPE "AuditEventType" ADD VALUE 'course_member_role_promoted';

-- AlterTable
ALTER TABLE "course" ADD COLUMN     "approval_requested_at" TIMESTAMP(3),
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by_user_id" TEXT,
ADD COLUMN     "created_by_user_id" TEXT NOT NULL,
ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "global_role" "GlobalRole" NOT NULL DEFAULT 'learner';

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollment_course_id_user_id_key" ON "course_enrollment"("course_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_member_course_id_user_id_key" ON "course_member"("course_id", "user_id");
