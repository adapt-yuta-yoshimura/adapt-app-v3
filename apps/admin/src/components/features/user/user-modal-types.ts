'use client';

/**
 * 凍結・凍結解除・削除モーダルで共通利用するユーザー情報の型
 */
export interface UserModalUser {
  id: string;
  name?: string | null;
  email?: string | null;
  globalRole?: string;
}
