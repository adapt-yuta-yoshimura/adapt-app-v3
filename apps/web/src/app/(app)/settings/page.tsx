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

export default function SettingsPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">設定</h1>
        <p className="text-muted-foreground">アカウントとプロフィールの設定</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">プロフィール</CardTitle>
          <CardDescription>公開される情報を管理します</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">
              表示名
            </label>
            <Input id="displayName" placeholder="表示名" />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <Input id="email" type="email" placeholder="name@example.com" disabled />
            <p className="text-xs text-muted-foreground">
              メールアドレスの変更はサポートにお問い合わせください
            </p>
          </div>
          <Button>保存</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">通知設定</CardTitle>
          <CardDescription>通知の受け取り方法を設定します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            通知設定は準備中です
          </p>
        </CardContent>
      </Card>

      <Divider />

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">危険な操作</CardTitle>
          <CardDescription>注意して操作してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">アカウントを削除</Button>
        </CardContent>
      </Card>
    </div>
  );
}
