import * as React from 'react';

import { cn } from '../../lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** カラム数 */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  /** ギャップサイズ */
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-12',
} as const;

const gapMap = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
} as const;

/**
 * グリッドレイアウトコンポーネント
 * レスポンシブなグリッドレイアウトを提供する
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('grid', colsMap[cols], gapMap[gap], className)}
        {...props}
      />
    );
  },
);
Grid.displayName = 'Grid';

export { Grid };
