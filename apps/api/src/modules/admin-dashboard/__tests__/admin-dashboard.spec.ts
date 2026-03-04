import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminDashboardUseCase } from '../usecases/admin-dashboard.usecase';
import { DashboardRepository } from '../repositories/dashboard.repository';

/**
 * ADMIN-01: ダッシュボード UseCase テスト
 *
 * SoT: openapi_admin.yaml - API-ADMIN-22/23/24
 * SoT: schema.prisma - User, Course, Payment, AuditEvent
 */

describe('AdminDashboardUseCase', () => {
  let useCase: AdminDashboardUseCase;
  let dashboardRepo: {
    countUsersByRole: ReturnType<typeof vi.fn>;
    countCourses: ReturnType<typeof vi.fn>;
    sumRevenueThisMonth: ReturnType<typeof vi.fn>;
    sumRevenueLastMonth: ReturnType<typeof vi.fn>;
    countUsersByRoleAtEndOfLastMonth: ReturnType<typeof vi.fn>;
    countCoursesAtEndOfLastMonth: ReturnType<typeof vi.fn>;
    countCoursesCreatedThisMonth: ReturnType<typeof vi.fn>;
    getTrendData: ReturnType<typeof vi.fn>;
    aggregateRevenue: ReturnType<typeof vi.fn>;
    findRecentAuditEvents: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    dashboardRepo = {
      countUsersByRole: vi.fn(),
      countCourses: vi.fn(),
      sumRevenueThisMonth: vi.fn(),
      sumRevenueLastMonth: vi.fn(),
      countUsersByRoleAtEndOfLastMonth: vi.fn(),
      countCoursesAtEndOfLastMonth: vi.fn(),
      countCoursesCreatedThisMonth: vi.fn(),
      getTrendData: vi.fn(),
      aggregateRevenue: vi.fn(),
      findRecentAuditEvents: vi.fn(),
    };
    useCase = new AdminDashboardUseCase(
      dashboardRepo as unknown as DashboardRepository,
    );
  });

  // -------------------------------------------------------------------------
  // [API-ADMIN-22] GET /api/v1/admin/dashboard/kpi
  // -------------------------------------------------------------------------
  describe('getKpi', () => {
    it('operator → 200: DashboardKpiResponse を返す', async () => {
      dashboardRepo.countUsersByRole.mockResolvedValue(10);
      dashboardRepo.countCourses.mockResolvedValue(5);
      dashboardRepo.sumRevenueThisMonth.mockResolvedValue(100000);
      dashboardRepo.sumRevenueLastMonth.mockResolvedValue(80000);
      dashboardRepo.countUsersByRoleAtEndOfLastMonth.mockResolvedValue(8);
      dashboardRepo.countCoursesAtEndOfLastMonth.mockResolvedValue(4);
      dashboardRepo.countCoursesCreatedThisMonth.mockResolvedValue(1);
      dashboardRepo.getTrendData.mockResolvedValue([1, 2, 3, 4, 5, 6, 7]);

      const result = await useCase.getKpi();

      expect(result).toBeDefined();
      expect(result.learners).toBeDefined();
      expect(result.instructors).toBeDefined();
      expect(result.courses).toBeDefined();
      expect(result.revenue).toBeDefined();
      expect(result.learners.current).toBe(10);
      expect(result.courses.change).toBe(1);
      expect(result.revenue.current).toBe(100000);
    });

    it('KpiCard に current, change, trend が含まれること', async () => {
      dashboardRepo.countUsersByRole.mockResolvedValue(10);
      dashboardRepo.countCourses.mockResolvedValue(5);
      dashboardRepo.sumRevenueThisMonth.mockResolvedValue(0);
      dashboardRepo.sumRevenueLastMonth.mockResolvedValue(0);
      dashboardRepo.countUsersByRoleAtEndOfLastMonth.mockResolvedValue(10);
      dashboardRepo.countCoursesAtEndOfLastMonth.mockResolvedValue(5);
      dashboardRepo.countCoursesCreatedThisMonth.mockResolvedValue(0);
      dashboardRepo.getTrendData.mockResolvedValue([1, 2, 3, 4, 5, 6, 7]);

      const result = await useCase.getKpi();

      expect(typeof result.learners.current).toBe('number');
      expect(typeof result.learners.change).toBe('number');
      expect(Array.isArray(result.learners.trend)).toBe(true);
      expect(result.learners.trend).toHaveLength(7);
      expect(result.learners.trend.every((n) => typeof n === 'number')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // [API-ADMIN-23] GET /api/v1/admin/dashboard/revenue-chart?period=6M
  // -------------------------------------------------------------------------
  describe('getRevenueChart', () => {
    it('operator → 200: RevenueChartResponse を返す', async () => {
      dashboardRepo.aggregateRevenue.mockResolvedValue([
        { label: '10月', value: 100 },
        { label: '11月', value: 200 },
      ]);

      const result = await useCase.getRevenueChart('6M');

      expect(result.period).toBe('6M');
      expect(Array.isArray(result.dataPoints)).toBe(true);
      expect(dashboardRepo.aggregateRevenue).toHaveBeenCalledWith('6M');
    });

    it('dataPoints 各要素に label, value が含まれること', async () => {
      dashboardRepo.aggregateRevenue.mockResolvedValue([
        { label: '10月', value: 100 },
        { label: '11月', value: 200 },
      ]);

      const result = await useCase.getRevenueChart('6M');

      expect(result.dataPoints.length).toBeGreaterThan(0);
      expect(typeof result.dataPoints[0].label).toBe('string');
      expect(typeof result.dataPoints[0].value).toBe('number');
    });

    it('各 period (7D/1M/6M/1Y) で aggregateRevenue が正しく呼ばれること', async () => {
      dashboardRepo.aggregateRevenue.mockResolvedValue([]);

      await useCase.getRevenueChart('7D');
      expect(dashboardRepo.aggregateRevenue).toHaveBeenCalledWith('7D');

      await useCase.getRevenueChart('1M');
      expect(dashboardRepo.aggregateRevenue).toHaveBeenCalledWith('1M');

      await useCase.getRevenueChart('1Y');
      expect(dashboardRepo.aggregateRevenue).toHaveBeenCalledWith('1Y');
    });
  });

  // -------------------------------------------------------------------------
  // [API-ADMIN-24] GET /api/v1/admin/dashboard/activities?limit=10
  // -------------------------------------------------------------------------
  describe('getActivities', () => {
    it('operator → 200: DashboardActivitiesResponse を返す', async () => {
      const mockEvent = {
        id: 'evt-1',
        occurredAt: new Date(),
        actorUserId: 'u1',
        eventType: 'course_created',
        actorGlobalRole: 'operator',
        courseId: 'c1',
        channelId: null,
        messageId: null,
        reason: 'test',
        metaJson: {},
        requestId: null,
        ipHash: null,
        userAgentHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dashboardRepo.findRecentAuditEvents.mockResolvedValue([mockEvent]);

      const result = await useCase.getActivities(10);

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('evt-1');
      expect(result.items[0].eventType).toBe('course_created');
      expect(typeof result.items[0].occurredAt).toBe('string');
    });

    it('items が AuditEventView 構造であること', async () => {
      const mockEvent = {
        id: 'evt-1',
        occurredAt: new Date(),
        actorUserId: 'u1',
        eventType: 'user_created',
        actorGlobalRole: 'operator',
        courseId: null,
        channelId: null,
        messageId: null,
        reason: 'test',
        metaJson: { name: 'Test' },
        requestId: null,
        ipHash: null,
        userAgentHash: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      dashboardRepo.findRecentAuditEvents.mockResolvedValue([mockEvent]);

      const result = await useCase.getActivities(10);

      expect(result.items[0]).toMatchObject({
        id: 'evt-1',
        actorUserId: 'u1',
        eventType: 'user_created',
        reason: 'test',
      });
      expect(typeof result.items[0].occurredAt).toBe('string');
      expect(typeof result.items[0].createdAt).toBe('string');
      expect(typeof result.items[0].updatedAt).toBe('string');
    });

    it('findRecentAuditEvents が limit で呼ばれること', async () => {
      dashboardRepo.findRecentAuditEvents.mockResolvedValue([]);

      await useCase.getActivities(10);
      expect(dashboardRepo.findRecentAuditEvents).toHaveBeenCalledWith(10);

      await useCase.getActivities(5);
      expect(dashboardRepo.findRecentAuditEvents).toHaveBeenCalledWith(5);
    });

    it('limit が 1 未満の場合は 1 として扱うこと', async () => {
      dashboardRepo.findRecentAuditEvents.mockResolvedValue([]);

      await useCase.getActivities(0);
      expect(dashboardRepo.findRecentAuditEvents).toHaveBeenCalledWith(1);
    });
  });
});
