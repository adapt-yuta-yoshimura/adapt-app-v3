import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
} from '@adapt/ui';

export default function MessagesPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">メッセージ</h1>
        <p className="text-muted-foreground">コース内のチャンネル・ダイレクトメッセージ</p>
      </div>

      <div className="grid h-[calc(100vh-16rem)] grid-cols-[280px_1fr] overflow-hidden rounded-lg border">
        {/* チャンネルリスト */}
        <div className="border-r bg-muted/30">
          <div className="p-4">
            <Input placeholder="チャンネルを検索..." className="h-8" />
          </div>
          <div className="px-2">
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              チャンネルに参加してメッセージを送信しましょう
            </p>
          </div>
        </div>

        {/* メッセージエリア */}
        <div className="flex flex-col">
          <div className="flex items-center border-b px-4 py-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              チャンネルを選択してください
            </h2>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <Card className="border-0 shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-lg">メッセージを開始</CardTitle>
                <CardDescription>
                  左のパネルからチャンネルを選択するか、新しいチャンネルに参加してください
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
