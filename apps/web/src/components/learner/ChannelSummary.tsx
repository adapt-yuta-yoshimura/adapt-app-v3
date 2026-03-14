'use client';

/**
 * チャンネルサマリー表示（STU-UI-03）
 */
import type { components } from '@adapt/types/openapi-app';

type CourseChannelSummaryView = components['schemas']['CourseChannelSummaryView'];

const CHANNEL_TYPE_LABELS: Record<string, string> = {
  assignment: '課題',
  one_on_one: '1on1',
  announcement: 'お知らせ',
  general: '一般',
};

export interface ChannelSummaryProps {
  channels: CourseChannelSummaryView[];
}

export function ChannelSummary({ channels }: ChannelSummaryProps) {
  if (channels.length === 0) {
    return (
      <div className="rounded-lg border border-iris-60 bg-white p-4 text-sm text-grey3">
        チャンネルはありません
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-iris-60 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-black">チャンネル</h3>
      <ul className="space-y-2">
        {channels.map(({ channel, lastMessageAt, unreadCount }) => (
          <li
            key={channel.id}
            className="flex items-center justify-between text-sm text-black"
          >
            <span>
              {channel.name ?? CHANNEL_TYPE_LABELS[channel.type] ?? channel.type}
            </span>
            <span className="text-xs text-grey3">
              {unreadCount > 0 ? `未読 ${unreadCount}` : ''}
              {lastMessageAt ? ` · ${formatDate(lastMessageAt)}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}
