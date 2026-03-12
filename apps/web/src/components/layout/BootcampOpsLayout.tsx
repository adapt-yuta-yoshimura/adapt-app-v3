'use client';

/**
 * ブートキャンプ運営レイアウト
 * Header + BootcampOpsSidebar + 講座名バナー + Content
 */

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { BootcampOpsSidebar } from './BootcampOpsSidebar';
import { getInstructorCourse } from '@/lib/bootcamp-ops-api';

function SidebarFallback() {
  return (
    <aside className="flex shrink-0">
      <div className="w-10 bg-iris-light" />
      <div className="w-[180px] bg-iris-bg" />
    </aside>
  );
}

export function BootcampOpsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';

  const { data: course, isLoading } = useQuery({
    queryKey: ['instructor', 'course', courseId],
    queryFn: () => getInstructorCourse(courseId),
    enabled: !!courseId,
  });

  const title = course?.course?.title ?? '（読み込み中…）';

  return (
    <div className="flex min-h-screen flex-col bg-body">
      <div className="flex flex-1">
        <Suspense fallback={<SidebarFallback />}>
          <BootcampOpsSidebar />
        </Suspense>
        <div className="flex flex-1 flex-col overflow-auto">
          {/* 講座名バナー 54px, bg #5D5FEF opacity-30 */}
          <div className="flex h-[54px] shrink-0 items-center justify-between bg-iris-100/30 px-4">
            <p className="text-lg tracking-[1.44px] text-black">{title}</p>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center text-black"
              aria-label="バナーを折りたたむ"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <main className="flex-1 overflow-auto bg-iris-bg p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
