/**
 * 開発環境の audit_event テーブルのみをクリアするスクリプト。
 * 他のテーブルには一切触れない。
 * 使用例: cd apps/api && DATABASE_URL="postgresql://..." npx tsx scripts/clear-audit-events.ts
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://adapt:adapt@localhost:5432/adapt';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.auditEvent.deleteMany();
  console.log('削除件数:', result.count);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
