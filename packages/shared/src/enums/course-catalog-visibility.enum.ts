/**
 * コースカタログ公開設定
 * @see schema.prisma - CourseCatalogVisibility
 */
export enum CourseCatalogVisibility {
  PUBLIC_LISTED = 'public_listed',
  PUBLIC_UNLISTED = 'public_unlisted',
  PRIVATE = 'private',
}
