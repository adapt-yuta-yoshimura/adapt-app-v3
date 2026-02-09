'use client';

import * as React from 'react';

import { cn } from '@adapt/ui';

const variantClasses = {
  primary: 'bg-[#4F46E5] text-white hover:bg-[#4338CA] border-0 rounded-cta',
  outline: 'bg-white border border-[#4F46E5] text-[#4F46E5] hover:bg-iris-10 rounded-cta',
  danger: 'bg-semantic-danger text-white hover:bg-red-600 border-0 rounded-cta',
  ghost: 'bg-transparent border-0 text-text-secondary hover:bg-iris-10 rounded-cta',
} as const;

const sizeClasses = {
  sm: 'h-[30px] px-3 text-[11px]',
  md: 'h-[38px] px-5 text-[13px]',
  lg: 'h-[46px] px-6 text-[14px]',
} as const;

const baseClasses =
  'inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-100 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

/**
 * Admin Button（§2-A-3）
 * primary / outline / danger / ghost
 * danger: 凍結ボタン用（filled red）
 */
export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, loading, disabled, children, ...props }, ref) => {
    const resolvedClassName = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className,
    );
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string; ref?: React.Ref<unknown> }>, {
        className: cn((children as React.ReactElement<{ className?: string }>).props.className, resolvedClassName),
        ref,
      });
    }
    return (
      <button
        className={resolvedClassName}
        ref={ref}
        disabled={disabled ?? loading}
        {...props}
      >
        {loading ? '処理中...' : children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export const buttonVariants = { variant: variantClasses, size: sizeClasses };
export { Button };
