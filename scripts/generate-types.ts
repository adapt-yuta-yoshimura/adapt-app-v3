/**
 * OpenAPI型生成スクリプト
 *
 * 使用方法: pnpm generate:types
 *
 * openapi_app.yaml → packages/types/src/openapi-app.d.ts
 * openapi_admin.yaml → packages/types/src/openapi-admin.d.ts
 */

import { execSync } from 'child_process';

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Generating OpenAPI types...');

  try {
    execSync(
      'openapi-typescript docs/api/openapi_app.yaml -o packages/types/src/openapi-app.d.ts',
      { stdio: 'inherit' },
    );
    // eslint-disable-next-line no-console
    console.log('App API types generated');

    execSync(
      'openapi-typescript docs/api/openapi_admin.yaml -o packages/types/src/openapi-admin.d.ts',
      { stdio: 'inherit' },
    );
    // eslint-disable-next-line no-console
    console.log('Admin API types generated');

    // eslint-disable-next-line no-console
    console.log('All types generated successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Type generation failed:', error);
    process.exit(1);
  }
}

main();
