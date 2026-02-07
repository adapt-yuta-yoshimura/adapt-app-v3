import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * Phase 0: Adapt 共通 Button
 * - primary: CTA, 追加, 保存
 * - outline: キャンセル, 編集
 * - danger-outline: 凍結, 削除
 * - ghost: 戻るリンク
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-100 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-iris-100 text-white hover:bg-iris-80 border-0 rounded-cta',
        outline:
          'bg-white border border-border text-text-secondary hover:bg-iris-10 rounded-cta',
        'danger-outline':
          'bg-transparent border border-semantic-danger/30 text-semantic-danger hover:bg-semantic-danger/10 rounded-cta',
        ghost:
          'bg-transparent border-0 text-text-secondary hover:bg-iris-10 rounded-cta',
        // shadcn 互換（既存利用のため残す）
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
        link: 'text-primary underline-offset-4 hover:underline rounded-md',
      },
      size: {
        sm: 'h-[30px] px-3 text-[11px]',
        md: 'h-[38px] px-5 text-[13px]',
        lg: 'h-[44px] px-6 text-[14px]',
        // shadcn 互換
        default: 'h-10 px-4 py-2 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const resolvedSize = size ?? 'md';
    const resolvedVariant = variant ?? 'primary';
    return (
      <Comp
        className={cn(buttonVariants({ variant: resolvedVariant, size: resolvedSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
