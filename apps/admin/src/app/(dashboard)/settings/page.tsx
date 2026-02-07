'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Divider,
} from '@adapt/ui';

import { useThemeStore } from '@/stores/theme.store';

export default function AdminSettingsPage(): React.ReactNode {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">システム設定</h1>
        <p className="text-muted-foreground">管理画面の設定</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">テーマ設定</CardTitle>
          <CardDescription>管理画面の表示テーマを切り替えます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              ライト
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              ダーク
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              システム
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">プラットフォーム設定</CardTitle>
          <CardDescription>adapt プラットフォームの基本設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="platformName" className="text-sm font-medium">
              プラットフォーム名
            </label>
            <Input id="platformName" defaultValue="adapt" disabled />
          </div>
          <div className="space-y-2">
            <label htmlFor="supportEmail" className="text-sm font-medium">
              サポートメールアドレス
            </label>
            <Input id="supportEmail" type="email" placeholder="support@adapt-co.io" />
          </div>
          <Button>保存</Button>
        </CardContent>
      </Card>

      <Divider />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">危険な操作</CardTitle>
          <CardDescription>注意して操作してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">メンテナンスモード</p>
              <p className="text-xs text-muted-foreground">
                有効にすると一般ユーザーのアクセスを制限します
              </p>
            </div>
            <Button variant="destructive" size="sm">
              有効にする
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
