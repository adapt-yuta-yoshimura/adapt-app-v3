'use client';

import { usePathname } from 'next/navigation';
import { WebHeader } from './WebHeader';
import { InstructorSidebar } from './InstructorSidebar';
import { LearnerSidebar } from './LearnerSidebar';

export function WebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInstructor = pathname.startsWith('/instructor');

  return (
    <div className="flex min-h-screen flex-col bg-body">
      <WebHeader />
      <div className="flex flex-1">
        {isInstructor ? <InstructorSidebar /> : <LearnerSidebar />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
