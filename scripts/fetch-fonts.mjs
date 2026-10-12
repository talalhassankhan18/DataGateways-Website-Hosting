#!/usr/bin/env node
/**
 * One-time fetch of the two self-hosted families into apps/web/public/fonts.
 * Both are SIL Open Font Licence 1.1, so they are ours to host. Run once; the files are committed.
 * The site falls back to the system stack if they are missing, so this never blocks a build.
 */
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'apps', 'web', 'public', 'fonts');

// Google's CSS API serves woff2 only to browsers that advertise support.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * The two families dtv.sa itself uses, confirmed by reading its computed styles: Space Grotesk 700
 * uppercase for display, Readex Pro for body and UI. Both are Google Fonts under the SIL Open Font
 * Licence 1.1, so matching the reference's typography carries no licensing problem.
 */
const TARGETS = [
  {
    query: 'family=Space+Grotesk:wght@400..700',
    licence: 'SIL Open Font License 1.1',
    files: { normal: 'space-grotesk-latin.woff2' },
  },
  {
    query: 'family=Readex+Pro:wght@300..600',
    licence: 'SIL Open Font License 1.1',
    files: { normal: 'readex-pro-latin.woff2' },
  },
];

const BLOCK = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g;

await mkdir(outDir, { recursive: true });

const written = [];

for (const target of TARGETS) {
  const cssUrl = `https://fonts.googleapis.com/css2?${target.query}&display=swap`;
  const css = await fetch(cssUrl, { headers: { 'User-Agent': UA } }).then((r) => {
    if (!r.ok) throw new Error(`${cssUrl} responded ${r.status}`);
    return r.text();
  });

  for (const [, subset, body] of css.matchAll(BLOCK)) {
    if (subset !== 'latin') continue;
    const style = /font-style:\s*(\w+)/.exec(body)?.[1] ?? 'normal';
    const url = /url\((https:[^)]+\.woff2)\)/.exec(body)?.[1];
    const name = target.files[style];
    if (!url || !name) continue;

    const bytes = Buffer.from(await fetch(url, { headers: { 'User-Agent': UA } }).then((r) => r.arrayBuffer()));
    await writeFile(join(outDir, name), bytes);
    written.push({ name, url: cssUrl, licence: target.licence, bytes: bytes.length });
    console.log(`fonts: ${name} (${(bytes.length / 1024).toFixed(1)} kB)`);
  }
}

const csvPath = join(root, 'docs', 'licences.csv');
await access(csvPath);
const csv = await readFile(csvPath, 'utf8');
const today = new Date().toISOString().slice(0, 10);
const rows = written
  .filter(({ name }) => !csv.includes(`apps/web/public/fonts/${name}`))
  .map(({ name, url, licence }) => `apps/web/public/fonts/${name},${url},${licence},${today},none`);

if (rows.length > 0) {
  await writeFile(csvPath, `${csv.trimEnd()}\n${rows.join('\n')}\n`);
  console.log(`fonts: ${rows.length} row(s) added to docs/licences.csv`);
}
