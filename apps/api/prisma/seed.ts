import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_URL ?? 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM ?? 'adapt';

const SEED_USERS = [
  {
    email: 'root@adapt-co.io',
    name: 'Root Operator',
    globalRole: 'root_operator' as const,
  },
  {
    email: 'operator@adapt-co.io',
    name: 'Operator',
    globalRole: 'operator' as const,
  },
  {
    email: 'instructor@adapt-co.io',
    name: 'Instructor',
    globalRole: 'instructor' as const,
  },
  {
    email: 'learner@adapt-co.io',
    name: 'Learner',
    globalRole: 'learner' as const,
  },
];

interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
}

async function getKeycloakAdminToken(): Promise<string> {
  const username = process.env.KEYCLOAK_ADMIN_USER ?? 'admin';
  const password = process.env.KEYCLOAK_ADMIN_PASSWORD ?? 'admin';

  const res = await fetch(
    `${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: 'admin-cli',
        grant_type: 'password',
        username,
        password,
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Keycloak admin token request failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Keycloak admin token response missing access_token');
  }
  return data.access_token;
}

async function getKeycloakUsers(token: string): Promise<KeycloakUser[]> {
  const res = await fetch(
    `${KEYCLOAK_BASE_URL}/admin/realms/${KEYCLOAK_REALM}/users?max=100`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) {
    throw new Error(`Keycloak users API failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as KeycloakUser[];
}

async function main() {
  console.log(`🔑 Keycloak: ${KEYCLOAK_BASE_URL} (realm: ${KEYCLOAK_REALM})`);

  const token = await getKeycloakAdminToken();
  console.log('✅ Keycloak admin token acquired');

  const keycloakUsers = await getKeycloakUsers(token);
  console.log(`✅ Keycloak users fetched: ${keycloakUsers.length} users`);

  // メールアドレスで照合するマップを作成
  const kcUserByEmail = new Map<string, KeycloakUser>();
  for (const kcu of keycloakUsers) {
    const email = kcu.email ?? kcu.username;
    kcUserByEmail.set(email, kcu);
  }

  // 全シードユーザーが Keycloak に存在するか事前チェック
  const missing = SEED_USERS.filter((u) => !kcUserByEmail.has(u.email));
  if (missing.length > 0) {
    console.error('❌ Keycloak に以下のユーザーが存在しません:');
    for (const m of missing) {
      console.error(`   - ${m.email}`);
    }
    throw new Error('Keycloak にシード対象ユーザーが不足しています。realm-export.json を確認してください。');
  }

  for (const u of SEED_USERS) {
    const kcUser = kcUserByEmail.get(u.email)!;
    const providerUserId = kcUser.id;

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, globalRole: u.globalRole },
      create: { email: u.email, name: u.name, globalRole: u.globalRole, isActive: true },
    });

    // 既存の OAuthIdentity を userId で検索（UUID変更に対応）
    const existing = await prisma.oAuthIdentity.findFirst({
      where: { provider: 'keycloak', userId: user.id },
    });

    if (existing) {
      await prisma.oAuthIdentity.update({
        where: { id: existing.id },
        data: { providerUserId, email: u.email, lastLoginAt: new Date() },
      });
    } else {
      await prisma.oAuthIdentity.create({
        data: {
          userId: user.id,
          provider: 'keycloak',
          providerUserId,
          email: u.email,
          lastLoginAt: new Date(),
        },
      });
    }

    console.log(`✅ seeded: ${u.email} (${u.globalRole}) → KC: ${providerUserId}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
