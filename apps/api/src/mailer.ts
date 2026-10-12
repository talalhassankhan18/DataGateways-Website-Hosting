import nodemailer from 'nodemailer';
import type { ContactBranch, ContactPayload } from '@datagateways/shared';
import type { Config } from './config.js';
import type { Logger } from './logger.js';

export interface Mailer {
  send(payload: ContactPayload, reference: string): Promise<void>;
}

const mailboxFor = (config: Config, branch: ContactBranch): string | undefined =>
  ({
    evaluate: config.MAILBOX_EVALUATE,
    partner: config.MAILBOX_PARTNER,
    support: config.MAILBOX_SUPPORT,
    careers: config.MAILBOX_CAREERS,
  })[branch];

const body = (payload: ContactPayload, reference: string) =>
  [
    `Reference: ${reference}`,
    `Branch:    ${payload.branch}`,
    `Qualifier: ${payload.qualifier}`,
    '',
    `Name:         ${payload.name}`,
    `Email:        ${payload.email}`,
    `Organisation: ${payload.organisation}`,
    '',
    payload.message,
  ].join('\n');

/**
 * Subjects are built entirely from values we control — branch and reference — so there is no path
 * for a submitted string to reach a mail header. Sender-supplied text stays in the body.
 */
export const createMailer = (config: Config, logger: Logger): Mailer => {
  if (!config.SMTP_HOST || !config.MAIL_FROM) {
    logger.warn(
      'SMTP is not configured: enquiries will be acknowledged and logged but not delivered. ' +
        'This is refused outright when NODE_ENV=production.',
    );

    return {
      async send(payload, reference) {
        logger.info(
          { reference, branch: payload.branch, qualifier: payload.qualifier },
          'contact enquiry received (not delivered — SMTP not configured)',
        );
      },
    };
  }

  const transport = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_SECURE,
    ...(config.SMTP_USER && config.SMTP_PASSWORD
      ? { auth: { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } }
      : {}),
  });

  return {
    async send(payload, reference) {
      const to = mailboxFor(config, payload.branch);
      if (!to) throw new Error(`No mailbox configured for branch "${payload.branch}"`);

      await transport.sendMail({
        from: config.MAIL_FROM,
        to,
        replyTo: payload.email,
        subject: `[DataGateways] ${payload.branch} enquiry — ${reference}`,
        text: body(payload, reference),
      });

      logger.info({ reference, branch: payload.branch }, 'contact enquiry delivered');
    },
  };
};
