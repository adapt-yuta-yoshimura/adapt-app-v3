import * as React from 'react';

import { cn } from '../../lib/utils';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 最大幅のサイズ */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const containerSizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
} as const;

/**
 * コンテナコンポーネント
 * コンテンツの最大幅を制限し、中央揃えするレイアウトコンポーネント
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'xl', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full px-4 sm:px-6 lg:px-8',
          containerSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Container.displayName = 'Container';

export { Container };
