import pino from 'pino';
import type { Config } from './config.js';

/**
 * Enquiry bodies contain names, work emails and whatever the sender chose to tell us about their
 * security posture. None of that belongs in a log file, so it is redacted at the logger rather
 * than relying on every call site to remember.
 */
const REDACT = [
  'req.body.name',
  'req.body.email',
  'req.body.organisation',
  'req.body.message',
  'req.headers.authorization',
  'req.headers.cookie',
  'payload.name',
  'payload.email',
  'payload.organisation',
  'payload.message',
];

export const createLogger = (config: Config) =>
  pino({
    level: config.LOG_LEVEL,
    redact: { paths: REDACT, censor: '[redacted]' },
    ...(config.NODE_ENV === 'development'
      ? { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } } }
      : {}),
  });

export type Logger = ReturnType<typeof createLogger>;
