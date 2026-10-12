#!/usr/bin/env node
/**
 * Puts the local dev server on a public URL, so someone on a different network can look at it.
 *
 * This opens a Cloudflare "quick tunnel": an outbound connection from this machine to Cloudflare,
 * which hands back a throwaway https://<random>.trycloudflare.com address and forwards requests
 * back down it. No account, no router configuration, nothing listening on your public IP.
 *
 *   npm run share            # tunnels http://localhost:3000
 *   npm run share -- 4173    # tunnels some other port
 *
 * Read this before you send the link to anyone:
 *
 *   - The URL is PUBLIC and UNAUTHENTICATED. It is unguessable, not private. Anyone who has it,
 *     or who is forwarded it, can open the site.
 *   - It lives only while this command runs. Ctrl-C, sleep the machine or drop the Wi-Fi and the
 *     link dies. A new run gives a different address.
 *   - Whoever opens it is reading YOUR dev server — current working state, source maps and all.
 *   - The site still carries unconfirmed compliance marks and an invented partner directory.
 *     See docs/PRE-LAUNCH-SIGNOFF.md. Fine for a named reviewer; not fine somewhere indexable.
 *
 * For a review, `npm run build && npm run preview` first and share that instead: it is the bundle
 * that would actually ship, it loads faster over a tunnel, and it has no HMR socket to fail.
 */
import { spawn } from 'node:child_process';
import { chmod, mkdir, rename, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = join(root, '.tools');

const port = process.argv[2] ?? '3000';

if (!/^\d+$/.test(port)) {
  console.error(`share: "${port}" is not a port number.`);
  process.exit(1);
}

/** Official Cloudflare release assets, by platform. */
const ASSET = {
  win32: { x64: 'cloudflared-windows-amd64.exe', arm64: 'cloudflared-windows-arm64.exe' },
  darwin: { x64: 'cloudflared-darwin-amd64.tgz', arm64: 'cloudflared-darwin-arm64.tgz' },
  linux: { x64: 'cloudflared-linux-amd64', arm64: 'cloudflared-linux-arm64' },
};

const asset = ASSET[process.platform]?.[process.arch];
if (!asset) {
  console.error(
    `share: no cloudflared build for ${process.platform}/${process.arch}.\n` +
      '       Install it yourself and run: cloudflared tunnel --url http://localhost:' + port,
  );
  process.exit(1);
}

if (asset.endsWith('.tgz')) {
  // The macOS asset is an archive, and unpacking it here would mean shipping a tar dependency for
  // one platform. Homebrew is the supported path there anyway.
  console.error(
    'share: on macOS install cloudflared with `brew install cloudflared`, then run:\n' +
      `       cloudflared tunnel --url http://localhost:${port}`,
  );
  process.exit(1);
}

const binary = join(toolsDir, process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared');

const exists = await stat(binary).then((s) => s.isFile() && s.size > 0).catch(() => false);

if (!exists) {
  const url = `https://github.com/cloudflare/cloudflared/releases/latest/download/${asset}`;
  console.log(`share: fetching cloudflared from ${url}`);
  console.log('       (~55 MB, once — it lands in .tools/, which is gitignored)');

  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    console.error(`share: download failed — ${response.status} ${response.statusText}`);
    process.exit(1);
  }

  await mkdir(toolsDir, { recursive: true });
  // Written to a temporary name and renamed, so an interrupted download cannot leave a truncated
  // binary behind that the next run would happily try to execute.
  const partial = `${binary}.partial`;
  await pipeline(response.body, createWriteStream(partial));
  await rename(partial, binary);
  if (process.platform !== 'win32') await chmod(binary, 0o755);
}

/*
 * Look at what is actually on the port before opening anything.
 *
 * Both ways this has gone wrong in practice are visible from here and invisible once a tunnel is
 * up. With nothing listening the tunnel opens happily and serves 502s, which reads as "the tunnel
 * is broken". With the dev server listening it works, but Vite sends one request per source
 * module — hundreds of round trips — and a page that takes ~45s to appear also reads as broken.
 */
const origin = `http://localhost:${port}`;
const probe = await fetch(origin, { redirect: 'manual' })
  .then(async (r) => ({ ok: true, body: await r.text().catch(() => '') }))
  .catch(() => ({ ok: false, body: '' }));

if (!probe.ok) {
  console.error('');
  console.error(`share: nothing is listening on ${origin}.`);
  console.error('       A tunnel to a closed port opens fine and then serves 502 to everyone.');
  console.error('');
  console.error('       Start the site first, in another terminal:');
  console.error('         npm run build && npm run preview');
  console.error('');
  process.exit(1);
}

const isDevServer = /@vite\/client|@react-refresh/.test(probe.body);

if (isDevServer) {
  console.warn('');
  console.warn(`share: ${origin} is the DEV server, not the production build.`);
  console.warn('       It will work, but Vite serves every source module as its own request, so');
  console.warn('       the page takes tens of seconds to appear over a tunnel. Measured at ~45s.');
  console.warn('');
  console.warn('       For anyone you would not describe as patient, stop the dev server and run:');
  console.warn('         npm run build && npm run preview');
  console.warn('');
  console.warn('       Continuing in 5s — Ctrl-C to stop.');
  await new Promise((r) => setTimeout(r, 5000));
}

console.log('');
console.log(`share: tunnelling ${origin} — the public URL appears below.`);
console.log('share: the link is public and unauthenticated, and dies when you stop this (Ctrl-C).');
console.log('');

/**
 * Runs a child to completion and resolves with `{ code, spawned }`. Ctrl-C is handed straight
 * through so the tunnel closes cleanly rather than being orphaned.
 *
 * `spawned` distinguishes "the program ran and failed" from "the program never started", which
 * matters because the two want completely different messages. `error` fires for the second case.
 *
 * NO SHELL. This used to pass `shell: true` on Windows, which concatenates arguments into one
 * string without escaping them — so a binary under "C:\...\Data Gateways\..." was split at the
 * space and cmd tried to run "C:\Users\PMLS\Downloads\Data". Passing argv directly keeps spaces
 * intact, and is also what clears Node's DEP0190 warning about exactly this hazard.
 */
const run = (cmd, args) =>
  new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    const forward = (sig) => child.kill(sig);
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, forward);
    child.on('exit', (code, signal) => {
      for (const sig of ['SIGINT', 'SIGTERM']) process.off(sig, forward);
      resolve({ code: signal ? 1 : (code ?? 0), spawned: true });
    });
    child.on('error', (err) => {
      for (const sig of ['SIGINT', 'SIGTERM']) process.off(sig, forward);
      resolve({ code: 1, spawned: false, err });
    });
  });

/**
 * npx is a `.cmd` shim on Windows, and Node refuses to spawn one without a shell. So this is the
 * one call that needs `shell: true` — and it passes a single pre-built command string rather than
 * an argv array, because that is the form that does not silently mangle its arguments.
 *
 * Every value interpolated here is either a number or a literal from this file, so there is
 * nothing user-supplied to quote.
 */
const runShell = (command) =>
  new Promise((resolve) => {
    const child = spawn(command, { stdio: 'inherit', shell: true });
    const forward = (sig) => child.kill(sig);
    for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, forward);
    child.on('exit', (code, signal) => {
      for (const sig of ['SIGINT', 'SIGTERM']) process.off(sig, forward);
      resolve({ code: signal ? 1 : (code ?? 0), spawned: true });
    });
    child.on('error', () => resolve({ code: 1, spawned: false }));
  });

/*
 * Cloudflare first, because its URL opens straight onto the site with no interstitial and no
 * exposure of this machine's public IP.
 *
 * Retried, because the failure is intermittent rather than permanent. cloudflared registers a
 * quick tunnel by POSTing to api.trycloudflare.com and abandons it on a fairly short timeout; on
 * a congested link that POST sometimes takes longer than the timeout and sometimes does not. The
 * same network has produced a 26s failure and a 5.8s success minutes apart, so giving up after
 * one try drops people onto the uglier fallback for no good reason.
 *
 * Only registration is retried. Once a tunnel is up, `run` blocks until it exits, and an exit at
 * that point means the user pressed Ctrl-C.
 *
 * `--edge-ip-version 4` and `--protocol http2` skip the two things that most often hang: an IPv6
 * route that goes nowhere, and QUIC on UDP 7844 being blocked.
 */
const CLOUDFLARE_ATTEMPTS = 3;

let cloudflare = { code: 1, spawned: true };

for (let attempt = 1; attempt <= CLOUDFLARE_ATTEMPTS; attempt += 1) {
  if (attempt > 1) {
    console.log(`share: Cloudflare registration timed out — retry ${attempt} of ${CLOUDFLARE_ATTEMPTS}.`);
    console.log('');
  }

  cloudflare = await run(binary, [
    'tunnel',
    '--no-autoupdate',
    '--edge-ip-version',
    '4',
    '--protocol',
    'http2',
    '--url',
    `http://localhost:${port}`,
  ]);

  // A clean exit means the tunnel ran and the user stopped it. Nothing to retry.
  if (cloudflare.code === 0) process.exit(0);

  // A binary that will not start will not start on the third go either.
  if (!cloudflare.spawned) break;
}

console.log('');

// Say which of the two things went wrong. Reporting a network problem when the binary never
// started sends whoever is debugging this straight past the actual cause.
if (!cloudflare.spawned) {
  console.log(`share: could not start cloudflared at ${binary}`);
  console.log(`       ${cloudflare.err?.message ?? 'spawn failed'}`);
  console.log('       Delete .tools/ and re-run to fetch it again.');
} else {
  console.log(`share: Cloudflare would not register a tunnel after ${CLOUDFLARE_ATTEMPTS} attempts.`);
}

console.log('');
console.log('share: falling back to localtunnel. It shows visitors a warning page first, and they');
console.log("       have to type this machine's public IP to get past it. That IP is on the page.");
console.log('');

const fallback = await runShell(
  `npx --yes localtunnel --port ${port} --subdomain datagateways-preview`,
);

process.exit(fallback.code);
