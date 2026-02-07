import { z } from 'zod';
import { UpdateCourseSchema } from '@adapt/shared';

/**
 * コース更新リクエストDTO
 * @see openapi_app.yaml - CourseUpdateRequest
 * @see schema.prisma - Course
 */
export const UpdateCourseDtoSchema = UpdateCourseSchema;

export type UpdateCourseDto = z.infer<typeof UpdateCourseDtoSchema>;
