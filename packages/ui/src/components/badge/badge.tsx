import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

/**
 * Phase 0: Adapt 共通 Badge
 * - PlatformRole: root_operator, operator
 * - GlobalRole: instructor, learner, assistant
 * - Status: active, inactive, frozen
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border-0 px-2.5 py-0.5 text-badge font-semibold',
  {
    variants: {
      variant: {
        root_operator: 'bg-iris-100/10 text-iris-100',
        operator: 'bg-iris-60/15 text-iris-80',
        instructor: 'bg-iris-100/10 text-iris-100',
        learner: 'bg-success/10 text-success',
        assistant: 'bg-warning/10 text-warning',
        active: 'bg-success/10 text-success',
        inactive: 'bg-semantic-danger/10 text-semantic-danger',
        frozen: 'bg-semantic-danger/10 text-semantic-danger',
        // shadcn 互換（既存利用のため残す）
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): React.ReactNode {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
