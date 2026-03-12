'use client';

/**
 * 講座固有サイドバー（ブートキャンプ運営）
 * Mini 40px + Expanded 180px、チャンネルリストは API-049 で動的取得
 */

import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import {
  Home,
  Bell,
  FileCheck,
  BookOpen,
  Users,
  PenSquare,
  ChevronsLeft,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getChannels } from '@/lib/bootcamp-ops-api';

const NAV_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'ホーム', href: 'home', icon: Home },
  { label: '通知', href: 'home', icon: Bell },
  { label: '提出物管理', href: 'submissions', icon: FileCheck },
  { label: 'カリキュラム確認', href: 'syllabus', icon: BookOpen },
  { label: '参加者一覧', href: 'members', icon: Users },
];

export function BootcampOpsSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';
  const channelIdFromQuery = searchParams.get('channelId');

  const basePath = `/instructor/courses/${courseId}/bootcamp`;

  const { data: channelsData } = useQuery({
    queryKey: ['bootcamp', 'channels', courseId],
    queryFn: () => getChannels(courseId),
    enabled: !!courseId,
  });

  const channels = channelsData?.items ?? [];

  const isNavActive = (itemHref: string) => {
    if (itemHref === 'home') {
      return pathname === `${basePath}/home` || pathname === basePath;
    }
    return pathname.startsWith(`${basePath}/${itemHref}`);
  };

  return (
    <aside className="flex shrink-0" aria-label="ブートキャンプ運営メニュー">
      {/* Mini サイドバー 40px */}
      <div className="flex w-10 flex-col items-center bg-iris-light py-2">
        <button
          type="button"
          className="mb-4 flex h-5 w-5 items-center justify-center text-grey3"
          aria-label="サイドバーを折りたたむ"
        >
          <ChevronsLeft className="h-5 w-5" />
        </button>
        <nav className="flex flex-col gap-1" aria-label="ミニメニュー">
          <Link
            href={`${basePath}/home`}
            className="flex h-9 w-9 items-center justify-center rounded text-grey3 hover:bg-white hover:text-black"
            aria-label="ホーム"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link
            href={`${basePath}/home`}
            className="flex h-9 w-9 items-center justify-center rounded text-grey3 hover:bg-white hover:text-black"
            aria-label="通知"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <Link
            href={`${basePath}/submissions`}
            className="flex h-9 w-9 items-center justify-center rounded text-grey3 hover:bg-white hover:text-black"
            aria-label="提出物管理"
          >
            <FileCheck className="h-5 w-5" />
          </Link>
          <Link
            href={`${basePath}/syllabus`}
            className="flex h-9 w-9 items-center justify-center rounded text-grey3 hover:bg-white hover:text-black"
            aria-label="カリキュラム確認"
          >
            <BookOpen className="h-5 w-5" />
          </Link>
          <Link
            href={`${basePath}/members`}
            className="flex h-9 w-9 items-center justify-center rounded text-grey3 hover:bg-white hover:text-black"
            aria-label="参加者一覧"
          >
            <Users className="h-5 w-5" />
          </Link>
        </nav>
        <Link
          href="/instructor/courses/new"
          className="mt-4 flex h-8 w-8 items-center justify-center rounded bg-iris-100 text-white hover:opacity-90"
          aria-label="講座を作る"
        >
          <PenSquare className="h-5 w-5" />
        </Link>
      </div>

      {/* Expanded サイドバー 180px */}
      <div className="flex w-[180px] flex-col bg-iris-bg">
        <div className="px-4 pt-5">
          <p className="text-sm font-bold tracking-[0.56px] text-black">ブートキャンプ</p>
        </div>
        <nav className="mt-2 flex flex-col gap-0.5 px-0" aria-label="ブートキャンプメニュー">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const hrefFull = href === 'home' ? `${basePath}/home` : `${basePath}/${href}`;
            const active = isNavActive(href);
            return (
              <Link
                key={href + label}
                href={hrefFull}
                className={`flex items-center gap-2 px-4 py-2 text-sm tracking-[0.56px] ${
                  active ? 'bg-iris-light text-black' : 'text-grey3'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-col gap-2 px-4">
          <p className="text-xs font-bold tracking-[0.96px] text-iris-100">
            コミュニティチャット
          </p>
          <ul className="flex flex-col gap-0.5">
            {channels.map((item) => {
              const channelId = item.channel.id;
              const name = item.channel.name ?? '（無題）';
              const isActive =
                pathname.startsWith(`${basePath}/chat`) && channelIdFromQuery === channelId;
              return (
                <li key={channelId}>
                  <Link
                    href={`${basePath}/chat?channelId=${channelId}`}
                    className={`block px-4 py-2 text-sm tracking-[0.56px] ${
                      isActive ? 'bg-iris-light text-black' : 'text-grey3'
                    }`}
                  >
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
