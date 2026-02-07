/**
 * 提出ステータス
 * @see schema.prisma - SubmissionStatus
 */
export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  RETURNED = 'returned',
  GRADED = 'graded',
}
