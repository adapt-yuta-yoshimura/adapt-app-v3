/**
 * ブートキャンプ運営画面用 API クライアント
 * API-004, API-027, API-043〜045, API-049〜058
 * 型参照: @adapt/types/openapi-app
 */

import type { paths } from '@adapt/types/openapi-app';
import { apiFetch } from './api-client';
import { getStubToken } from './auth';

type NotificationListResponse =
  paths['/api/v1/notifications']['get']['responses']['200']['content']['application/json'];
type CourseDetailView =
  paths['/api/v1/instructor/courses/{courseId}']['get']['responses']['200']['content']['application/json'];
type SubmissionListResponse =
  paths['/api/v1/instructor/courses/{courseId}/submissions']['get']['responses']['200']['content']['application/json'];
type CourseChannelListResponse =
  paths['/api/v1/courses/{courseId}/channels']['get']['responses']['200']['content']['application/json'];
type MessageListResponse =
  paths['/api/v1/channels/{channelId}/messages']['get']['responses']['200']['content']['application/json'];
type PostMessageResponse =
  paths['/api/v1/channels/{channelId}/messages']['post']['responses']['201']['content']['application/json'];
type ThreadResponse =
  paths['/api/v1/messages/{messageId}/thread']['get']['responses']['200']['content']['application/json'];
type ThreadReplyResponse =
  paths['/api/v1/messages/{messageId}/replies']['post']['responses']['201']['content']['application/json'];
type MessagePatchResponse =
  paths['/api/v1/messages/{messageId}']['patch']['responses']['200']['content']['application/json'];
type EvaluationBody =
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['requestBody']['content']['application/json'];
type MessageCreateBody =
  paths['/api/v1/channels/{channelId}/messages']['post']['requestBody']['content']['application/json'];
type GenericWriteRequest =
  paths['/api/v1/messages/{messageId}']['patch']['requestBody']['content']['application/json'];

function authHeaders(): Record<string, string> | undefined {
  const token = getStubToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/**
 * API-004: 通知一覧取得
 */
export async function getNotifications(token?: string): Promise<NotificationListResponse> {
  return apiFetch<NotificationListResponse>('/api/v1/notifications', {
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
  });
}

/**
 * API-027: 講座詳細取得(管理)
 */
export async function getInstructorCourse(
  courseId: string,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>(`/api/v1/instructor/courses/${courseId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
  });
}

/**
 * API-043: 提出一覧取得
 */
export async function getSubmissions(
  courseId: string,
  token?: string,
): Promise<SubmissionListResponse> {
  return apiFetch<SubmissionListResponse>(
    `/api/v1/instructor/courses/${courseId}/submissions`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
    },
  );
}

/**
 * API-044: 評価・採点実行
 */
export async function patchSubmissionEvaluation(
  submissionId: string,
  body: EvaluationBody,
  token?: string,
): Promise<
  paths['/api/v1/instructor/submissions/{submissionId}/evaluation']['patch']['responses']['200']['content']['application/json']
> {
  return apiFetch(
    `/api/v1/instructor/submissions/${submissionId}/evaluation`,
    {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-045: 受講者名簿取得
 */
export async function getCourseMembers(
  courseId: string,
  token?: string,
): Promise<CourseDetailView> {
  return apiFetch<CourseDetailView>(
    `/api/v1/instructor/courses/${courseId}/members`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
    },
  );
}

/**
 * API-049: チャンネル一覧取得
 */
export async function getChannels(
  courseId: string,
  token?: string,
): Promise<CourseChannelListResponse> {
  return apiFetch<CourseChannelListResponse>(
    `/api/v1/courses/${courseId}/channels`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
    },
  );
}

/**
 * API-053: メッセージ履歴取得
 */
export async function getChannelMessages(
  channelId: string,
  token?: string,
): Promise<MessageListResponse> {
  return apiFetch<MessageListResponse>(
    `/api/v1/channels/${channelId}/messages`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
    },
  );
}

/**
 * API-054: メッセージ投稿
 */
export async function postMessage(
  channelId: string,
  body: MessageCreateBody,
  token?: string,
): Promise<PostMessageResponse> {
  return apiFetch<PostMessageResponse>(
    `/api/v1/channels/${channelId}/messages`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-055: スレッド詳細取得
 */
export async function getThread(
  messageId: string,
  token?: string,
): Promise<ThreadResponse> {
  return apiFetch<ThreadResponse>(`/api/v1/messages/${messageId}/thread`, {
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
  });
}

/**
 * API-056: スレッド返信投稿
 */
export async function postThreadReply(
  messageId: string,
  body: GenericWriteRequest,
  token?: string,
): Promise<ThreadReplyResponse> {
  return apiFetch<ThreadReplyResponse>(
    `/api/v1/messages/${messageId}/replies`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
      body: JSON.stringify(body),
    },
  );
}

/**
 * API-057: メッセージ編集
 */
export async function patchMessage(
  messageId: string,
  body: GenericWriteRequest,
  token?: string,
): Promise<MessagePatchResponse> {
  return apiFetch<MessagePatchResponse>(`/api/v1/messages/${messageId}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
    body: JSON.stringify(body),
  });
}

/**
 * API-058: メッセージ削除
 */
export async function deleteMessage(
  messageId: string,
  token?: string,
): Promise<
  paths['/api/v1/messages/{messageId}']['delete']['responses']['200']['content']['application/json']
> {
  return apiFetch(`/api/v1/messages/${messageId}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : authHeaders(),
  });
}
