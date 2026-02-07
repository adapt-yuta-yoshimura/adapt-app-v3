import * as React from 'react';

import { cn } from '../../lib/utils';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 方向 */
  direction?: 'vertical' | 'horizontal';
  /** 間隔 */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** 配置 */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** 主軸配置 */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const gapMap = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const;

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
} as const;

/**
 * スタックレイアウトコンポーネント
 * 縦方向または横方向にアイテムを並べるレイアウトコンポーネント
 */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = 'vertical',
      gap = 'md',
      align = 'stretch',
      justify = 'start',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          gapMap[gap],
          alignMap[align],
          justifyMap[justify],
          className,
        )}
        {...props}
      />
    );
  },
);
Stack.displayName = 'Stack';

export { Stack };
