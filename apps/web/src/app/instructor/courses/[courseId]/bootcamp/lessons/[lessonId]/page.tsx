// INS-UI-21 ブートキャンプ STEP2（レッスン編集）
'use client';

import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useState, Suspense, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLesson,
  updateLesson,
  createLesson,
  getSyllabus,
} from '@/lib/instructor-api';

const LESSON_TYPES = [
  { value: 'text', label: '座学' },
  { value: 'video', label: '動画' },
  { value: 'live', label: 'ライブ' },
  { value: 'assignment', label: '課題' },
] as const;

export default function BootcampLessonEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#878787]">読み込み中…</div>}>
      <BootcampLessonEditContent />
    </Suspense>
  );
}

function BootcampLessonEditContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';
  const lessonId = typeof params.lessonId === 'string' ? params.lessonId : '';
  const sectionId = searchParams.get('sectionId');
  const isNew = lessonId === 'new';

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['instructor', 'lesson', lessonId],
    queryFn: () => getLesson(lessonId),
    enabled: !!lessonId && !isNew,
  });

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'text' | 'video' | 'live' | 'assignment'>('text');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lesson && !isNew) {
      const L = lesson as Record<string, unknown>;
      if (typeof L.title === 'string') setTitle(L.title);
      const t = L.type as string;
      if (t === 'text' || t === 'video' || t === 'live' || t === 'assignment') setType(t);
    }
  }, [lesson, isNew]);

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => updateLesson(lessonId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'lesson', lessonId] });
    },
  });

  const handleSave = useCallback(async () => {
    const t = title.trim();
    if (!t) {
      setError('タイトルを入力してください');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (isNew) {
        if (!sectionId) {
          setError('sectionId が必要です');
          setSubmitting(false);
          return;
        }
        await createLesson(sectionId, { title: t, type, ...(content && { content }) });
        const syllabus = await getSyllabus(courseId);
        const section = syllabus.sections.find((s) => s.id === sectionId);
        const lessons = section?.lessons ?? [];
        const created = lessons[lessons.length - 1];
        if (created?.id) {
          router.replace(`/instructor/courses/${courseId}/bootcamp/lessons/${created.id}`);
        } else {
          router.push(`/instructor/courses/${courseId}/bootcamp/syllabus`);
        }
      } else {
        await updateMutation.mutateAsync({ title: t, type, ...(content && { content }) });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }, [isNew, sectionId, courseId, title, type, content, updateMutation, router]);

  if (!courseId) {
    return <div className="p-8 text-red-600">講座IDがありません。</div>;
  }

  if (!isNew && isLoading && !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-sm text-[#878787]">読み込み中…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[800px] px-6 py-6 md:px-8">
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">TOP</Link>
          <ChevronRight />
          <Link href={`/instructor/courses/${courseId}/bootcamp/syllabus`} className="hover:underline">シラバス</Link>
          <ChevronRight />
          <span>{isNew ? '新規レッスン' : 'レッスン編集'}</span>
        </nav>

        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            {isNew ? '新規レッスン' : 'レッスン編集'}
          </h1>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="レッスンタイトル"
              className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm text-black placeholder:text-[#c7c7c7]"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">レッスンタイプ</label>
            <div className="flex flex-wrap gap-2">
              {LESSON_TYPES.map((opt) => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    checked={type === opt.value}
                    onChange={() => setType(opt.value)}
                    className="rounded border-[#e2e8f0] text-[#5d5fef]"
                  />
                  <span className="text-sm text-black">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* タイプ別プレースホルダー */}
          <div>
            <label className="mb-2 block text-xs tracking-[0.96px] text-[#878787]">
              {type === 'text' && '本文（マークダウン）'}
              {type === 'video' && '動画（アップロード/埋め込み）'}
              {type === 'live' && '日時・URL'}
              {type === 'assignment' && '提出期限・確認期限'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                type === 'text'
                  ? 'マークダウン形式で入力…'
                  : type === 'video'
                    ? 'TODO(TBD): 動画アップロードAPI未定義'
                    : type === 'live'
                      ? '日時とURLを入力…'
                      : '提出期限・確認期限を入力…'
              }
              rows={6}
              className="w-full rounded border border-[#e2e8f0] px-3 py-2 text-sm leading-relaxed text-black placeholder:text-[#c7c7c7]"
            />
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#eaeaea] pt-6">
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting}
              className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? '保存中…' : '保存'}
            </button>
            <Link
              href={`/instructor/courses/${courseId}/bootcamp/syllabus`}
              className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-black hover:bg-gray-50"
            >
              シラバスに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <span aria-hidden className="text-[#878787]">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
