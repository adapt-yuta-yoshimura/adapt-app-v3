/**
 * OpenAPI 生成型の re-export
 * @adapt/types から Admin API の型をインポートして使用
 */

import type { AdminApi } from '@adapt/types';

export type paths = AdminApi.paths;
export type components = AdminApi.components;
export type operations = AdminApi.operations;

// よく使う型のエイリアス
export type AdminApiPaths = AdminApi.paths;
export type AdminApiOperations = AdminApi.operations;
export type AdminApiComponents = AdminApi.components;

// API レスポンス型のエイリアス
export type UserListResponse = AdminApi.operations['API_074']['responses']['200']['content']['application/json'];
export type OperatorListResponse = AdminApi.operations['API_076']['responses']['200']['content']['application/json'];
export type GenericWriteRequest = AdminApi.components['schemas']['GenericWriteRequest'];
export type SuccessResponse = AdminApi.components['schemas']['SuccessResponse'];
export type ErrorResponse = AdminApi.components['schemas']['ErrorResponse'];
