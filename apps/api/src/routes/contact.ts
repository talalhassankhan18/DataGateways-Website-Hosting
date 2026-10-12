import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import {
  CONTACT_BRANCHES,
  CONTACT_FIELD_LIMITS,
  CONTACT_MIN_ELAPSED_MS,
  type ContactAccepted,
} from '@datagateways/shared';
import type { Config } from '../config.js';
import type { Logger } from '../logger.js';
import type { Mailer } from '../mailer.js';

const bodySchema = z
  .object({
    branch: z.enum(CONTACT_BRANCHES),
    qualifier: z.string().trim().min(1).max(CONTACT_FIELD_LIMITS.qualifier),
    name: z.string().trim().min(1).max(CONTACT_FIELD_LIMITS.name),
    email: z.string().trim().email().max(CONTACT_FIELD_LIMITS.email),
    organisation: z.string().trim().min(1).max(CONTACT_FIELD_LIMITS.organisation),
    message: z.string().trim().min(1).max(CONTACT_FIELD_LIMITS.message),
    /** Honeypot: hidden in the UI, so a human never fills it. */
    website: z.string().max(200).optional(),
    elapsedMs: z.number().int().nonnegative().max(1000 * 60 * 60 * 24),
  })
  .strict();

const reference = () => `DG-${randomBytes(5).toString('hex').toUpperCase()}`;

export interface ContactDeps {
  config: Config;
  logger: Logger;
  mailer: Mailer;
}

export const contactRouter = ({ config, logger, mailer }: ContactDeps): Router => {
  const router = Router();

  const limiter = rateLimit({
    windowMs: config.CONTACT_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
    limit: config.CONTACT_RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'rate_limited', message: 'Too many enquiries from this address.' },
      });
    },
  });

  router.post('/', limiter, async (req, res, next) => {
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (key) fields[key] = issue.message;
      }

      res.status(400).json({
        error: { code: 'invalid_request', message: 'The enquiry could not be accepted.', fields },
      });
      return;
    }

    const payload = parsed.data;
    const id = reference();

    // A filled honeypot or an impossibly fast completion is a bot. Acknowledge exactly as we would
    // a real enquiry — telling a bot it was caught only teaches it what to change.
    const looksAutomated =
      (payload.website ?? '').length > 0 || payload.elapsedMs < CONTACT_MIN_ELAPSED_MS;

    if (looksAutomated) {
      logger.debug({ reference: id, branch: payload.branch }, 'contact enquiry rejected as automated');
      res.status(202).json({ status: 'accepted', reference: id } satisfies ContactAccepted);
      return;
    }

    try {
      await mailer.send(payload, id);
      // 202, not 200: delivery is someone else's queue now. The body deliberately echoes nothing
      // the sender submitted.
      res.status(202).json({ status: 'accepted', reference: id } satisfies ContactAccepted);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
