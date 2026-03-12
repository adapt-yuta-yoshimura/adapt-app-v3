// INS-UI-22 ブートキャンプ STEP3（公開設定・承認申請）
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getInstructorCourse,
  requestApproval,
  publishCourse,
} from '@/lib/instructor-api';

export default function BootcampPublishPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';

  const { data: courseDetail, isLoading, error } = useQuery({
    queryKey: ['instructor', 'course', courseId],
    queryFn: () => getInstructorCourse(courseId),
    enabled: !!courseId,
  });

  const [submitting, setSubmitting] = useState<'approval' | 'publish' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestApproval = async () => {
    setErrorMsg(null);
    setSubmitting('approval');
    try {
      await requestApproval(courseId);
      router.push(`/instructor/courses/${courseId}/edit`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '承認申請に失敗しました');
    } finally {
      setSubmitting(null);
    }
  };

  const handlePublish = async () => {
    setErrorMsg(null);
    setSubmitting('publish');
    try {
      await publishCourse(courseId);
      router.push(`/instructor/courses/${courseId}/edit`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : '公開に失敗しました');
    } finally {
      setSubmitting(null);
    }
  };

  if (!courseId) {
    return <div className="p-8 text-red-600">講座IDがありません。</div>;
  }

  if (isLoading || !courseDetail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-sm text-[#878787]">読み込み中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error instanceof Error ? error.message : '講座の取得に失敗しました'}
      </div>
    );
  }

  const course = courseDetail.course;

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[800px] px-6 py-6 md:px-8">
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">TOP</Link>
          <ChevronRight />
          <Link href="/instructor/courses/new" className="hover:underline">講座を作る</Link>
          <ChevronRight />
          <Link href={`/instructor/courses/${courseId}/bootcamp/syllabus`} className="hover:underline">シラバス</Link>
          <ChevronRight />
          <span>公開設定</span>
        </nav>

        <div className="mb-2 text-sm font-bold tracking-[1.12px] text-[#5d5fef]">
          STEP3
        </div>
        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            公開設定・承認申請
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#878787]">
            内容を確認し、承認申請または範囲を限定して公開してください。
          </p>
        </div>

        {errorMsg && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{errorMsg}</p>
        )}

        <div className="rounded-lg border border-[#e2e8f0] bg-white p-6">
          <h2 className="mb-4 text-lg font-medium text-black">講座サマリー</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-[#878787]">タイトル</dt>
              <dd className="font-medium text-black">{course.title}</dd>
            </div>
            <div>
              <dt className="text-[#878787]">公開状態</dt>
              <dd className="text-black">{course.catalogVisibility ?? '—'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-[#878787]">
            ※ 開催期間・申込期日・定員・料金はSoT上で別フィールドのため、プレースホルダー表示です。
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[#eaeaea] pt-6">
          <button
            type="button"
            onClick={handleRequestApproval}
            disabled={!!submitting}
            className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting === 'approval' ? '送信中…' : '承認申請する'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!!submitting}
            className="rounded bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
          >
            {submitting === 'publish' ? '送信中…' : '範囲を限定して公開する'}
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
