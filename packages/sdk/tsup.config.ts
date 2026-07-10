import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [],
  noExternal: ['ajv', 'ajv-formats', 'uuid', 'yaml'],
  platform: 'node',
  target: 'node20',
  outDir: 'dist',
  tsconfig: './tsconfig.json',
});