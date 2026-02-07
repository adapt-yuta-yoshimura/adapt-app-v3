/**
 * テスト用モックデータ生成ヘルパー
 */

let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `test-id-${idCounter.toString().padStart(6, '0')}`;
}

/** テスト用ID生成カウンターをリセット */
export function resetIdCounter(): void {
  idCounter = 0;
}

/** テスト用ユーザーデータ */
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  const id = generateId();
  return {
    id,
    email: `user-${id}@test.adapt-co.io`,
    displayName: `テストユーザー ${id}`,
    avatarUrl: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    lastLoginAt: null,
    isActive: true,
    ...overrides,
  };
}

export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  isActive: boolean;
}

/** テスト用コースデータ */
export function createMockCourse(overrides: Partial<MockCourse> = {}): MockCourse {
  const id = generateId();
  return {
    id,
    title: `テストコース ${id}`,
    description: 'テスト用のコース説明',
    isFrozen: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface MockCourse {
  id: string;
  title: string;
  description: string | null;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** テスト用コースメンバーデータ */
export function createMockCourseMember(
  overrides: Partial<MockCourseMember> = {},
): MockCourseMember {
  const id = generateId();
  return {
    id,
    userId: generateId(),
    courseId: generateId(),
    role: 'learner',
    joinedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface MockCourseMember {
  id: string;
  userId: string;
  courseId: string;
  role: string;
  joinedAt: Date;
}

/** テスト用チャンネルデータ */
export function createMockChannel(overrides: Partial<MockChannel> = {}): MockChannel {
  const id = generateId();
  return {
    id,
    courseId: generateId(),
    name: `テストチャンネル ${id}`,
    type: 'general',
    threadsOnly: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface MockChannel {
  id: string;
  courseId: string;
  name: string | null;
  type: string;
  threadsOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** テスト用メッセージデータ */
export function createMockMessage(overrides: Partial<MockMessage> = {}): MockMessage {
  const id = generateId();
  return {
    id,
    channelId: generateId(),
    authorId: generateId(),
    body: 'テストメッセージの本文',
    isDeleted: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

export interface MockMessage {
  id: string;
  channelId: string;
  authorId: string;
  body: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** テスト用JWTペイロード */
export function createMockJwtPayload(
  overrides: Partial<MockJwtPayload> = {},
): MockJwtPayload {
  return {
    sub: generateId(),
    email: 'test@adapt-co.io',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}

export interface MockJwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}
