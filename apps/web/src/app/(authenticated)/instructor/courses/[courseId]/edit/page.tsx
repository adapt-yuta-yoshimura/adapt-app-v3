// INS-UI-05 講座編集（1on1/セミナー）
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getInstructorCourse,
  updateInstructorCourse,
  requestApproval,
  publishCourse,
} from '@/lib/instructor-api';
import { ApiError } from '@/lib/api-client';
import type { components } from '@adapt/types/openapi-app';

type CourseStyle = components['schemas']['CourseStyle'];

const STYLE_LABEL: Record<string, string> = {
  one_on_one: '1on1',
  seminar: 'セミナー',
};

type ActionType = 'draft' | 'request_approval' | 'publish';

/** INS-UI-18 と同一フォーマットの description を LP 項目にパース */
function parseLpDescription(
  description: string | null | undefined,
): {
  necessity: string;
  solveItems: string[];
  prereqItems: string[];
  recommendedItems: string[];
} {
  const result = {
    necessity: '',
    solveItems: ['' as string],
    prereqItems: ['' as string],
    recommendedItems: ['' as string],
  };
  if (!description || !description.trim()) return result;

  const necessityMatch = description.match(
    /【この講座の必要性】\n?([\s\S]*?)(?=【|$)/,
  );
  if (necessityMatch) result.necessity = necessityMatch[1].trim();

  const solveMatch = description.match(
    /【この講座で解決すること】\n?([\s\S]*?)(?=【|$)/,
  );
  if (solveMatch) {
    const lines = solveMatch[1]
      .trim()
      .split('\n')
      .filter(Boolean);
    result.solveItems = lines.length > 0 ? lines : [''];
  }

  const prereqMatch = description.match(/【前提条件】\n?([\s\S]*?)(?=【|$)/);
  if (prereqMatch) {
    const lines = prereqMatch[1]
      .trim()
      .split('\n')
      .filter(Boolean);
    result.prereqItems = lines.length > 0 ? lines : [''];
  }

  const recMatch = description.match(
    /【こんな方におすすめ】\n?([\s\S]*?)(?=【|$)/,
  );
  if (recMatch) {
    const lines = recMatch[1]
      .trim()
      .split('\n')
      .filter(Boolean);
    result.recommendedItems = lines.length > 0 ? lines : [''];
  }

  return result;
}

export default function CourseEditPage() {
  const params = useParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';
  const router = useRouter();

  const {
    data,
    isLoading,
    isError,
    error: queryError,
  } = useQuery({
    queryKey: ['instructor-course', courseId],
    queryFn: () => getInstructorCourse(courseId),
    enabled: !!courseId,
  });

  const course = data?.course;
  const style = course?.style;
  const isBootcamp = style === 'bootcamp';
  const isFrozen = course?.isFrozen ?? false;

  useEffect(() => {
    if (!courseId || !data) return;
    if (isBootcamp) {
      router.replace(`/instructor/courses/${courseId}/bootcamp/syllabus`);
    }
  }, [courseId, data, isBootcamp, router]);

  const [title, setTitle] = useState('');
  const [necessity, setNecessity] = useState('');
  const [solveItems, setSolveItems] = useState<string[]>(['']);
  const [prereqItems, setPrereqItems] = useState<string[]>(['']);
  const [recommendedItems, setRecommendedItems] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState<ActionType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!course) return;
    const p = course.description
      ? parseLpDescription(course.description)
      : {
          necessity: '',
          solveItems: [''],
          prereqItems: [''],
          recommendedItems: [''],
        };
    setTitle(course.title ?? '');
    setNecessity(p.necessity);
    setSolveItems(p.solveItems.length > 0 ? p.solveItems : ['']);
    setPrereqItems(p.prereqItems.length > 0 ? p.prereqItems : ['']);
    setRecommendedItems(
      p.recommendedItems.length > 0 ? p.recommendedItems : [''],
    );
  }, [course?.id, course?.title, course?.description]);

  const addItem = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      setter((prev) => [...prev, '']);
    },
    [],
  );
  const updateItem = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<string[]>>,
      index: number,
      value: string,
    ) => {
      setter((prev) => {
        const next = [...prev];
        next[index] = value;
        return next;
      });
    },
    [],
  );

  const buildDescription = useCallback(() => {
    const parts: string[] = [];
    if (necessity.trim())
      parts.push(`【この講座の必要性】\n${necessity}`);
    if (solveItems.some(Boolean))
      parts.push(
        `【この講座で解決すること】\n${solveItems.filter(Boolean).join('\n')}`,
      );
    if (prereqItems.some(Boolean))
      parts.push(`【前提条件】\n${prereqItems.filter(Boolean).join('\n')}`);
    if (recommendedItems.some(Boolean))
      parts.push(
        `【こんな方におすすめ】\n${recommendedItems.filter(Boolean).join('\n')}`,
      );
    return parts.length ? parts.join('\n\n') : undefined;
  }, [necessity, solveItems, prereqItems, recommendedItems]);

  const setFrozenError = useCallback(() => {
    setError('講座は凍結中のため編集・承認申請・公開ができません。');
  }, []);

  const submit = useCallback(
    async (action: ActionType) => {
      if (!courseId) return;
      const t = title.trim();
      if (!t) {
        setError('タイトルを入力してください');
        return;
      }
      setError(null);
      setSubmitting(action);

      try {
        const body = {
          title: t,
          description: buildDescription(),
          catalogVisibility:
            action === 'draft'
              ? ('private' as const)
              : ('public_listed' as const),
          visibility: 'public' as const,
        };
        await updateInstructorCourse(courseId, body);

        if (action === 'request_approval') {
          await requestApproval(courseId);
        } else if (action === 'publish') {
          await publishCourse(courseId);
        }

        router.push(`/instructor/courses/${courseId}`);
      } catch (e) {
        if (e instanceof ApiError && e.statusCode === 423) {
          setFrozenError();
        } else {
          setError(
            e instanceof Error ? e.message : 'API error',
          );
        }
      } finally {
        setSubmitting(null);
      }
    },
    [courseId, title, buildDescription, router, setFrozenError],
  );

  if (!courseId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-sm text-[#878787]">講座IDがありません</p>
      </div>
    );
  }

  if (isLoading || isBootcamp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-sm text-[#878787]">読み込み中…</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <p className="text-sm text-red-600">
          {queryError instanceof Error
            ? queryError.message
            : '講座の取得に失敗しました'}
        </p>
        <Link
          href="/instructor/courses"
          className="mt-4 inline-block text-sm text-[#5d5fef] hover:underline"
        >
          講座一覧へ
        </Link>
      </div>
    );
  }

  const canEdit = !isFrozen && (style === 'one_on_one' || style === 'seminar');

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[1200px] px-6 py-6 md:px-8">
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">
            TOP
          </Link>
          <span aria-hidden className="text-[#878787]">
            <ChevronRightIcon />
          </span>
          <Link href="/instructor/courses" className="hover:underline">
            講座一覧
          </Link>
          <span aria-hidden className="text-[#878787]">
            <ChevronRightIcon />
          </span>
          <span className="text-black">講座編集</span>
        </nav>

        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            講座編集（{STYLE_LABEL[style ?? ''] ?? style}）
          </h1>
        </div>

        {isFrozen && (
          <p className="mb-4 rounded bg-amber-50 px-4 py-2 text-sm text-amber-800">
            この講座は凍結されています。編集・承認申請・公開はできません。
          </p>
        )}

        {error && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-6">
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
                タイトル
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルが入ります"
                disabled={!canEdit}
                className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm tracking-[0.56px] text-black placeholder:text-[#c7c7c7] disabled:bg-[#f8f8f8] disabled:text-[#878787]"
              />
            </div>

            <div>
              <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
                日時
                {style === 'one_on_one'
                  ? '（1on1の場合は1日のみ）'
                  : '（複数回・15分刻み）'}
              </p>
              <div className="rounded border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#c7c7c7]">
                日程を追加する
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs tracking-[0.96px] text-[#878787]">
                講座方式
              </p>
              <p className="text-sm text-black">
                {STYLE_LABEL[style ?? ''] ?? style}（変更不可）
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
              <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
                ライブ・イベントURL
              </label>
              <input
                type="url"
                placeholder="https://zoom.co/123456"
                disabled={!canEdit}
                className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm tracking-[0.56px] text-black placeholder:text-[#c7c7c7] disabled:bg-[#f8f8f8]"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={() => submit('draft')}
                disabled={!!submitting || !canEdit}
                className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-black hover:bg-gray-50 disabled:opacity-50"
              >
                下書き保存する
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={!!submitting}
                className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-black hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => submit('request_approval')}
                disabled={!!submitting || !canEdit}
                className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting === 'request_approval'
                  ? '送信中…'
                  : '承認申請する'}
              </button>
              <button
                type="button"
                onClick={() => submit('publish')}
                disabled={!!submitting || !canEdit}
                className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {submitting === 'publish'
                  ? '送信中…'
                  : '範囲を限定して公開する'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <p className="text-sm text-black">
              {title || 'タイトルが入ります'}（LPヘッダー）
            </p>

            <div>
              <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
                この講座の必要性
              </label>
              <textarea
                value={necessity}
                onChange={(e) => setNecessity(e.target.value)}
                placeholder="この講座の必要性についての説明が入ります。"
                rows={5}
                disabled={!canEdit}
                className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm leading-relaxed tracking-[0.56px] text-black placeholder:text-[#c7c7c7] disabled:bg-[#f8f8f8]"
              />
            </div>

            <ListSection
              label="この講座で解決すること"
              items={solveItems}
              onAdd={() => addItem(setSolveItems)}
              onUpdate={(i, v) => updateItem(setSolveItems, i, v)}
              placeholder="この講座の必要性についての説明が入ります。"
              disabled={!canEdit}
            />
            <ListSection
              label="前提条件"
              items={prereqItems}
              onAdd={() => addItem(setPrereqItems)}
              onUpdate={(i, v) => updateItem(setPrereqItems, i, v)}
              placeholder="前提条件が入ります。"
              disabled={!canEdit}
            />
            <ListSection
              label="こんな方におすすめ"
              items={recommendedItems}
              onAdd={() => addItem(setRecommendedItems)}
              onUpdate={(i, v) =>
                updateItem(setRecommendedItems, i, v)
              }
              placeholder="こんな方におすすめの説明が入ります。"
              disabled={!canEdit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSection({
  label,
  items,
  onAdd,
  onUpdate,
  placeholder,
  disabled,
}: {
  label: string;
  items: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
        {label}
      </label>
      <div className="flex flex-col gap-3">
        {items.map((value, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 rounded border border-[#e2e8f0] px-3 py-2 text-sm tracking-[0.56px] text-black placeholder:text-[#c7c7c7] disabled:bg-[#f8f8f8]"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          disabled={disabled}
          className="flex items-center gap-2 text-sm text-[#5d5fef] hover:underline disabled:opacity-50"
        >
          <PlusIcon />
          項目を追加する
        </button>
      </div>
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4.5 3L7.5 6L4.5 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M10 4v12M4 10h12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
