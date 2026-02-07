import { test, expect } from '@playwright/test';

test.describe('ログインページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('ログインフォームが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ログイン/ })).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/)).toBeVisible();
    await expect(page.getByLabel(/パスワード/)).toBeVisible();
    await expect(page.getByRole('button', { name: /ログイン/ })).toBeVisible();
  });

  test('Google ログインボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Google/ })).toBeVisible();
  });

  test('サインアップリンクが存在する', async ({ page }) => {
    await expect(page.getByRole('link', { name: /新規登録/ })).toBeVisible();
  });

  test('空のフォームで送信するとバリデーションエラー', async ({ page }) => {
    await page.getByRole('button', { name: /ログイン/ }).first().click();
    // HTML5 required バリデーションでフォームは送信されない
    await expect(page).toHaveURL(/login/);
  });
});
