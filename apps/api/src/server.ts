import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { createMailer } from './mailer.js';

const config = loadConfig();
const logger = createLogger(config);
const mailer = createMailer(config, logger);
const app = createApp({ config, logger, mailer });

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'api listening');
});

/** Stop accepting connections, let in-flight requests finish, then exit. */
const shutdown = (signal: string) => {
  logger.info({ signal }, 'shutting down');

  const forced = setTimeout(() => {
    logger.error('forced exit: connections did not close in time');
    process.exit(1);
  }, 10_000);
  forced.unref();

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'error while closing server');
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
