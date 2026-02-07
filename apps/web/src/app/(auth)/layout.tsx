import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/50">
      <div className="mb-8">
        <Link href="/" className="text-3xl font-bold text-primary">
          adapt
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
