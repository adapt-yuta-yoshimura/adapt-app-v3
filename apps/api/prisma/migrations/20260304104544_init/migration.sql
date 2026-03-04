-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('guest', 'learner', 'instructor', 'operator', 'root_operator');

-- CreateEnum
CREATE TYPE "CourseMemberRole" AS ENUM ('instructor_owner', 'learner', 'instructor', 'assistant');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('text', 'video', 'live', 'assignment');

-- CreateEnum
CREATE TYPE "CourseCatalogVisibility" AS ENUM ('public_listed', 'public_unlisted', 'private');

-- CreateEnum
CREATE TYPE "CourseVisibility" AS ENUM ('public', 'instructors_only');

-- CreateEnum
CREATE TYPE "CourseStyle" AS ENUM ('one_on_one', 'seminar', 'bootcamp', 'lecture');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'pending_approval', 'active', 'archived');

-- CreateEnum
CREATE TYPE "CourseChannelType" AS ENUM ('assignment', 'one_on_one', 'announcement', 'general');

-- CreateEnum
CREATE TYPE "CourseChannelPostingMode" AS ENUM ('mixed', 'threads_only');

-- CreateEnum
CREATE TYPE "CourseChannelMemberStatus" AS ENUM ('invited', 'joined', 'declined');

-- CreateEnum
CREATE TYPE "CourseThreadType" AS ENUM ('submission', 'message_thread');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('announcement_emergency_posted', 'course_frozen', 'course_unfrozen', 'channel_frozen', 'channel_unfrozen', 'dm_viewed_by_root_operator', 'course_created', 'course_approval_requested', 'course_approved', 'course_published', 'course_member_role_promoted', 'user_frozen', 'user_unfrozen', 'user_created', 'user_updated', 'user_deleted', 'operator_role_changed', 'course_updated', 'course_archived', 'frozen_course_viewed');

-- CreateEnum
CREATE TYPE "CourseEnrollmentStatus" AS ENUM ('applied', 'active', 'revoked');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe', 'manual');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'canceled', 'refunded');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('pending', 'succeeded', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "CouponDiscountType" AS ENUM ('amount_fixed', 'amount_percent');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'cancelled', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('draft', 'submitted', 'returned', 'graded');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('thread_reply', 'submission_comment', 'grading_completed', 'live_reserved', 'admin_announcement');

-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('rating', 'score', 'short_text', 'long_text', 'single_choice', 'multi_choice');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "global_role" "GlobalRole" NOT NULL DEFAULT 'learner',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "owner_user_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "style" "CourseStyle" NOT NULL,
    "approval_requested_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by_user_id" TEXT,
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "frozen_at" TIMESTAMP(3),
    "frozen_by_user_id" TEXT,
    "freeze_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "catalog_visibility" "CourseCatalogVisibility" NOT NULL DEFAULT 'public_listed',
    "visibility" "CourseVisibility" NOT NULL DEFAULT 'public',

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_member" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "CourseMemberRole" NOT NULL DEFAULT 'learner',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_member_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "lesson" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "course_section_id" TEXT,
    "title" TEXT NOT NULL,
    "type" "LessonType" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3),
    "allow_resubmission" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_channel" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "type" "CourseChannelType" NOT NULL DEFAULT 'general',
    "posting_mode" "CourseChannelPostingMode" NOT NULL DEFAULT 'mixed',
    "is_frozen" BOOLEAN NOT NULL DEFAULT false,
    "frozen_at" TIMESTAMP(3),
    "frozen_by_user_id" TEXT,
    "freeze_reason" TEXT,
    "name" TEXT,
    "is_manual" BOOLEAN NOT NULL DEFAULT false,
    "system_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "visibility" "CourseVisibility" NOT NULL DEFAULT 'public',

    CONSTRAINT "course_channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_channel_member" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "course_member_id" TEXT NOT NULL,
    "status" "CourseChannelMemberStatus" NOT NULL DEFAULT 'invited',
    "invited_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "last_read_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_channel_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_thread" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "root_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" "CourseThreadType" NOT NULL DEFAULT 'message_thread',

    CONSTRAINT "course_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_thread_read_state" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "course_member_id" TEXT NOT NULL,
    "last_read_message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_thread_read_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_message" (
    "id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "thread_id" TEXT,
    "author_course_member_id" TEXT,
    "text" TEXT NOT NULL,
    "is_emergency" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_message_attachment" (
    "id" TEXT NOT NULL,
    "course_message_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_message_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_notification_preference" (
    "id" TEXT NOT NULL,
    "course_member_id" TEXT NOT NULL,
    "announcement_normal_enabled" BOOLEAN NOT NULL DEFAULT true,
    "submission_enabled" BOOLEAN NOT NULL DEFAULT true,
    "submission_comment_enabled" BOOLEAN NOT NULL DEFAULT true,
    "thread_reply_enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_channel_notification_preference" (
    "id" TEXT NOT NULL,
    "course_member_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_channel_notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_enrollment" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "CourseEnrollmentStatus" NOT NULL DEFAULT 'applied',
    "source" "PaymentProvider" NOT NULL,
    "granted_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "payment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "provider_ref" TEXT,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refund" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "provider_ref" TEXT,
    "amount" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "CouponDiscountType" NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "currency" TEXT,
    "expires_at" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon_redemption" (
    "id" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT,
    "payment_id" TEXT,
    "redeemed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupon_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_user_id" TEXT NOT NULL,
    "event_type" "AuditEventType" NOT NULL,
    "actor_global_role" "GlobalRole" NOT NULL,
    "course_id" TEXT,
    "channel_id" TEXT,
    "message_id" TEXT,
    "reason" TEXT NOT NULL,
    "meta_json" JSONB,
    "request_id" TEXT,
    "ip_hash" TEXT,
    "user_agent_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "payment_provider" TEXT NOT NULL,
    "payment_intent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "o_auth_identity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "o_auth_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_credential" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "password_updated_at" TIMESTAMP(3) NOT NULL,
    "is_disabled" BOOLEAN NOT NULL DEFAULT false,
    "failed_count" INTEGER NOT NULL,
    "last_failed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "password_credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_object" (
    "id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT,
    "is_scanned" BOOLEAN NOT NULL DEFAULT false,
    "is_malicious" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_object_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SubmissionStatus" NOT NULL,
    "graded_at" TIMESTAMP(3),

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_file_object_id" TEXT,
    "bio" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_comment" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "author_user_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_comment_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "course_member_course_id_user_id_key" ON "course_member"("course_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_course_section_course_id" ON "course_section"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_course_section_course_id_order" ON "course_section"("course_id", "order");

-- CreateIndex
CREATE INDEX "idx_lesson_course_section_id" ON "lesson"("course_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_thread_root_message_id_key" ON "course_thread"("root_message_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_notification_preference_course_member_id_key" ON "course_notification_preference"("course_member_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollment_course_id_user_id_key" ON "course_enrollment"("course_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_provider_ref_key" ON "payment"("provider_ref");

-- CreateIndex
CREATE UNIQUE INDEX "refund_provider_ref_key" ON "refund"("provider_ref");

-- CreateIndex
CREATE UNIQUE INDEX "coupon_code_key" ON "coupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "password_credential_user_id_key" ON "password_credential"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "file_object_storage_key_key" ON "file_object"("storage_key");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

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

-- AddForeignKey
ALTER TABLE "course_section" ADD CONSTRAINT "course_section_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_course_section_id_fkey" FOREIGN KEY ("course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
