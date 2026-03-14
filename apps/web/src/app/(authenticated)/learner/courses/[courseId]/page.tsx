// STU-UI-03 講座受講画面
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/server-auth';
import { fetchCourseDetail } from '@/lib/learner-api';
import { SyllabusTree } from '@/components/learner/SyllabusTree';
import { ChannelSummary } from '@/components/learner/ChannelSummary';
import { CourseStatsBar } from '@/components/learner/CourseStatsBar';
import { CourseStyleBadge } from '@/components/common/CourseStyleBadge';
import { FrozenMessage } from './FrozenMessage';

export default async function LearnerCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const token = await getServerToken();
  if (!token) {
    redirect(`/login?from=/learner/courses/${courseId}`);
  }

  const { data, statusCode } = await fetchCourseDetail(token, courseId);

  if (statusCode === 404) {
    notFound();
  }

  if (statusCode === 423 || !data) {
    return (
      <div className="p-6">
        <FrozenMessage />
      </div>
    );
  }

  const { course, channels, stats, syllabus } = data;
  const showSyllabus = syllabus.sections.length > 0 && syllabus.style === 'bootcamp';

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-black">{course.title}</h1>
      <p className="mt-1 text-sm text-grey3">STU-UI-03</p>
      <div className="mt-2">
        <CourseStyleBadge style={course.style} />
      </div>

      {course.description && (
        <p className="mt-4 text-sm text-grey3">{course.description}</p>
      )}

      <div className="mt-6">
        <CourseStatsBar stats={stats} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {showSyllabus && (
          <SyllabusTree
            courseId={syllabus.courseId}
            style={syllabus.style}
            sections={syllabus.sections}
          />
        )}
        <ChannelSummary channels={channels} />
      </div>
    </div>
  );
}
