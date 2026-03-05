import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const SEED_USERS = [
  {
    email: 'root@adapt-co.io',
    name: 'Root Operator',
    globalRole: 'root_operator' as const,
    providerUserId: '495847a9-95ba-44ac-b651-ee8db7625789',
  },
  {
    email: 'operator@adapt-co.io',
    name: 'Operator',
    globalRole: 'operator' as const,
    providerUserId: '75e09028-495f-4fa2-a255-8a846ed0ba39',
  },
  {
    email: 'instructor@adapt-co.io',
    name: 'Instructor',
    globalRole: 'instructor' as const,
    providerUserId: '701e4438-60e4-48e1-8072-94382d527928',
  },
  {
    email: 'learner@adapt-co.io',
    name: 'Learner',
    globalRole: 'learner' as const,
    providerUserId: 'b7a69a7c-c8eb-494c-9f8d-8515aa7aad0b',
  },
];

async function main() {
  for (const u of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, globalRole: u.globalRole },
      create: { email: u.email, name: u.name, globalRole: u.globalRole, isActive: true },
    });

    const existing = await prisma.oAuthIdentity.findFirst({
      where: { provider: 'keycloak', providerUserId: u.providerUserId },
    });

    if (existing) {
      await prisma.oAuthIdentity.update({
        where: { id: existing.id },
        data: { email: u.email, lastLoginAt: new Date() },
      });
    } else {
      await prisma.oAuthIdentity.create({
        data: {
          userId: user.id,
          provider: 'keycloak',
          providerUserId: u.providerUserId,
          email: u.email,
          lastLoginAt: new Date(),
        },
      });
    }

    console.log(`✅ seeded: ${u.email} (${u.globalRole})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
