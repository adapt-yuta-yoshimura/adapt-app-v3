-- CreateEnum
CREATE TYPE "CourseStyle" AS ENUM ('one_on_one', 'seminar', 'bootcamp', 'lecture');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('thread_reply', 'submission_comment', 'grading_completed', 'live_reserved', 'admin_announcement');

-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('rating', 'score', 'short_text', 'long_text', 'single_choice', 'multi_choice');

-- AlterEnum
BEGIN;
CREATE TYPE "AuditEventType_new" AS ENUM ('announcement_emergency_posted', 'course_frozen', 'course_unfrozen', 'channel_frozen', 'channel_unfrozen', 'dm_viewed_by_root_operator', 'course_created', 'course_approval_requested', 'course_approved', 'course_published', 'course_member_role_promoted', 'user_frozen', 'user_unfrozen', 'user_created', 'user_updated', 'user_deleted', 'operator_role_changed');
ALTER TABLE "audit_event" ALTER COLUMN "event_type" TYPE "AuditEventType_new" USING ("event_type"::text::"AuditEventType_new");
ALTER TYPE "AuditEventType" RENAME TO "AuditEventType_old";
ALTER TYPE "AuditEventType_new" RENAME TO "AuditEventType";
DROP TYPE "public"."AuditEventType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "GlobalRole_new" AS ENUM ('guest', 'learner', 'instructor', 'operator', 'root_operator');
ALTER TABLE "public"."user" ALTER COLUMN "global_role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "global_role" TYPE "GlobalRole_new" USING ("global_role"::text::"GlobalRole_new");
ALTER TABLE "audit_event" ALTER COLUMN "actor_global_role" TYPE "GlobalRole_new" USING ("actor_global_role"::text::"GlobalRole_new");
ALTER TYPE "GlobalRole" RENAME TO "GlobalRole_old";
ALTER TYPE "GlobalRole_new" RENAME TO "GlobalRole";
DROP TYPE "public"."GlobalRole_old";
ALTER TABLE "user" ALTER COLUMN "global_role" SET DEFAULT 'learner';
COMMIT;

-- DropForeignKey
ALTER TABLE "platform_membership" DROP CONSTRAINT "platform_membership_user_id_fkey";

-- AlterTable
ALTER TABLE "course" ADD COLUMN     "style" "CourseStyle" NOT NULL;

-- AlterTable
ALTER TABLE "course_channel" ALTER COLUMN "type" SET DEFAULT 'general';

-- AlterTable
ALTER TABLE "lesson" ADD COLUMN     "course_section_id" TEXT;

-- DropTable
DROP TABLE "platform_membership";

-- DropEnum
DROP TYPE "PlatformRole";

-- CreateTable
CREATE TABLE "course_section" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "link_url" TEXT,
    "data_json" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_setting" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "thread_reply_enabled" BOOLEAN NOT NULL DEFAULT true,
    "submission_comment_enabled" BOOLEAN NOT NULL DEFAULT true,
    "grading_completed_enabled" BOOLEAN NOT NULL DEFAULT true,
    "live_reserved_enabled" BOOLEAN NOT NULL DEFAULT true,
    "admin_announcement_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_question" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "type" "SurveyQuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "min_value" INTEGER,
    "max_value" INTEGER,
    "step_value" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_option" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "survey_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_response" (
    "id" TEXT NOT NULL,
    "survey_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_answer" (
    "id" TEXT NOT NULL,
    "response_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "value_text" TEXT,
    "value_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "survey_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_answer_option" (
    "id" TEXT NOT NULL,
    "answer_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,

    CONSTRAINT "survey_answer_option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_course_section_course_id" ON "course_section"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_course_section_course_id_order" ON "course_section"("course_id", "order");

-- CreateIndex
CREATE INDEX "notification_user_id_created_at_idx" ON "notification"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notification_user_id_read_at_idx" ON "notification"("user_id", "read_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_setting_user_id_key" ON "user_notification_setting"("user_id");

-- CreateIndex
CREATE INDEX "survey_course_id_idx" ON "survey"("course_id");

-- CreateIndex
CREATE INDEX "survey_question_survey_id_order_idx" ON "survey_question"("survey_id", "order");

-- CreateIndex
CREATE INDEX "survey_option_question_id_order_idx" ON "survey_option"("question_id", "order");

-- CreateIndex
CREATE INDEX "survey_response_survey_id_submitted_at_idx" ON "survey_response"("survey_id", "submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "survey_response_survey_id_user_id_key" ON "survey_response"("survey_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_answer_response_id_question_id_key" ON "survey_answer"("response_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_answer_option_answer_id_option_id_key" ON "survey_answer_option"("answer_id", "option_id");

-- CreateIndex
CREATE INDEX "idx_lesson_course_section_id" ON "lesson"("course_section_id");

-- AddForeignKey
ALTER TABLE "course_section" ADD CONSTRAINT "course_section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_course_section_id_fkey" FOREIGN KEY ("course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
