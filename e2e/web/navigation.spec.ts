import { test, expect } from '@playwright/test';

test.describe('ナビゲーション', () => {
  test('ルートページにアクセスするとリダイレクトされる', async ({ page }) => {
    await page.goto('/');
    // 認証されていない場合はログインにリダイレクト、
    // 認証済みならダッシュボードにリダイレクト
    await expect(page).toHaveURL(/(login|dashboard)/);
  });

  test('ログインページからサインアップページに遷移できる', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /新規登録/ }).click();
    await expect(page).toHaveURL(/signup/);
  });

  test('サインアップページからログインページに遷移できる', async ({ page }) => {
    await page.goto('/signup');
    await page.getByRole('link', { name: /ログイン/ }).click();
    await expect(page).toHaveURL(/login/);
  });
});
