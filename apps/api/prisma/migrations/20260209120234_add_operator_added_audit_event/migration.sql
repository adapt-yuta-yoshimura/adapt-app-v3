-- AlterEnum
ALTER TYPE "AuditEventType" ADD VALUE 'operator_added';

-- AddForeignKey
ALTER TABLE "platform_membership" ADD CONSTRAINT "platform_membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
