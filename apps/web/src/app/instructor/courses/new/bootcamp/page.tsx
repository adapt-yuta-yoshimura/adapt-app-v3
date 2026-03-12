// INS-UI-19 ブートキャンプ STEP1（基本情報・LP）
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { createInstructorCourse } from '@/lib/instructor-api';

export default function CourseCreateBootcampPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const t = title.trim();
      if (!t) {
        setError('タイトルを入力してください');
        return;
      }
      setError(null);
      setSubmitting(true);
      try {
        const created = await createInstructorCourse({
          title: t,
          style: 'bootcamp',
          description: description.trim() || undefined,
          catalogVisibility: 'private',
          visibility: 'public',
        });
        router.push(`/instructor/courses/${created.course.id}/bootcamp/syllabus`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'API error');
      } finally {
        setSubmitting(false);
      }
    },
    [title, description, router],
  );

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[900px] px-6 py-6 md:px-8">
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">
            TOP
          </Link>
          <ChevronRight />
          <Link href="/instructor/courses/new" className="hover:underline">
            講座を作る
          </Link>
          <ChevronRight />
          <span>ブートキャンプ作成</span>
        </nav>

        <div className="mb-2 text-sm font-bold tracking-[1.12px] text-[#5d5fef]">
          STEP1
        </div>
        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            基本情報設定
          </h1>
          <p className="mt-2 text-sm leading-relaxed tracking-[0.56px] text-[#878787]">
            タイトルや価格設定、この講座でできることなどの基本情報を入力しましょう。
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* サムネイル placeholder */}
          <div>
            <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
              サムネイル
            </p>
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[#d9d9d9] bg-[#f5f5f5] text-sm text-[#878787]">
              {/* TODO(TBD): アップロードAPI未定義のためプレースホルダーのみ */}
              サムネイルを登録
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
              講座タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルが入ります"
              className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm tracking-[0.56px] text-black placeholder:text-[#c7c7c7]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
              サブタイトル
            </label>
            <input
              type="text"
              placeholder="サブタイトル（任意）"
              className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm tracking-[0.56px] text-black placeholder:text-[#c7c7c7]"
            />
          </div>

          <div>
            <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
              メイン講師
            </p>
            <p className="text-sm text-[#878787]">
              ※ログイン中の講師がメイン講師として登録されます
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
              金額
            </label>
            <input
              type="text"
              placeholder="¥ 0"
              readOnly
              className="w-full rounded border border-[#e2e8f0] bg-[#f8f8f8] px-3 py-2 text-sm text-[#878787]"
            />
          </div>

          <div>
            <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
              開催期間・申込期日・定員
            </p>
            <p className="text-sm text-[#878787]">
              {/* TODO(TBD): SoTに日程・定員フィールドが無いためプレースホルダー */}
              選択してください
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
              サブ講師
            </p>
            <p className="text-sm text-[#878787]">
              ＋ サブ講師を追加する（TODO: API未定義）
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
              LP用説明（得られる成果・前提条件・おすすめ等）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="この講座で得られる成果、前提条件、おすすめの方を簡潔に記載してください。"
              rows={6}
              className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm leading-relaxed tracking-[0.56px] text-black placeholder:text-[#c7c7c7]"
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#eaeaea] pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? '作成中…' : 'シラバス・カリキュラム作成に進む'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-black hover:bg-gray-50 disabled:opacity-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <span aria-hidden className="text-[#878787]">
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 3L7.5 6L4.5 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
