/**
 * データベースシードスクリプト
 *
 * 使用方法: pnpm db:seed
 *
 * TODO(ADAPT): 初期データ投入処理を実装
 */

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Seeding database...');

  // TODO(ADAPT): シードデータの投入
  // - テストユーザー
  // - テストコース
  // - テスト課題

  // eslint-disable-next-line no-console
  console.log('Database seeded successfully');
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', e);
  process.exit(1);
});
