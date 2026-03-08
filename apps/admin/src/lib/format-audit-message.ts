/**
 * 監査イベントの表示メッセージ整形
 * metaJson に対象ユーザー・講座情報があれば含め、リンク用の構造化データを返す。
 * metaJson が null の古いレコードは eventType のみから抽象表示にフォールバック。
 */

const ROLE_NAMES = [
  'Learner',
  'Instructor',
  'Operator',
  'Root Operator',
  'learner',
  'instructor',
  'operator',
  'root_operator',
];

export type AuditEventForFormat = {
  eventType: string;
  reason: string;
  metaJson?: Record<string, unknown> | null;
  courseId?: string | null;
  actorUserId: string;
};

export type AuditMessagePart =
  | { type: 'text'; text: string }
  | { type: 'userLink'; label: string; userId: string; globalRole: string }
  | { type: 'courseLink'; label: string; courseId: string };

export type AuditMessageResult = {
  parts: AuditMessagePart[];
  actorUserId: string;
  actorLabel: string;
};

/**
 * 対象ユーザーの表示ラベルを生成。
 * 優先順位: (1) targetName（ロール名でない場合） (2) targetEmail (3) targetUserId
 * ロール名（Learner 等）の場合は名前として扱わず targetEmail / targetUserId にフォールバック。
 */
function getUserLabel(meta: Record<string, unknown> | null): {
  text: string;
  userId?: string;
  globalRole?: string;
} {
  if (!meta) return { text: '不明なユーザー' };

  const targetName = meta.targetName as string | undefined;
  const targetEmail = meta.targetEmail as string | undefined;
  const targetUserId = meta.targetUserId as string | undefined;
  const targetGlobalRole = meta.targetGlobalRole as string | undefined;

  const isRoleName = targetName && ROLE_NAMES.includes(targetName);

  if (targetName && !isRoleName) {
    return {
      text: targetEmail ? `${targetName}（${targetEmail}）` : targetName,
      userId: targetUserId,
      globalRole: targetGlobalRole,
    };
  }
  if (targetEmail) {
    return { text: targetEmail, userId: targetUserId, globalRole: targetGlobalRole };
  }
  if (targetUserId) {
    return {
      text: `ID:${targetUserId}`,
      userId: targetUserId,
      globalRole: targetGlobalRole,
    };
  }
  return { text: '不明なユーザー' };
}

export function getUserDetailPath(
  targetUserId: string,
  targetGlobalRole?: string,
): string {
  if (!targetGlobalRole) return '#';

  switch (targetGlobalRole) {
    case 'learner':
      return `/admin/learners/${targetUserId}`;
    case 'instructor':
      return `/admin/instructors/${targetUserId}`;
    case 'operator':
    case 'root_operator':
      return `/admin/operators/${targetUserId}`;
    default:
      return '#';
  }
}

function getCourseLabel(
  meta: Record<string, unknown> | null,
  courseId: string | null | undefined,
): string {
  const courseTitle = (meta?.courseTitle ?? meta?.title) as string | undefined;
  return courseTitle ?? courseId ?? '不明な講座';
}

/**
 * 監査イベントから表示用のパーツと実行者情報を生成する
 */
export function formatAuditMessage(event: AuditEventForFormat): AuditMessageResult {
  const meta = event.metaJson ?? null;
  const courseLabel = getCourseLabel(meta, event.courseId);
  const user = getUserLabel(meta);
  const actorName = meta?.actorName as string | undefined;
  const actorEmail = meta?.actorEmail as string | undefined;
  const actorLabel = actorName || actorEmail || event.actorUserId;

  const partsForUser = (suffix: string): AuditMessagePart[] => {
    if (user.userId && user.globalRole && getUserDetailPath(user.userId, user.globalRole) !== '#') {
      return [
        { type: 'userLink', label: user.text, userId: user.userId, globalRole: user.globalRole },
        { type: 'text', text: suffix },
      ];
    }
    return [{ type: 'text', text: `${user.text}${suffix}` }];
  };

  const partsForCourse = (suffix: string): AuditMessagePart[] => {
    const cId = (meta?.courseId as string) ?? event.courseId ?? null;
    if (cId) {
      return [
        { type: 'text', text: '講座「' },
        { type: 'courseLink', label: courseLabel, courseId: cId },
        { type: 'text', text: `」${suffix}` },
      ];
    }
    return [{ type: 'text', text: `講座「${courseLabel}」${suffix}` }];
  };

  const fallbackOnly = (text: string): AuditMessagePart[] => [
    { type: 'text', text },
  ];

  let parts: AuditMessagePart[];

  switch (event.eventType) {
    case 'user_created':
      parts = meta ? partsForUser(' が招待されました') : fallbackOnly('ユーザーが招待されました');
      break;
    case 'user_updated':
      parts = meta ? partsForUser(' の情報が更新されました') : fallbackOnly('ユーザー情報が更新されました');
      break;
    case 'user_deleted':
      parts = meta ? partsForUser(' が削除されました') : fallbackOnly('ユーザーが削除されました');
      break;
    case 'user_frozen':
      parts = meta ? partsForUser(' が凍結されました') : fallbackOnly('ユーザーが凍結されました');
      break;
    case 'user_unfrozen':
      parts = meta ? partsForUser(' の凍結が解除されました') : fallbackOnly('ユーザーの凍結が解除されました');
      break;

    case 'course_created':
      parts = meta ? partsForCourse('が作成されました') : fallbackOnly('講座が作成されました');
      break;
    case 'course_updated':
      parts = meta ? partsForCourse('が更新されました') : fallbackOnly('講座が更新されました');
      break;
    case 'course_archived':
      parts = meta ? partsForCourse('がアーカイブされました') : fallbackOnly('講座がアーカイブされました');
      break;
    case 'course_approved':
      parts = meta ? partsForCourse('が承認されました') : fallbackOnly('講座が承認されました');
      break;
    case 'course_frozen':
      parts = meta ? partsForCourse('が凍結されました') : fallbackOnly('講座が凍結されました');
      break;
    case 'course_unfrozen':
      parts = meta ? partsForCourse('の凍結が解除されました') : fallbackOnly('講座の凍結が解除されました');
      break;

    case 'operator_role_changed':
      parts = meta ? partsForUser(' のロールが変更されました') : fallbackOnly('運営スタッフのロールが変更されました');
      break;

    case 'course_approval_requested':
      parts = meta
        ? partsForCourse('の承認が申請されました')
        : fallbackOnly('講座の承認が申請されました');
      break;
    case 'course_published':
      parts = meta ? partsForCourse('が公開されました') : fallbackOnly('講座が公開されました');
      break;
    case 'channel_frozen':
      parts = fallbackOnly('チャンネルが凍結されました');
      break;
    case 'channel_unfrozen':
      parts = fallbackOnly('チャンネルの凍結が解除されました');
      break;
    case 'dm_viewed_by_root_operator':
      parts = fallbackOnly('root_operator による DM 閲覧が記録されました');
      break;
    case 'announcement_emergency_posted':
      parts = fallbackOnly('緊急アナウンスが投稿されました');
      break;
    case 'course_member_role_promoted':
      parts = fallbackOnly('コースメンバーのロールが昇格されました');
      break;
    case 'frozen_course_viewed':
      parts = meta
        ? partsForCourse('の監査閲覧が記録されました')
        : fallbackOnly('凍結講座の監査閲覧が記録されました');
      break;

    default:
      parts = fallbackOnly(event.reason || event.eventType);
  }

  return {
    parts,
    actorUserId: event.actorUserId,
    actorLabel,
  };
}
