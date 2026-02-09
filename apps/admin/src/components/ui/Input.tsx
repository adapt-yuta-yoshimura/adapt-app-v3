'use client';

import * as React from 'react';
import { Search } from 'lucide-react';

import { cn } from '@adapt/ui';

/**
 * Admin Input（§2-A-4）
 * default: 42px / large: 46px（ログイン用）
 * アイコン付き（検索用）バリアント
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  error?: string;
  size?: 'default' | 'large';
  variant?: 'default' | 'search';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      required,
      error,
      size = 'default',
      variant = 'default',
      id: propId,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = propId ?? generatedId;

    const inputEl = (
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
          size === 'default' && 'h-[42px] px-3 py-2 text-[13px]',
          size === 'large' && 'h-[46px] px-4 py-2.5 text-[14px]',
          variant === 'search' && 'pl-10',
          error != null && 'border-semantic-danger',
          className,
        )}
        {...props}
      />
    );

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
        {variant === 'search' ? (
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-placeholder"
              aria-hidden
            />
            {inputEl}
          </div>
        ) : (
          inputEl
        )}
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
