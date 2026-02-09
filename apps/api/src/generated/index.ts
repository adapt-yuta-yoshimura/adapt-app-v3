/**
 * Admin API 型の再エクスポート
 * openapi-admin.d.ts は prebuild で packages/types からコピーされる
 */
export type { paths, components, operations } from './openapi-admin';
