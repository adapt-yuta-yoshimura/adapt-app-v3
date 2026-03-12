// INS-UI-25 ブートキャンプ運営（コミュニティチャット）
'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
  getChannelMessages,
  postMessage,
  getThread,
  postThreadReply,
  patchMessage,
  deleteMessage,
} from '@/lib/bootcamp-ops-api';
import type { components } from '@adapt/types/openapi-app';

type CourseMessageView = components['schemas']['CourseMessageView'];

function formatMessageTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function BootcampOpsChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const courseId = typeof params.courseId === 'string' ? params.courseId : '';
  const channelId = searchParams.get('channelId');

  const [newMessageText, setNewMessageText] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['channels', channelId, 'messages'],
    queryFn: () => getChannelMessages(channelId!),
    enabled: !!channelId,
  });

  const { data: threadData } = useQuery({
    queryKey: ['messages', selectedThreadId, 'thread'],
    queryFn: () => getThread(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const postMutation = useMutation({
    mutationFn: (text: string) =>
      postMessage(channelId!, { channelId: channelId!, text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels', channelId, 'messages'] });
      setNewMessageText('');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ messageId, text }: { messageId: string; text: string }) =>
      postThreadReply(messageId, { text }),
    onSuccess: () => {
      if (selectedThreadId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', selectedThreadId, 'thread'],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['channels', channelId, 'messages'] });
      setReplyText('');
    },
  });

  const handlePost = useCallback(() => {
    const text = newMessageText.trim();
    if (!text || !channelId) return;
    postMutation.mutate(text);
  }, [newMessageText, channelId, postMutation]);

  const handleReply = useCallback(() => {
    const text = replyText.trim();
    if (!text || !selectedThreadId) return;
    replyMutation.mutate({ messageId: selectedThreadId, text });
  }, [replyText, selectedThreadId, replyMutation]);

  const messages = messagesData?.items ?? [];
  const threadItems =
    threadData && 'items' in threadData && Array.isArray((threadData as { items: unknown[] }).items)
      ? (threadData as unknown as { items: CourseMessageView[] }).items
      : [];

  if (!channelId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-grey3">
        <p className="text-sm">左のサイドバーからチャンネルを選択してください</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading && (
              <p className="py-4 text-center text-sm text-grey3">読み込み中…</p>
            )}
            {!isLoading && messages.length === 0 && (
              <p className="py-8 text-center text-sm text-grey3">
                まだメッセージはありません
              </p>
            )}
            <ul className="space-y-4">
              {messages.map((item) => (
                <MessageRow
                  key={item.message.id}
                  item={item}
                  onOpenThread={() => setSelectedThreadId(item.message.id)}
                  isThreadOpen={selectedThreadId === item.message.id}
                />
              ))}
            </ul>
          </div>
          <div className="border-t border-[#E2E8F0] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handlePost()}
                placeholder="メッセージを入力..."
                className="flex-1 rounded border border-[#E2E8F0] px-3 py-2 text-sm text-black placeholder:text-grey3"
              />
              <button
                type="button"
                onClick={handlePost}
                disabled={postMutation.isPending || !newMessageText.trim()}
                className="rounded bg-iris-100 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                送信
              </button>
            </div>
          </div>
        </div>

        {selectedThreadId && (
          <div className="flex w-80 shrink-0 flex-col rounded-lg border border-[#E2E8F0] bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] p-3">
              <span className="text-sm font-medium text-black">スレッド</span>
              <button
                type="button"
                onClick={() => setSelectedThreadId(null)}
                className="text-sm text-grey3 hover:underline"
              >
                閉じる
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-2">
                {threadItems.map((item) => (
                  <li
                    key={item.message.id}
                    className="rounded bg-iris-bg p-2 text-sm"
                  >
                    <p className="font-medium text-black">
                      {item.sender?.displayName ?? '—'}
                    </p>
                    <p className="mt-1 text-black">{item.message.text}</p>
                    <p className="mt-1 text-xs text-grey3">
                      {formatMessageTime(item.message.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[#E2E8F0] p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !e.shiftKey && handleReply()
                  }
                  placeholder="返信を入力..."
                  className="flex-1 rounded border border-[#E2E8F0] px-2 py-1.5 text-sm placeholder:text-grey3"
                />
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className="rounded bg-iris-100 px-3 py-1.5 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  返信
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageRow({
  item,
  onOpenThread,
  isThreadOpen,
}: {
  item: CourseMessageView;
  onOpenThread: () => void;
  isThreadOpen: boolean;
}) {
  const { message, sender } = item;
  return (
    <li className="rounded-lg border border-[#E2E8F0] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-black">
              {sender?.displayName ?? '—'}
            </span>
            <span className="text-xs text-grey3">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-black">{message.text}</p>
        </div>
        <button
          type="button"
          onClick={onOpenThread}
          className={`shrink-0 rounded px-2 py-1 text-xs ${
            isThreadOpen ? 'bg-iris-light text-iris-100' : 'text-grey3 hover:bg-iris-bg'
          }`}
        >
          スレッド
        </button>
      </div>
    </li>
  );
}
