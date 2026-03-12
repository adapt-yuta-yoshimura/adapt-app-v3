import Link from 'next/link';

export interface InstructorCardProps {
  userId: string;
  displayName: string;
  category?: string;
  avatarUrl?: string | null;
}

/**
 * 講師カード（PG-001 講師一覧セクション）
 * クリック → PG-006 講師詳細へ（スコープ外のため 404 許容）
 */
export function InstructorCard({
  userId,
  displayName,
  category,
  avatarUrl,
}: InstructorCardProps) {
  return (
    <Link
      href={`/store/instructors/${userId}`}
      className="flex flex-col items-center rounded-lg border border-iris-60 bg-white p-4 shadow-sm transition hover:border-iris-80 hover:shadow"
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-iris-60 text-xl font-medium text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <p className="mt-2 text-sm font-medium text-black">{displayName}</p>
      {category && <p className="mt-0.5 text-xs text-grey3">{category}</p>}
    </Link>
  );
}
