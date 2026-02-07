import { z } from 'zod';
import { CreateCourseSchema } from '@adapt/shared';

/**
 * コース作成リクエストDTO
 * @see openapi_app.yaml - CourseCreateRequest
 * @see schema.prisma - Course
 */
export const CreateCourseDtoSchema = CreateCourseSchema;

export type CreateCourseDto = z.infer<typeof CreateCourseDtoSchema>;
