import { defineConfig } from 'tsup';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copySchemas() {
  const src = path.resolve(__dirname, '../../specs/schemas');
  const dest = path.resolve(__dirname, 'dist/schemas');
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    if (file.endsWith('.schema.json')) {
      fs.copyFileSync(path.join(src, file), path.join(dest, file));
    }
  }
}

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
  // Schemas are the single source of truth at specs/schemas/ (repo root),
  // but the built package must be self-contained: copy them alongside the
  // compiled output so schema loading doesn't depend on the monorepo's
  // folder layout at runtime (see packages/sdk/src/schema/index.ts).
  onSuccess: async () => {
    copySchemas();
  },
});