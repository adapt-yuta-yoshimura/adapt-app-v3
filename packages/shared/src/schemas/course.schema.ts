import { z } from 'zod';

/**
 * コース作成リクエストのバリデーションスキーマ
 */
export const CreateCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  catalogVisibility: z.enum(['public_listed', 'public_unlisted', 'private']),
  visibility: z.enum(['public', 'instructors_only']),
});

export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;

/**
 * コース更新リクエストのバリデーションスキーマ
 */
export const UpdateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  catalogVisibility: z.enum(['public_listed', 'public_unlisted', 'private']).optional(),
  visibility: z.enum(['public', 'instructors_only']).optional(),
});

export type UpdateCourseDto = z.infer<typeof UpdateCourseSchema>;
