import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * エンドポイントに必要なロールを指定するデコレータ
 * GlobalRole, PlatformRole, CourseMemberRole の値をstring配列で受け取る
 *
 * @example
 * ```typescript
 * @Post()
 * @Roles('operator', 'root_operator')
 * async create(@Body() dto: CreateCourseDto): Promise<CourseDto> {
 *   // ...
 * }
 * ```
 */
export const Roles = (...roles: string[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(ROLES_KEY, roles);
