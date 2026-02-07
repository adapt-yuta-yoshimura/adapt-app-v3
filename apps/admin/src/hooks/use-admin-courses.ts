'use client';

import { useQuery } from '@tanstack/react-query';

import { adminApiClient } from '@/lib/api-client';

interface AdminCourseItem {
  id: string;
  title: string;
  description: string | null;
  isFrozen: boolean;
  createdAt: string;
  memberCount: number;
  instructorName: string;
}

interface AdminCoursesResponse {
  items: AdminCourseItem[];
  meta: {
    total: number;
    page: { currentPage: number; totalPages: number; perPage: number };
  };
}

interface AdminCourseDetail {
  id: string;
  title: string;
  description: string | null;
  isFrozen: boolean;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    userId: string;
    displayName: string;
    email: string;
    role: string;
    joinedAt: string;
  }>;
  channels: Array<{
    id: string;
    name: string | null;
    type: string;
  }>;
  stats: {
    memberCount: number;
    channelCount: number;
    messageCount: number;
  };
}

export function useAdminCourses(
  page: number = 1,
  limit: number = 20,
  q?: string,
): ReturnType<typeof useQuery<AdminCoursesResponse>> {
  return useQuery<AdminCoursesResponse>({
    queryKey: ['admin', 'courses', page, limit, q],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (q) params.set('q', q);
      const { data } = await adminApiClient.get<AdminCoursesResponse>(
        `/api/v1/admin/courses?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useAdminCourseDetail(
  courseId: string,
): ReturnType<typeof useQuery<AdminCourseDetail>> {
  return useQuery<AdminCourseDetail>({
    queryKey: ['admin', 'courses', courseId],
    queryFn: async () => {
      const { data } = await adminApiClient.get<AdminCourseDetail>(
        `/api/v1/admin/courses/${courseId}`,
      );
      return data;
    },
    enabled: !!courseId,
  });
}
