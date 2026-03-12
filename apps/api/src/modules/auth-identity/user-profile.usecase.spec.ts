import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserProfileUseCase } from './user-profile.usecase';
import { UserRepository } from './user.repository';
import { UserProfileRepository } from './user-profile.repository';

/**
 * STU: UserProfile UseCase テスト（API-001〜003）
 * 正常系 + 異常系をカバー
 */
describe('UserProfileUseCase', () => {
  let useCase: UserProfileUseCase;
  let userRepo: {
    findById: ReturnType<typeof vi.fn>;
    updateName: ReturnType<typeof vi.fn>;
  };
  let profileRepo: {
    findByUserId: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };

  const userId = 'user-1';

  beforeEach(() => {
    vi.clearAllMocks();
    userRepo = {
      findById: vi.fn(),
      updateName: vi.fn(),
    };
    profileRepo = {
      findByUserId: vi.fn(),
      upsert: vi.fn(),
    };

    useCase = new UserProfileUseCase(
      userRepo as unknown as UserRepository,
      profileRepo as unknown as UserProfileRepository,
    );
  });

  describe('getMe (API-001)', () => {
    it('正常系: プロフィール取得', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // userRepo.findById → mockUser
      // profileRepo.findByUserId → mockProfile
      // 結果の UserMeView を検証
      await expect(useCase.getMe(userId)).rejects.toThrow('Not implemented');
    });

    it('異常系: 存在しないユーザー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // userRepo.findById → null
      // NotFoundException を期待
      await expect(useCase.getMe('non-existent')).rejects.toThrow('Not implemented');
    });
  });

  describe('updateProfile (API-002)', () => {
    it('正常系: プロフィール更新', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // userRepo.updateName / profileRepo.upsert の呼出し検証
      await expect(
        useCase.updateProfile(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: バリデーションエラー', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      await expect(
        useCase.updateProfile(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });

  describe('changePassword (API-003)', () => {
    it('正常系: パスワード変更', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // PasswordCredential 取得 → bcrypt compare → 更新
      await expect(
        useCase.changePassword(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });

    it('異常系: 現パスワード不一致', async () => {
      // TODO(TBD): Cursor実装後にテスト詳細を実装
      // bcrypt compare → false → BadRequestException
      await expect(
        useCase.changePassword(userId, { data: {} }),
      ).rejects.toThrow('Not implemented');
    });
  });
});
