import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

/** コース詳細レスポンス型 */
interface CourseDetailResponse {
  course: {
    id: string;
    title: string;
    description: string | null;
    ownerUserId: string;
    catalogVisibility: string;
    visibility: string;
    isFrozen: boolean;
    frozenAt: string | null;
    frozenByUserId: string | null;
    freezeReason: string | null;
    createdAt: string;
    updatedAt: string;
  };
  channels: Array<{
    id: string;
    courseId: string;
    type: string;
    name: string | null;
  }>;
  stats: {
    memberCount: number;
    channelCount: number;
  };
}

/**
 * コース詳細を取得するカスタムフック
 * @param courseId コースID
 */
export function useCourse(courseId: string): ReturnType<typeof useQuery<CourseDetailResponse>> {
  return useQuery<CourseDetailResponse>({
    queryKey: ['courses', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get<CourseDetailResponse>(
        `/api/v1/store/courses/${courseId}`,
      );
      return data;
    },
    enabled: !!courseId,
  });
}
