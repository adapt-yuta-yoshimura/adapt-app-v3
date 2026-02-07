import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * Zodスキーマによるバリデーションパイプ
 * リクエストボディをZodスキーマで検証し、不正な場合はBadRequestExceptionをスローする
 *
 * @example
 * ```typescript
 * @Post()
 * async create(
 *   @Body(new ZodValidationPipe(CreateCourseSchema)) dto: CreateCourseDto,
 * ): Promise<CourseDetailResponseDto> {
 *   // ...
 * }
 * ```
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown): unknown {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(
          (e) => `${e.path.join('.')}: ${e.message}`,
        );
        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
