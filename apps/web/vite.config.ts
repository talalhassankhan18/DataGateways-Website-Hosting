/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_PROXY ?? 'http://localhost:4000';

/**
 * Hostnames the dev server will answer to beyond localhost and bare IPs.
 *
 * Vite checks the Host header and rejects anything it does not recognise with "Blocked request.
 * This host is not allowed" — a defence against DNS rebinding, where a hostile page resolves a
 * domain it controls to 127.0.0.1 and reads your dev server through it. That check is also what
 * stops a tunnel working, because the request arrives carrying the tunnel's hostname.
 *
 * These are named explicitly rather than set to `true`. Allowing every host would switch the
 * rebinding protection off for good, in a config that is easy to forget about; a leading dot
 * allows any subdomain of that one provider and nothing else.
 */
const TUNNEL_HOSTS = [
  '.trycloudflare.com',
  '.ngrok-free.app',
  '.ngrok.io',
  '.loca.lt',
];

/**
 * Public base path.
 *
 * Everything except GitHub Pages serves this site from a domain root, so the default is `/` and
 * nothing changes for local development, cPanel or Netlify.
 *
 * A GitHub Pages *project* site is served from `https://<user>.github.io/<repo>/`, so every asset
 * URL has to carry that prefix. Get it wrong and the page is not broken in any obvious way — the
 * HTML loads, every script and stylesheet 404s, and you get a blank white screen with no error
 * that names the cause. The deploy workflow sets this; it is not hardcoded, because the same
 * build has to keep working for a custom domain, where the prefix must go away again.
 */
/* Normalised to exactly one trailing slash, which Vite requires. The deploy workflow feeds this
   straight from actions/configure-pages, whose `base_path` output is "/my-repo" for a project
   site and the empty string for a user site or custom domain — so both "" and "/repo" and an
   already-slashed "/repo/" all have to land correctly. */
const BASE = `${(process.env.VITE_BASE ?? '/').replace(/\/+$/, '')}/`;

export default defineConfig({
  base: BASE,

  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 3000,
    // Fail loudly rather than silently sliding to 3001 — the API's CORS origin and the launch
    // config both name this port, so a silent move breaks them without saying so.
    strictPort: true,
    /*
     * Bind to every interface, not just loopback, so Vite prints a Network: URL and the site can
     * be opened from a phone or another machine on the same network.
     *
     * The /api proxy still resolves `localhost` on the machine running Vite, so a request from
     * another device reaches the local API correctly rather than looking for one on its own
     * loopback.
     *
     * This does mean anything on the same network can reach the dev server. That is the point of
     * the setting, but it is a development convenience and says nothing about how the built site
     * should be served.
     */
    host: true,
    allowedHosts: TUNNEL_HOSTS,
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },

  /**
   * `vite preview` serves the production build — same port, same reach.
   *
   * This is the better thing to put behind a tunnel for a review: it is the bundle that would
   * actually ship, it loads faster, and it has no HMR websocket, so the reviewer's console stays
   * clean instead of filling with failed `wss://…:3000` attempts that the tunnel cannot route.
   */
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: TUNNEL_HOSTS,
  },

  build: {
    target: 'es2022',
    cssTarget: 'chrome100',
    // framer-motion is the one dependency large enough to be worth isolating: it is used on every
    // route, so a stable separate chunk survives content-only redeploys in the browser cache.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/react-router')) return 'router';
          return undefined;
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    restoreMocks: true,
  },
});
