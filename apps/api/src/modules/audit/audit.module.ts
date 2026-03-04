import { Module } from '@nestjs/common';
import { AuditEventRepository } from './repositories/audit-event.repository';

@Module({
  providers: [AuditEventRepository],
  exports: [AuditEventRepository],
})
export class AuditModule {}
