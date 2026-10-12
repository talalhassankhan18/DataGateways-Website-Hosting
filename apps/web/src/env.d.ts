/// <reference types="vite/client" />

/**
 * Typed `import.meta.env`.
 *
 * Without this, every `VITE_*` read falls through Vite's index signature as `any`, so a typo in a
 * variable name is a silent `undefined` rather than a build error. Both variables are optional:
 * the app is designed to run correctly with neither of them set.
 */
interface ImportMetaEnv {
  /** Empty in development — the Vite `/api` proxy handles it. See `lib/api.ts`. */
  readonly VITE_API_URL?: string;
  /**
   * GA4 measurement ID, `G-XXXXXXXXXX`. Unset or malformed means analytics is inert: no script is
   * injected and no request is made. See `lib/analytics.ts`.
   */
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
