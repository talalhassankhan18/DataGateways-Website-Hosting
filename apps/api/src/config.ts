import { z } from 'zod';

/**
 * Every deployment-specific value arrives through the environment. In particular the four routed
 * mailboxes are [CONFIRM] in the copy deck and must never be hard-coded — see .env.example.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(4000),
    /** The only origin allowed to call this API. */
    SITE_ORIGIN: z.string().url().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),

    /**
     * How many proxy hops to trust when reading the client IP. Leave at 0 unless the API really is
     * behind a proxy — trusting a header nobody sets lets a caller spoof its IP and walk straight
     * through the rate limiter.
     */
    TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),

    CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    CONTACT_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(60),

    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    SMTP_USER: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    MAIL_FROM: z.string().email().optional(),

    MAILBOX_EVALUATE: z.string().email().optional(),
    MAILBOX_PARTNER: z.string().email().optional(),
    MAILBOX_SUPPORT: z.string().email().optional(),
    MAILBOX_CAREERS: z.string().email().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV !== 'production') return;

    // Fail closed. A production deployment that silently drops enquiries is worse than one that
    // refuses to boot.
    const required = [
      'SMTP_HOST',
      'MAIL_FROM',
      'MAILBOX_EVALUATE',
      'MAILBOX_PARTNER',
      'MAILBOX_SUPPORT',
      'MAILBOX_CAREERS',
    ] as const;

    for (const key of required) {
      if (!value[key]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${key} is required when NODE_ENV=production`,
        });
      }
    }
  });

export type Config = z.infer<typeof schema>;

export const loadConfig = (env: NodeJS.ProcessEnv = process.env): Config => {
  const parsed = schema.safeParse(env);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${detail}`);
  }

  return parsed.data;
};
