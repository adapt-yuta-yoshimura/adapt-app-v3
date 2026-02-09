'use client';

import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@adapt/ui';

/**
 * Admin FormCard（§2-A-8）
 * 最大幅 560px、AUDIT_LOG 警告バナー対応
 */
export interface FormCardProps {
  title: string;
  showAuditWarning?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormCard({
  title,
  showAuditWarning = false,
  children,
  className,
}: FormCardProps): React.ReactNode {
  return (
    <div
      className={cn(
        'max-w-[560px] rounded-card border border-border bg-surface-white px-8 py-6',
        className,
      )}
    >
      <h1 className="text-heading-lg font-bold text-text-primary">{title}</h1>

      {showAuditWarning && (
        <div
          className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50/80 p-3"
          role="alert"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-semantic-warning" aria-hidden />
          <p className="text-body-sm text-text-primary">
            この操作は監査ログに記録されます
          </p>
        </div>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}
