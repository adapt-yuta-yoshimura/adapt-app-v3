/**
 * 監査イベント metaJson の型（一貫性のための参照用）
 * スキーマ変更なし。既存 metaJson は Json? のまま。
 */

export type AuditMetaUser = {
  targetUserId: string;
  targetEmail?: string | null;
  targetName?: string | null;
  targetGlobalRole?: string;
};

export type AuditMetaCourse = {
  courseTitle?: string;
  courseStatus?: string;
  ownerUserId?: string;
};

export type AuditMetaOperator = AuditMetaUser & {
  previousRole?: string;
  newRole?: string;
};

export type AuditMeta = AuditMetaUser & AuditMetaCourse & {
  previousRole?: string;
  newRole?: string;
  [key: string]: unknown;
};
