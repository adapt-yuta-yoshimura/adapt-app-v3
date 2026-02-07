import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PrismaService } from '../../../common/prisma/prisma.service';
import { CourseRepository } from './course.repository';

describe('CourseRepository', () => {
  let repository: CourseRepository;
  let prisma: {
    course: {
      findUnique: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    courseMember: { count: ReturnType<typeof vi.fn> };
    courseChannel: { count: ReturnType<typeof vi.fn> };
    $transaction: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = {
      course: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
      courseMember: { count: vi.fn() },
      courseChannel: { count: vi.fn() },
      $transaction: vi.fn(),
    };

    repository = new CourseRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('コースが見つかる場合にコースを返す', async () => {
      const mockCourse = {
        id: 'course-1',
        title: 'テストコース',
        description: 'テスト説明',
        isFrozen: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await repository.findById('course-1');

      expect(result).toEqual(mockCourse);
      expect(prisma.course.findUnique).toHaveBeenCalledWith({
        where: { id: 'course-1' },
      });
    });

    it('コースが見つからない場合にnullを返す', async () => {
      prisma.course.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwner', () => {
    it('オーナーのコース一覧を降順で返す', async () => {
      const mockCourses = [
        { id: 'course-1', title: 'コース1' },
        { id: 'course-2', title: 'コース2' },
      ];

      prisma.course.findMany.mockResolvedValue(mockCourses);

      const result = await repository.findByOwner('user-1');

      expect(result).toEqual(mockCourses);
      expect(prisma.course.findMany).toHaveBeenCalledWith({
        where: { ownerUserId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('コースを作成して返す', async () => {
      const createData = {
        title: '新しいコース',
        description: 'テスト',
        ownerUserId: 'user-1',
        createdByUserId: 'user-1',
        catalogVisibility: 'public_listed' as const,
        visibility: 'members_only' as const,
      };

      const mockCreated = { id: 'new-course', ...createData, status: 'draft' };
      prisma.course.create.mockResolvedValue(mockCreated);

      const result = await repository.create(createData);

      expect(result).toEqual(mockCreated);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          description: createData.description,
          ownerUserId: createData.ownerUserId,
          createdByUserId: createData.createdByUserId,
          catalogVisibility: createData.catalogVisibility,
          visibility: createData.visibility,
          status: 'draft',
        },
      });
    });
  });

  describe('countMembers', () => {
    it('コースのメンバー数を返す', async () => {
      prisma.courseMember.count.mockResolvedValue(5);

      const result = await repository.countMembers('course-1');

      expect(result).toBe(5);
      expect(prisma.courseMember.count).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
      });
    });
  });

  describe('countChannels', () => {
    it('コースのチャンネル数を返す', async () => {
      prisma.courseChannel.count.mockResolvedValue(3);

      const result = await repository.countChannels('course-1');

      expect(result).toBe(3);
      expect(prisma.courseChannel.count).toHaveBeenCalledWith({
        where: { courseId: 'course-1' },
      });
    });
  });
});
