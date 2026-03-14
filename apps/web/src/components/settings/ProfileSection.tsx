'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GetProfileResponse, UpdateProfileRequest } from '@/lib/user-api';
import { updateProfile } from '@/lib/user-api';
import { UserApiError } from '@/lib/user-api';

const GLOBAL_ROLE_LABELS: Record<string, string> = {
  guest: 'ゲスト',
  learner: '受講者',
  instructor: '講師',
  operator: '運営',
  root_operator: '管理者',
};

type Props = {
  profile: GetProfileResponse;
  token: string | null;
  onSuccess?: () => void;
};

export function ProfileSection({ profile, token, onSuccess }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const body: UpdateProfileRequest = {};
      if (name !== (profile.name ?? '')) body.name = name;
      if (email !== (profile.email ?? '')) body.email = email;
      if (Object.keys(body).length === 0) {
        setEditing(false);
        setSaving(false);
        return;
      }
      await updateProfile(token, body);
      router.refresh();
      onSuccess?.();
      setEditing(false);
    } catch (e) {
      if (e instanceof UserApiError && e.statusCode === 409) {
        setError('このメールアドレスは既に使用されています。');
      } else {
        setError('保存に失敗しました。');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name ?? '');
    setEmail(profile.email ?? '');
    setError(null);
    setEditing(false);
  };

  return (
    <section className="rounded-lg border border-iris-60 bg-white p-6">
      <h2 className="text-lg font-semibold text-black">プロフィール</h2>
      {/* プロフィール画像: 準備中（API 未定義） */}
      <div className="mt-4 opacity-50 pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-grey3/30 flex items-center justify-center text-grey3 text-sm">
            画像
          </div>
          <div>
            <p className="text-sm text-grey3">プロフィール画像</p>
            <p className="text-xs text-grey3 mt-0.5">この機能は現在準備中です</p>
          </div>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-black">
              名前
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full max-w-md rounded border border-iris-60 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-black">
              メールアドレス
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full max-w-md rounded border border-iris-60 px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded bg-iris-100 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded border border-iris-60 px-4 py-2 text-sm text-grey3"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          <div>
            <span className="text-sm text-grey3">名前</span>
            <p className="text-black">{profile.name ?? '—'}</p>
          </div>
          <div>
            <span className="text-sm text-grey3">メールアドレス</span>
            <p className="text-black">{profile.email ?? '—'}</p>
          </div>
          <div>
            <span className="text-sm text-grey3">ロール</span>
            <p>
              <span className="inline-flex rounded bg-iris-light px-2 py-0.5 text-xs font-medium text-black">
                {GLOBAL_ROLE_LABELS[profile.globalRole] ?? profile.globalRole}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-2 rounded border border-iris-60 px-3 py-1.5 text-sm text-black"
          >
            編集
          </button>
        </div>
      )}

      {/* 自己紹介文・スキル: 準備中（SoT に未定義） */}
      <div className="mt-6 opacity-50 pointer-events-none">
        <label className="block text-sm font-medium text-black">自己紹介文</label>
        <textarea
          disabled
          placeholder="準備中"
          className="mt-1 w-full max-w-md rounded border border-iris-60 px-3 py-2 text-sm"
          rows={3}
        />
        <p className="text-sm text-grey3 mt-1">この機能は現在準備中です</p>
      </div>
      <div className="mt-4 opacity-50 pointer-events-none">
        <label className="block text-sm font-medium text-black">スキル・専門分野</label>
        <input
          type="text"
          disabled
          placeholder="準備中"
          className="mt-1 w-full max-w-md rounded border border-iris-60 px-3 py-2 text-sm"
        />
        <p className="text-sm text-grey3 mt-1">この機能は現在準備中です</p>
      </div>
    </section>
  );
}
