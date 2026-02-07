/**
 * コースステータス
 * @see schema.prisma - CourseStatus
 */
export enum CourseStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}
