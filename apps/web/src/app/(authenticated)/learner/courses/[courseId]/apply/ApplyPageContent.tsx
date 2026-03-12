'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { StepIndicator } from '@/components/store';
import { applyFormSchema, type ApplyFormValues } from '@/lib/apply-form-schema';
import { getStubToken } from '@/lib/auth';
import { getApiBaseUrl } from '@/lib/api-base-url';

const STEPS = ['基本情報入力', '確認', '完了'];

export interface CourseSummaryBarProps {
  courseTitle: string;
  courseId: string;
  scheduleText?: string;
  styleLabel?: string;
  priceYen?: number;
  ownerDisplayName?: string;
}

export function CourseSummaryBar({
  courseTitle,
  courseId,
  scheduleText,
  styleLabel,
  priceYen,
  ownerDisplayName,
}: CourseSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-iris-60 bg-white p-4">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-black">{courseTitle}</h2>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-grey3">
          {scheduleText && <span>{scheduleText}</span>}
          {styleLabel && <span>{styleLabel}</span>}
          {priceYen != null && priceYen > 0 && <span>¥{priceYen.toLocaleString()}</span>}
          {ownerDisplayName && <span>主催: {ownerDisplayName}</span>}
        </div>
      </div>
    </div>
  );
}

export interface ApplyPageContentProps {
  courseId: string;
  courseTitle: string;
  scheduleText?: string;
  styleLabel?: string;
  priceYen?: number;
  ownerDisplayName?: string;
}

export function ApplyPageContent({
  courseId,
  courseTitle,
  scheduleText,
  styleLabel,
  priceYen,
  ownerDisplayName,
}: ApplyPageContentProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const token = getStubToken();
      if (!token) throw new Error('ログインしてください');
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/v1/store/courses/${courseId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form.getValues()),
      });
      if (res.status === 409) throw new Error('すでにお申し込み済みです');
      if (res.status === 423) throw new Error('この講座は現在利用できません');
      if (res.status === 404) throw new Error('講座が見つかりません');
      if (!res.ok) throw new Error('申し込みに失敗しました');
      return res.json();
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const token = getStubToken();
      if (!token) throw new Error('ログインしてください');
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/api/v1/payments/stripe/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId }),
      });
      if (res.status === 423) throw new Error('この講座は現在利用できません');
      if (!res.ok) throw new Error('決済セッションの作成に失敗しました');
      const data = await res.json();
      return data as { sessionId: string; url: string };
    },
  });

  const handleConfirm = () => {
    setSubmitError(null);
    setStep(1);
  };

  const handleSubmitPayment = async () => {
    setSubmitError(null);
    try {
      await applyMutation.mutateAsync();
      const { url } = await checkoutMutation.mutateAsync();
      if (url) {
        window.location.href = url;
        return;
      }
      setSubmitError('決済URLの取得に失敗しました');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '申し込みに失敗しました');
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
      <CourseSummaryBar
        courseTitle={courseTitle}
        courseId={courseId}
        scheduleText={scheduleText}
        styleLabel={styleLabel}
        priceYen={priceYen}
        ownerDisplayName={ownerDisplayName}
      />

      <StepIndicator steps={STEPS} currentStep={step} />

      {submitError && (
        <div className="rounded border border-red-500 bg-red-50 p-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {step === 0 && (
        <form onSubmit={form.handleSubmit(handleConfirm)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...form.register('name')}
              className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-black"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...form.register('email')}
              className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-black"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-black">
              講師への連絡事項（任意）
            </label>
            <textarea
              id="message"
              rows={4}
              {...form.register('message')}
              className="mt-1 w-full rounded border border-iris-60 px-3 py-2 text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-iris-100 py-3 text-sm font-medium text-white hover:bg-iris-80"
          >
            申し込み確認画面へ
          </button>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded border border-iris-60 bg-white p-4">
            <p className="text-sm text-grey3">名前</p>
            <p className="mt-1 font-medium text-black">{form.watch('name')}</p>
          </div>
          <div className="rounded border border-iris-60 bg-white p-4">
            <p className="text-sm text-grey3">メールアドレス</p>
            <p className="mt-1 font-medium text-black">{form.watch('email')}</p>
          </div>
          {form.watch('message') && (
            <div className="rounded border border-iris-60 bg-white p-4">
              <p className="text-sm text-grey3">講師への連絡事項</p>
              <p className="mt-1 text-black">{form.watch('message')}</p>
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="flex-1 rounded border border-iris-60 py-3 text-sm font-medium text-black"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleSubmitPayment}
              disabled={applyMutation.isPending || checkoutMutation.isPending}
              className="flex-1 rounded bg-iris-100 py-3 text-sm font-medium text-white hover:bg-iris-80 disabled:opacity-50"
            >
              {applyMutation.isPending || checkoutMutation.isPending
                ? '処理中…'
                : 'Stripe でお支払い'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
