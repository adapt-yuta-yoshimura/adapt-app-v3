/**
 * コースメンバーロール
 * @see schema.prisma - CourseMemberRole
 */
export enum CourseMemberRole {
  INSTRUCTOR_OWNER = 'instructor_owner',
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
  ASSISTANT = 'assistant',
}
