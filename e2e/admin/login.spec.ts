import { test, expect } from '@playwright/test';

test.describe('管理者ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('管理者ログインフォームが表示される', async ({ page }) => {
    await expect(page.getByText('adapt Admin')).toBeVisible();
    await expect(page.getByText('管理者ログイン')).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
    await expect(page.getByRole('button', { name: /ログイン/ })).toBeVisible();
  });
});
