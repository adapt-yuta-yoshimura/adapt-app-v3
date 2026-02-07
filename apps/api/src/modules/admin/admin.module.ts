import { Module } from '@nestjs/common';

import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [],
})
export class AdminModule {}
