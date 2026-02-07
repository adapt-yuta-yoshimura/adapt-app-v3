/**
 * グローバルロール
 * @see schema.prisma - GlobalRole
 */
export enum GlobalRole {
  GUEST = 'guest',
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
  ASSISTANT = 'assistant',
  OPERATOR = 'operator',
  ROOT_OPERATOR = 'root_operator',
}
