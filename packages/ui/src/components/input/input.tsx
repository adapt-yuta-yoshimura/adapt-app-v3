import * as React from 'react';

import { cn } from '../../lib/utils';

/**
 * Phase 0: Adapt 共通 Input
 * - size md: 42px height / lg: 46px (login)
 * - border border-input, rounded-input (5px), font body-sm
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  error?: string;
  /** 表示サイズ（ネイティブの size 属性とは別） */
  size?: 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      required,
      error,
      size = 'md',
      id: propId,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = propId ?? generatedId;

    return (
      <div className="w-full">
        {label != null && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-body-sm font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-semantic-danger"> *</span>}
          </label>
        )}
        <input
          type={type}
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error != null}
          aria-describedby={error != null ? `${id}-error` : undefined}
          className={cn(
            'w-full rounded-input border border-border-input bg-white text-body-sm text-text-primary placeholder:text-text-placeholder',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-100 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50',
            size === 'md' && 'h-[42px] px-3 py-2 text-[13px]',
            size === 'lg' && 'h-[46px] px-4 py-2.5 text-[14px]',
            error != null && 'border-semantic-danger',
            className,
          )}
          {...props}
        />
        {error != null && (
          <p id={`${id}-error`} className="mt-1.5 text-caption text-semantic-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
