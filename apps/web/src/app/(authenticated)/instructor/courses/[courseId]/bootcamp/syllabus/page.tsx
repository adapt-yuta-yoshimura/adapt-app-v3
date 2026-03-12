// INS-UI-20 ブートキャンプ STEP2（シラバス・レッスン構成）
'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSyllabus,
  createSection,
  updateSection,
  deleteSection,
} from '@/lib/instructor-api';

const LESSON_TYPE_LABEL: Record<string, string> = {
  text: '座学',
  video: '動画',
  live: 'ライブ',
  assignment: '課題',
};

export default function BootcampSyllabusPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';

  const { data: syllabus, isLoading, error } = useQuery({
    queryKey: ['instructor', 'syllabus', courseId],
    queryFn: () => getSyllabus(courseId),
    enabled: !!courseId,
  });

  const addSectionMutation = useMutation({
    mutationFn: (title: string) =>
      createSection(courseId, { title: title || '新しいセクション' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor', 'syllabus', courseId] });
    },
  });

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  const handleAddSection = useCallback(() => {
    addSectionMutation.mutate(newSectionTitle.trim() || '新しいセクション', {
      onSuccess: () => setNewSectionTitle(''),
    });
  }, [newSectionTitle, addSectionMutation]);

  if (!courseId) {
    return (
      <div className="p-8 text-red-600">
        講座IDがありません。
      </div>
    );
  }

  if (isLoading || !syllabus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc]">
        <p className="text-sm text-[#878787]">読み込み中…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        {error instanceof Error ? error.message : 'シラバスの取得に失敗しました'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <div className="border-b border-[#eaeaea]" />
      <div className="mx-auto max-w-[900px] px-6 py-6 md:px-8">
        <nav className="mb-4 flex items-center gap-1 text-xs tracking-[0.96px] text-[#878787]">
          <Link href="/instructor" className="hover:underline">TOP</Link>
          <ChevronRight />
          <Link href="/instructor/courses/new" className="hover:underline">講座を作る</Link>
          <ChevronRight />
          <Link href={`/instructor/courses/${courseId}/edit`} className="hover:underline">ブートキャンプ</Link>
          <ChevronRight />
          <span>シラバス</span>
        </nav>

        <div className="mb-2 text-sm font-bold tracking-[1.12px] text-[#5d5fef]">
          STEP2
        </div>
        <div className="relative mb-6 pl-5">
          <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-[#5d5fef]" />
          <h1 className="text-2xl tracking-[1.92px] text-black">
            シラバス・レッスン構成
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#878787]">
            セクションを追加し、各セクションにレッスンを配置してください。
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {syllabus.sections.map((section) => (
            <SectionBlock
              key={section.id}
              courseId={courseId}
              section={section}
              isEditing={editingSectionId === section.id}
              editTitle={editingSectionTitle}
              onEditTitleChange={setEditingSectionTitle}
              onStartEdit={() => {
                setEditingSectionId(section.id);
                setEditingSectionTitle(section.title);
              }}
              onSaveEdit={() => {
                updateSection(section.id, { title: editingSectionTitle }).then(() => {
                  queryClient.invalidateQueries({ queryKey: ['instructor', 'syllabus', courseId] });
                  setEditingSectionId(null);
                });
              }}
              onCancelEdit={() => setEditingSectionId(null)}
              onDelete={() => {
                if (window.confirm('このセクションを削除しますか？')) {
                  deleteSection(section.id).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['instructor', 'syllabus', courseId] });
                  });
                }
              }}
            />
          ))}

          <div className="rounded-lg border border-dashed border-[#d9d9d9] bg-white p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSectionTitle}
                onChange={(e) => setNewSectionTitle(e.target.value)}
                placeholder="セクション名（例: Week 1）"
                className="flex-1 rounded border border-[#e2e8f0] px-3 py-2 text-sm text-black placeholder:text-[#c7c7c7]"
              />
              <button
                type="button"
                onClick={handleAddSection}
                disabled={addSectionMutation.isPending}
                className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {addSectionMutation.isPending ? '追加中…' : 'セクションを追加'}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#eaeaea] pt-6">
            <Link
              href={`/instructor/courses/${courseId}/bootcamp/publish`}
              className="rounded bg-[#5d5fef] px-4 py-2 text-sm text-white hover:opacity-90"
            >
              公開設定に進む
            </Link>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded border border-[#e2e8f0] bg-white px-4 py-2 text-sm text-black hover:bg-gray-50"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  courseId,
  section,
  isEditing,
  editTitle,
  onEditTitleChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  courseId: string;
  section: { id: string; title: string; lessons?: Array<{ id: string; title: string; type: string }> };
  isEditing: boolean;
  editTitle: string;
  onEditTitleChange: (v: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const lessons = section.lessons ?? [];
  return (
    <div className="rounded-lg border border-[#e2e8f0] bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        {isEditing ? (
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="flex-1 rounded border border-[#e2e8f0] px-3 py-2 text-sm text-black"
            />
            <button
              type="button"
              onClick={onSaveEdit}
              className="rounded bg-[#5d5fef] px-3 py-2 text-sm text-white"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="rounded border px-3 py-2 text-sm"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-medium text-black">{section.title}</h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onStartEdit}
                className="text-sm text-[#5d5fef] hover:underline"
              >
                編集
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="text-sm text-red-600 hover:underline"
              >
                削除
              </button>
            </div>
          </>
        )}
      </div>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/instructor/courses/${courseId}/bootcamp/lessons/${lesson.id}`}
              className="flex items-center justify-between rounded border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 text-sm text-black hover:bg-[#f1f5f9]"
            >
              <span>{lesson.title || '（無題）'}</span>
              <span className="text-xs text-[#878787]">
                {LESSON_TYPE_LABEL[lesson.type] ?? lesson.type}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={`/instructor/courses/${courseId}/bootcamp/lessons/new?sectionId=${section.id}`}
            className="block rounded border border-dashed border-[#d9d9d9] px-3 py-2 text-center text-sm text-[#5d5fef] hover:bg-[#f8f8ff]"
          >
            ＋ レッスンを追加
          </Link>
        </li>
      </ul>
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
