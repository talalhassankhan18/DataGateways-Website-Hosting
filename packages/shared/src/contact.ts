export const CONTACT_BRANCHES = ['evaluate', 'partner', 'support', 'careers'] as const;
export type ContactBranch = (typeof CONTACT_BRANCHES)[number];

export const isContactBranch = (value: unknown): value is ContactBranch =>
  typeof value === 'string' && (CONTACT_BRANCHES as readonly string[]).includes(value);

/**
 * Bots fill every field they can see. `website` is the honeypot — it is visually hidden and must
 * arrive empty. `elapsedMs` is how long the wizard was open; a human cannot complete three steps
 * in under CONTACT_MIN_ELAPSED_MS.
 */
export const CONTACT_MIN_ELAPSED_MS = 3000;

export interface ContactPayload {
  readonly branch: ContactBranch;
  readonly qualifier: string;
  readonly name: string;
  readonly email: string;
  readonly organisation: string;
  readonly message: string;
  readonly website?: string;
  readonly elapsedMs: number;
}

export interface ContactAccepted {
  readonly status: 'accepted';
  readonly reference: string;
}

export interface ApiErrorBody {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly fields?: Readonly<Record<string, string>>;
  };
}

export const CONTACT_FIELD_LIMITS = {
  name: 120,
  email: 254,
  organisation: 160,
  message: 4000,
  qualifier: 64,
} as const;
