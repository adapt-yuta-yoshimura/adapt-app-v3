import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import type { paths, components } from '../../../generated';
import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ValidatedUser } from '../../auth/strategies/jwt.strategy';
import { ListOperatorsUseCase } from '../usecases/list-operators.usecase';
import { AddOperatorUseCase } from '../usecases/add-operator.usecase';

type OperatorListResponse =
  paths['/api/v1/admin/operators']['get']['responses']['200']['content']['application/json'];
type SuccessResponse =
  paths['/api/v1/admin/operators']['post']['responses']['201']['content']['application/json'];
type GenericWriteRequest = components['schemas']['GenericWriteRequest'];

/**
 * Admin 運営スタッフ管理 API
 * API-076: 運営スタッフ一覧, API-077: 運営スタッフ追加
 */
@Controller('api/v1/admin/operators')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('root_operator')
export class AdminOperatorsController {
  constructor(
    private readonly listOperatorsUseCase: ListOperatorsUseCase,
    private readonly addOperatorUseCase: AddOperatorUseCase,
  ) {}

  /**
   * GET /api/v1/admin/operators
   * API-076: 運営スタッフ一覧
   */
  @Get()
  async listOperators(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<OperatorListResponse> {
    const pageNum = page ? parseInt(page, 10) : undefined;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : undefined;
    return this.listOperatorsUseCase.execute(
      Number.isNaN(pageNum) ? undefined : pageNum,
      Number.isNaN(pageSizeNum) ? undefined : pageSizeNum,
    );
  }

  /**
   * POST /api/v1/admin/operators
   * API-077: 運営スタッフ追加
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addOperator(
    @CurrentUser() user: ValidatedUser,
    @Body() body: GenericWriteRequest,
  ): Promise<SuccessResponse> {
    return this.addOperatorUseCase.execute(user, body);
  }
}
