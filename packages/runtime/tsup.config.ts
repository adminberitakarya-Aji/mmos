import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'orchestrator/index': 'src/orchestrator/index.ts',
    'engine/index': 'src/engine/index.ts',
    'registry/index': 'src/registry/index.ts',
  },
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  splitting: false,
  treeshake: true,
  external: ['@mmos/sdk'],
});
