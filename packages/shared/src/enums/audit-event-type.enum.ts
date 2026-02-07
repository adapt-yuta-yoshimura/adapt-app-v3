/**
 * 監査イベント種別
 * @see schema.prisma - AuditEventType
 */
export enum AuditEventType {
  ANNOUNCEMENT_EMERGENCY_POSTED = 'announcement_emergency_posted',
  COURSE_FROZEN = 'course_frozen',
  COURSE_UNFROZEN = 'course_unfrozen',
  CHANNEL_FROZEN = 'channel_frozen',
  CHANNEL_UNFROZEN = 'channel_unfrozen',
  USER_FROZEN = 'user_frozen',
  USER_UNFROZEN = 'user_unfrozen',
  DM_VIEWED_BY_ROOT_OPERATOR = 'dm_viewed_by_root_operator',
  COURSE_CREATED = 'course_created',
  COURSE_APPROVAL_REQUESTED = 'course_approval_requested',
  COURSE_APPROVED = 'course_approved',
  COURSE_PUBLISHED = 'course_published',
  COURSE_MEMBER_ROLE_PROMOTED = 'course_member_role_promoted',
}
