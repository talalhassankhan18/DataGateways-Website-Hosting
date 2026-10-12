import { readFileSync } from 'node:fs';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Article } from '@datagateways/shared';
import type { Config } from './config.js';
import type { Logger } from './logger.js';
import type { Mailer } from './mailer.js';
import { contactRouter } from './routes/contact.js';
import { healthRouter } from './routes/health.js';
import { resourcesRouter } from './routes/resources.js';

export const APP_VERSION = process.env.npm_package_version ?? '0.1.0';

export interface AppDeps {
  config: Config;
  logger: Logger;
  mailer: Mailer;
  /** Injectable so tests can supply a list without touching the data file. */
  articles?: readonly Article[];
}

const loadArticles = (): readonly Article[] => {
  const url = new URL('./data/articles.json', import.meta.url);
  return JSON.parse(readFileSync(url, 'utf8')) as Article[];
};

export const createApp = ({ config, logger, mailer, articles }: AppDeps): Express => {
  const app = express();

  // Only trust as many proxy hops as are actually in front of us. Trusting everything would let a
  // caller set X-Forwarded-For and walk around the rate limiter.
  app.set('trust proxy', config.TRUST_PROXY_HOPS);
  app.disable('x-powered-by');

  app.use(helmet());
  app.use(cors({ origin: config.SITE_ORIGIN, methods: ['GET', 'POST'], maxAge: 86400 }));
  app.use(express.json({ limit: '32kb' }));
  app.use(pinoHttp({ logger }));

  app.use('/api/health', healthRouter(APP_VERSION));
  app.use('/api/contact', contactRouter({ config, logger, mailer }));
  app.use('/api/resources', resourcesRouter({ articles: articles ?? loadArticles() }));

  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'not_found', message: 'No such endpoint.' } });
  });

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    req.log.error({ err: error }, 'unhandled request error');

    res.status(500).json({
      error: {
        code: 'internal_error',
        // Stack traces and driver messages are useful to us and to an attacker. Only the former
        // gets them, and only in the log.
        message:
          config.NODE_ENV === 'production'
            ? 'Something went wrong handling that request.'
            : error instanceof Error
              ? error.message
              : String(error),
      },
    });
  });

  return app;
};
