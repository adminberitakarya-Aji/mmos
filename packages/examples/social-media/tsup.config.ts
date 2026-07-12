import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/run-social-example.ts'],
  format: ['esm'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  external: ['@mmos/sdk', '@mmos/runtime'],
});