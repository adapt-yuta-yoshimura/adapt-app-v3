import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // TODO(TBD): Cursor実装 - transpilePackages、rewrites等の設定
  transpilePackages: ['@adapt/ui', '@adapt/shared'],
};

export default nextConfig;
