#!/usr/bin/env node
/** tsc does not copy JSON, and the resources route resolves its data file relative to the module. */
import { cp, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'apps', 'api', 'src', 'data');
const to = join(root, 'apps', 'api', 'dist', 'data');

if (!existsSync(from)) process.exit(0);

await mkdir(to, { recursive: true });
await cp(from, to, { recursive: true });
console.log('api: data files copied to dist');
