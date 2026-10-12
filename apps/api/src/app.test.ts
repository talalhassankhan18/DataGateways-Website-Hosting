import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Article, ContactPayload } from '@datagateways/shared';
import { CONTACT_MIN_ELAPSED_MS } from '@datagateways/shared';
import { createApp } from './app.js';
import { loadConfig, type Config } from './config.js';
import { createLogger } from './logger.js';
import type { Mailer } from './mailer.js';

// Typed rather than cast, so a change to the Article shape breaks here instead of at runtime.
const ARTICLES: readonly Article[] = [
  {
    slug: 'older-briefing',
    date: '2026-01-01',
    category: 'briefing',
    headline: 'What the EU AI Act requires of your logs',
    caption: 'Briefing',
    href: '/resources/older-briefing',
  },
  {
    slug: 'newer-release',
    date: '2026-06-01',
    category: 'release-note',
    headline: 'AINerve adds multi-provider prompt inspection',
    caption: 'Release notes',
    href: '/resources/newer-release',
  },
];

/** A payload a real person would produce: honeypot empty, and slower than a bot. */
const validPayload = (overrides: Partial<ContactPayload> = {}) => ({
  branch: 'evaluate',
  qualifier: 'both',
  name: 'Sam Rivera',
  email: 'sam@example.com',
  organisation: 'Example Bank',
  message: 'We would like to see DataNerve against our own pipelines.',
  elapsedMs: CONTACT_MIN_ELAPSED_MS + 5_000,
  ...overrides,
});

const build = (options: { mailer?: Partial<Mailer>; env?: Record<string, string> } = {}) => {
  const send = vi.fn<Mailer['send']>().mockResolvedValue(undefined);
  const mailer = { send, ...options.mailer } as Mailer;

  const config: Config = loadConfig({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    ...options.env,
  } as NodeJS.ProcessEnv);

  // A real pino instance rather than a stub: pino-http reads `logger.levels`, so a hand-rolled
  // mock only proves the mock works. LOG_LEVEL=silent keeps the test output clean.
  const logger = createLogger(config);

  return { app: createApp({ config, logger, mailer, articles: ARTICLES }), send };
};

describe('GET /api/health', () => {
  it('reports status, version and uptime', async () => {
    const { app } = build();
    const response = await request(app).get('/api/health').expect(200);

    expect(response.body).toMatchObject({ status: 'ok' });
    expect(response.body.version).toEqual(expect.any(String));
    expect(response.body.uptime).toEqual(expect.any(Number));
  });
});

describe('GET /api/resources', () => {
  it('returns every article, newest first', async () => {
    const { app } = build();
    const response = await request(app).get('/api/resources').expect(200);

    expect(response.body.total).toBe(2);
    expect(response.body.articles.map((article: Article) => article.slug)).toEqual([
      'newer-release',
      'older-briefing',
    ]);
  });

  it('filters by category', async () => {
    const { app } = build();
    const response = await request(app).get('/api/resources?category=briefing').expect(200);

    expect(response.body.total).toBe(1);
    expect(response.body.articles[0].slug).toBe('older-briefing');
  });

  it('rejects an unknown category rather than silently returning everything', async () => {
    const { app } = build();
    const response = await request(app).get('/api/resources?category=nonsense').expect(400);

    expect(response.body.error.code).toBe('invalid_query');
  });
});

describe('POST /api/contact', () => {
  it('accepts a valid enquiry, mails it, and returns a reference', async () => {
    const { app, send } = build();
    const response = await request(app).post('/api/contact').send(validPayload()).expect(202);

    expect(response.body.status).toBe('accepted');
    expect(response.body.reference).toMatch(/^DG-[0-9A-F]{10}$/);
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0][0]).toMatchObject({ branch: 'evaluate', email: 'sam@example.com' });
  });

  it('never echoes back what the sender submitted', async () => {
    const { app } = build();
    const response = await request(app)
      .post('/api/contact')
      .send(validPayload({ message: 'canary-value-do-not-reflect' }))
      .expect(202);

    expect(JSON.stringify(response.body)).not.toContain('canary-value-do-not-reflect');
    expect(Object.keys(response.body).sort()).toEqual(['reference', 'status']);
  });

  it('rejects an invalid payload with per-field messages', async () => {
    const { app, send } = build();
    const response = await request(app)
      .post('/api/contact')
      .send(validPayload({ email: 'not-an-email', branch: 'nope' as never }))
      .expect(400);

    expect(response.body.error.code).toBe('invalid_request');
    expect(Object.keys(response.body.error.fields)).toEqual(
      expect.arrayContaining(['branch', 'email']),
    );
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects unknown fields rather than passing them through', async () => {
    const { app } = build();
    await request(app)
      .post('/api/contact')
      .send({ ...validPayload(), isAdmin: true })
      .expect(400);
  });

  // The two bot checks below must look identical to a caller: telling a bot it was caught only
  // teaches it which field to leave alone next time.
  it('silently drops an enquiry with the honeypot filled, without mailing it', async () => {
    const { app, send } = build();
    const response = await request(app)
      .post('/api/contact')
      .send(validPayload({ website: 'https://spam.example' }))
      .expect(202);

    expect(response.body.status).toBe('accepted');
    expect(send).not.toHaveBeenCalled();
  });

  it('silently drops an enquiry completed faster than a human could, without mailing it', async () => {
    const { app, send } = build();
    const response = await request(app)
      .post('/api/contact')
      .send(validPayload({ elapsedMs: CONTACT_MIN_ELAPSED_MS - 1 }))
      .expect(202);

    expect(response.body.status).toBe('accepted');
    expect(send).not.toHaveBeenCalled();
  });

  it('surfaces a mail failure as a 500 without leaking the cause in production', async () => {
    const { app } = build({
      mailer: { send: vi.fn().mockRejectedValue(new Error('smtp credentials rejected')) },
      // Production refuses to boot without SMTP and all four routed mailboxes — see config.ts.
      env: {
        NODE_ENV: 'production',
        SITE_ORIGIN: 'https://data-gateways.com',
        SMTP_HOST: 'smtp.example.com',
        MAIL_FROM: 'site@example.com',
        MAILBOX_EVALUATE: 'sales@example.com',
        MAILBOX_PARTNER: 'partners@example.com',
        MAILBOX_SUPPORT: 'support@example.com',
        MAILBOX_CAREERS: 'careers@example.com',
      },
    });

    const response = await request(app).post('/api/contact').send(validPayload()).expect(500);

    expect(response.body.error.code).toBe('internal_error');
    expect(JSON.stringify(response.body)).not.toContain('smtp credentials rejected');
  });

  it('rate limits once the window is exhausted', async () => {
    const { app } = build({ env: { CONTACT_RATE_LIMIT_MAX: '2' } });

    await request(app).post('/api/contact').send(validPayload()).expect(202);
    await request(app).post('/api/contact').send(validPayload()).expect(202);

    const response = await request(app).post('/api/contact').send(validPayload()).expect(429);
    expect(response.body.error.code).toBe('rate_limited');
  });
});

describe('configuration', () => {
  it('refuses to boot in production without SMTP and all four routed mailboxes', () => {
    // Fail closed: a production deployment that silently drops enquiries is worse than one that
    // refuses to start.
    expect(() => loadConfig({ NODE_ENV: 'production' } as NodeJS.ProcessEnv)).toThrow(
      /MAILBOX_EVALUATE is required/,
    );
  });

  it('does not require mailboxes outside production, so the site runs locally', () => {
    expect(() => loadConfig({ NODE_ENV: 'development' } as NodeJS.ProcessEnv)).not.toThrow();
  });

  it('defaults to trusting no proxy hops, so X-Forwarded-For cannot bypass the rate limiter', () => {
    expect(loadConfig({ NODE_ENV: 'test' } as NodeJS.ProcessEnv).TRUST_PROXY_HOPS).toBe(0);
  });
});

describe('unknown endpoints', () => {
  it('404s as JSON rather than an HTML error page', async () => {
    const { app } = build();
    const response = await request(app).get('/api/nope').expect(404);

    expect(response.body.error.code).toBe('not_found');
  });
});
