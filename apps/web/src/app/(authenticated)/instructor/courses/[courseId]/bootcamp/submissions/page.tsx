// INS-UI-24 ブートキャンプ運営（提出物管理）
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowUpDown, Filter } from 'lucide-react';
import { getSubmissions, getInstructorCourse } from '@/lib/bootcamp-ops-api';

const TABS = [
  { key: 'all', label: 'すべて' },
  { key: 'not_submitted', label: '未提出' },
  { key: 'unconfirmed', label: '未確認' },
  { key: 'confirmed', label: '確認済み' },
] as const;

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function BootcampOpsSubmissionsPage() {
  const params = useParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['key']>('all');

  const { data: course } = useQuery({
    queryKey: ['instructor', 'course', courseId],
    queryFn: () => getInstructorCourse(courseId),
    enabled: !!courseId,
  });

  const { data: submissionsData, isLoading, error } = useQuery({
    queryKey: ['instructor', 'submissions', courseId],
    queryFn: () => getSubmissions(courseId),
    enabled: !!courseId,
  });

  const courseTitle = course?.course?.title ?? '講座';

  const submissionItems =
    submissionsData && 'items' in submissionsData && Array.isArray((submissionsData as { items: unknown[] }).items)
      ? (submissionsData as { items: SubmissionRow[] }).items
      : [];

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-xs tracking-[0.96px] text-grey3">
        <Link href="/instructor" className="hover:underline">
          TOP
        </Link>
        <span aria-hidden>/</span>
        <Link href="/instructor/courses" className="hover:underline">
          ブートキャンプ
        </Link>
        <span aria-hidden>/</span>
        <span>提出物管理</span>
        <span aria-hidden>/</span>
        <span className="text-black">{courseTitle}</span>
      </nav>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-0 border-b border-[#E2E8F0]">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`border-b-2 px-4 py-2 text-sm tracking-[0.56px] ${
                  activeTab === tab.key
                    ? 'border-iris-100 text-iris-100'
                    : 'border-transparent text-grey3'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-iris-light px-3 py-2 text-sm text-grey3"
            >
              <ArrowUpDown className="h-4 w-4" />
              並び替え
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded bg-iris-light px-3 py-2 text-sm text-grey3"
            >
              <Filter className="h-4 w-4" />
              絞り込み
            </button>
          </div>
        </div>

        {isLoading && (
          <p className="py-8 text-center text-sm text-grey3">読み込み中…</p>
        )}
        {error && (
          <p className="py-8 text-center text-sm text-red-600">
            {error instanceof Error ? error.message : '取得に失敗しました'}
          </p>
        )}
        {!isLoading && !error && submissionItems.length === 0 && (
          <p className="py-8 text-center text-sm text-grey3">
            提出物データはありません
          </p>
        )}
        {!isLoading && !error && submissionItems.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-left text-xs text-grey3">
                  <th className="p-3 font-medium">受講者</th>
                  <th className="p-3 font-medium">進捗状況</th>
                  <th className="p-3 font-medium">課題提出状況</th>
                  <th className="p-3 font-medium">最終提出日時</th>
                  <th className="w-32 p-3" aria-label="操作" />
                </tr>
              </thead>
              <tbody>
                {submissionItems.map((row) => (
                  <tr
                    key={row.userId ?? row.id ?? Math.random()}
                    className="border-b border-[#E2E8F0] last:border-b-0"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-l-lg bg-iris-light">
                          {row.avatarUrl ? (
                            <img
                              src={row.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-medium text-grey3">
                              {(row.name ?? row.email ?? '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-black">
                            {row.name ?? '—'}
                          </p>
                          <p className="text-xs text-grey3">{row.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-black">
                      {row.progressText ?? '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-black">
                          {row.submissionStatusText ?? '—'}
                        </span>
                        {row.hasUnconfirmed && (
                          <span className="text-xs text-red-600">
                            未確認の提出物あり
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-grey3">
                      {formatDateTime(row.lastSubmittedAt)}
                    </td>
                    <td className="p-3">
                      <Link
                        href={`${typeof params.courseId === 'string' ? `/instructor/courses/${params.courseId}/bootcamp/submissions/${row.userId ?? row.id}` : '#'}`}
                        className="inline-flex items-center justify-center rounded bg-iris-light px-3 py-2 text-sm font-medium text-iris-100 hover:opacity-90"
                      >
                        提出物を確認
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

type SubmissionRow = {
  id?: string;
  userId?: string;
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  progressText?: string;
  submissionStatusText?: string;
  hasUnconfirmed?: boolean;
  lastSubmittedAt?: string | null;
};
