import { Module } from '@nestjs/common';
import { StoreController } from './controllers/store.controller';
import { StoreUseCase } from './usecases/store.usecase';
import { StoreCourseRepository } from './repositories/store-course.repository';

/**
 * Store モジュール（ストア公開ページ）
 *
 * STU-01: API-009〜010
 * - 講座一覧取得（公開・guest可）
 * - 講座詳細取得（公開・guest可）
 *
 * PrismaModule / AuthModule は @Global() のため imports 不要
 */
@Module({
  controllers: [StoreController],
  providers: [
    StoreUseCase,
    StoreCourseRepository,
  ],
  exports: [StoreCourseRepository],
})
export class StoreModule {}
