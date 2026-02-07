import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@adapt/ui';

export default function AssignmentsPage(): React.ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">課題一覧</h1>
        <p className="text-muted-foreground">提出が必要な課題と提出済みの課題</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">提出待ちの課題</CardTitle>
          <CardDescription>期限内に提出してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>課題名</TableHead>
                <TableHead>コース</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  提出待ちの課題はありません
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">提出済み</CardTitle>
          <CardDescription>提出・採点済みの課題</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>課題名</TableHead>
                <TableHead>コース</TableHead>
                <TableHead>提出日</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  提出済みの課題はありません
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
