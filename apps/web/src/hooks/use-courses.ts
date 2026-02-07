import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';

/** コース一覧レスポンス型 */
interface CourseListResponse {
  items: Array<{
    course: {
      id: string;
      title: string;
      description: string | null;
      ownerUserId: string;
      catalogVisibility: string;
      visibility: string;
      isFrozen: boolean;
      createdAt: string;
      updatedAt: string;
    };
    channelCount: number;
    memberCount: number;
    isFrozen: boolean;
  }>;
  meta: {
    page: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      perPage: number;
    };
  };
}

/**
 * 公開コース一覧を取得するカスタムフック（ストア向け）
 * @param page ページ番号
 * @param limit 取得件数
 */
export function useCourses(page: number = 1, limit: number = 20): ReturnType<typeof useQuery<CourseListResponse>> {
  return useQuery<CourseListResponse>({
    queryKey: ['courses', 'public', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get<CourseListResponse>(
        '/api/v1/store/courses',
        { params: { page, limit } },
      );
      return data;
    },
  });
}

/**
 * 自分のコース一覧を取得するカスタムフック（受講中）
 */
export function useMyCourses(): ReturnType<typeof useQuery<CourseListResponse>> {
  return useQuery<CourseListResponse>({
    queryKey: ['courses', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get<CourseListResponse>(
        '/api/v1/instructor/courses',
      );
      return data;
    },
  });
}
