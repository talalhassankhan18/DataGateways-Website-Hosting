import { useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CONTACT_FIELD_LIMITS,
  isContactBranch,
  type ContactBranch,
  type ContactPayload,
} from '@datagateways/shared';
import { ArrowLink } from '@/components/primitives/ArrowLink';
import { Button } from '@/components/primitives/Button';
import { PlaceholderBadge } from '@/components/primitives/PlaceholderBadge';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { ContactError, postContact } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { EXPO_OUT } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { contact } from '@/content/contact';
import { site } from '@/content/site';

type FieldName = 'name' | 'email' | 'organisation' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = { name: '', email: '', organisation: '', message: '', website: '' };

const FIELD_CLASS =
  'w-full rounded-sm border bg-bg-base px-4 py-3 text-body-sm text-ink-primary transition-colors duration-hover placeholder:text-ink-muted';

/**
 * The whole contact form, on one screen.
 *
 * It replaces a three-step wizard: choose an intent, choose a refinement, and only then reach the
 * fields. Two full-page transitions before anyone could type their name, on the one page whose
 * entire job is to lower the barrier to writing to you. The two questions were worth asking;
 * making them gates was not.
 *
 * So the intent is four chips at the top of this form and the refinement is an optional select
 * beside them. Same routing data, one screen, one required click. A visitor who picks a chip and
 * fills four fields is done — no Back, no Start over, nothing to navigate.
 *
 * `qualifier` is required by the API, so where no refinement is chosen the branch title goes in
 * its place: routing still works and nobody is blocked by a question they did not want to answer.
 */
export function ContactForm() {
  const [branch, setBranch] = useState<ContactBranch | null>(null);
  const [qualifier, setQualifier] = useState('');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName | 'branch', string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState('');

  const reduced = useReducedMotion() ?? false;
  const fieldId = useId();
  const successRef = useRef<HTMLParagraphElement>(null);
  /* When the form was first rendered. The API rejects anything completed impossibly fast. */
  const startedAt = useRef(Date.now());
  /* Separate from startedAt: that one measures bot timing, this one is "has anyone touched it". */
  const startReported = useRef(false);

  const { enquiry } = contact;
  const { fields, errors: messages } = contact.form;
  const refinement = branch ? enquiry.refine[branch] : null;
  const note = branch ? enquiry.notes[branch] : null;

  /**
   * One `form_start` per mount, on the first real interaction.
   *
   * Fired from the first keystroke or chip rather than on render, because a form_start on render
   * is just a page view by another name — it would count every visitor who scrolled past, and the
   * start-to-submit ratio it exists to produce would be meaningless.
   */
  const reportStart = () => {
    if (startReported.current) return;
    startReported.current = true;
    trackEvent('form_start', { form_name: 'contact' });
  };

  const setValue = (name: keyof typeof EMPTY, value: string) => {
    reportStart();
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldName | 'branch', string>> = {};

    if (!branch) next.branch = messages.branch;

    if (values.name.trim().length === 0) next.name = messages.name;
    else if (values.name.length > CONTACT_FIELD_LIMITS.name) next.name = messages.tooLong;

    if (!EMAIL.test(values.email.trim())) next.email = messages.email;
    else if (values.email.length > CONTACT_FIELD_LIMITS.email) next.email = messages.tooLong;

    if (values.organisation.trim().length === 0) next.organisation = messages.organisation;
    else if (values.organisation.length > CONTACT_FIELD_LIMITS.organisation)
      next.organisation = messages.tooLong;

    if (values.message.trim().length === 0) next.message = messages.message;
    else if (values.message.length > CONTACT_FIELD_LIMITS.message) next.message = messages.tooLong;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validate() || !branch) {
      /* Counted so a field that quietly fails validation for everybody shows up as a cliff in the
         funnel. Which field it was is not sent — the parameter is the kind, not the content. */
      trackEvent('form_error', { form_name: 'contact', error_kind: 'validation' });
      return;
    }

    setStatus('sending');

    const chosen = enquiry.branches.find((item) => item.id === branch);

    const payload: ContactPayload = {
      branch,
      // The API requires a qualifier; the branch title stands in when none was chosen.
      qualifier: (qualifier || chosen?.title || branch).slice(0, CONTACT_FIELD_LIMITS.qualifier),
      name: values.name.trim(),
      email: values.email.trim(),
      organisation: values.organisation.trim(),
      message: values.message.trim(),
      website: values.website,
      elapsedMs: Date.now() - startedAt.current,
    };

    try {
      const accepted = await postContact(payload);

      /* GA4's own recommended event name, so this lands in the standard reports as a conversion
         without any property configuration. The branch is the one useful dimension — it says
         whether leads are arriving for sales, support, partnerships or press — and it is a fixed
         enum from the content deck, never anything the visitor typed. The reference, name, email,
         organisation and message are all deliberately absent. */
      trackEvent('generate_lead', { form_name: 'contact', enquiry_branch: branch });

      setReference(accepted.reference);
      setStatus('sent');
      setValues(EMPTY);
      setQualifier('');
      startedAt.current = Date.now();
      startReported.current = false;
      window.setTimeout(() => successRef.current?.focus(), 0);
    } catch (error) {
      const rateLimited = error instanceof ContactError && error.kind === 'rateLimited';

      trackEvent('form_error', {
        form_name: 'contact',
        error_kind: rateLimited ? 'rate_limited' : 'generic',
      });

      setStatus('error');
      setFormError(rateLimited ? messages.rateLimited : messages.generic);
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-sm border border-accent/30 bg-bg-surface/60 p-8">
        <SplitHeading
          as="h3"
          roman={contact.form.success.heading.roman}
          accent={contact.form.success.heading.accent}
        />
        <p
          ref={successRef}
          tabIndex={-1}
          className="mt-4 max-w-measure text-body-sm text-ink-secondary outline-none"
        >
          {contact.form.success.body}
        </p>
        <p className="mt-6 font-mono text-index text-ink-dim">
          {contact.form.success.referenceLabel}: <span className="text-accent-ink">{reference}</span>
        </p>
        <Button variant="ghost" className="mt-8" onClick={() => setStatus('idle')}>
          {contact.form.success.again}
        </Button>
      </div>
    );
  }

  const field = (name: FieldName, type: 'text' | 'email' | 'textarea', wide = false) => {
    const id = `${fieldId}-${name}`;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const invalid = Boolean(errors[name]);
    const hint = name === 'message' ? fields.message.hint : undefined;

    const shared = {
      id,
      name,
      value: values[name],
      'aria-invalid': invalid || undefined,
      'aria-describedby': cn(invalid && errorId, hint && hintId) || undefined,
      className: cn(FIELD_CLASS, invalid ? 'border-accent-ink' : 'border-hairline/15'),
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(name, event.target.value),
    };

    return (
      <div key={name} className={cn(wide && 'sm:col-span-2')}>
        <label htmlFor={id} className="mb-2 block text-eyebrow uppercase text-ink-dim">
          {fields[name].label}
        </label>

        {type === 'textarea' ? (
          <textarea {...shared} rows={4} maxLength={CONTACT_FIELD_LIMITS.message} />
        ) : (
          <input {...shared} type={type} autoComplete={fields[name].autoComplete} />
        )}

        {hint ? (
          <p id={hintId} className="mt-2 text-body-sm text-ink-muted">
            {hint}
          </p>
        ) : null}

        {invalid ? (
          <p id={errorId} role="alert" className="mt-2 text-body-sm text-accent-ink">
            {errors[name]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      {/*
        A radiogroup, not four buttons: this is one choice among four, and a screen reader should
        say "2 of 4" rather than read four unrelated controls. Arrow keys move between them, which
        is what a native radio gives and a set of buttons does not.
      */}
      <fieldset className="border-0 p-0">
        <legend className="mb-1 text-eyebrow uppercase text-ink-dim">
          {enquiry.branchLabel} *
        </legend>
        <p id={`${fieldId}-branch-hint`} className="mb-4 text-body-sm text-ink-muted">
          {enquiry.branchLegend}
        </p>

        <div
          role="radiogroup"
          aria-labelledby={`${fieldId}-branch-hint`}
          aria-required="true"
          className="grid gap-3 sm:grid-cols-2"
        >
          {enquiry.branches.map((item) => {
            const selected = branch === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                /* Only the selected chip is a tab stop; arrow keys move within the group. That is
                   the radio pattern, and it keeps four chips from costing four tabs. */
                tabIndex={selected || (!branch && item.id === enquiry.branches[0].id) ? 0 : -1}
                onKeyDown={(event) => {
                  const delta =
                    event.key === 'ArrowRight' || event.key === 'ArrowDown'
                      ? 1
                      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
                        ? -1
                        : 0;
                  if (delta === 0) return;
                  event.preventDefault();
                  const index = enquiry.branches.findIndex((b) => b.id === (branch ?? item.id));
                  const next =
                    enquiry.branches[
                      (index + delta + enquiry.branches.length) % enquiry.branches.length
                    ];
                  setBranch(next.id);
                  setQualifier('');
                  (
                    event.currentTarget.parentElement?.children[
                      enquiry.branches.indexOf(next)
                    ] as HTMLElement | undefined
                  )?.focus();
                }}
                onClick={() => {
                  if (!isContactBranch(item.id)) return;
                  /* Picking an enquiry type is an interaction with the form, and for most
                     visitors it is the first one — the chips sit above the fields. */
                  reportStart();
                  setBranch(item.id);
                  setQualifier('');
                  setErrors(({ branch: _dropped, ...rest }) => rest);
                }}
                className={cn(
                  'rounded-sm border p-4 text-left transition-[border-color,background-color] duration-hover',
                  selected
                    ? 'border-accent/60 bg-accent/5'
                    : 'border-hairline/15 bg-bg-surface/50 hover:border-accent/30 hover:bg-bg-elevated/60',
                )}
              >
                <span
                  className={cn(
                    'block text-body-sm font-semibold',
                    selected ? 'text-accent-ink' : 'text-ink-primary',
                  )}
                >
                  {item.title}
                </span>
                <span className="mt-1 block text-body-sm text-ink-secondary">{item.line}</span>
              </button>
            );
          })}
        </div>

        {errors.branch ? (
          <p role="alert" className="mt-3 text-body-sm text-accent-ink">
            {errors.branch}
          </p>
        ) : null}
      </fieldset>

      {/* Appears once a branch is chosen, and never blocks: leaving it alone is a valid answer. */}
      {refinement && note ? (
        <motion.div
          key={branch}
          initial={reduced ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0 : 0.32, ease: EXPO_OUT }}
          className="mt-8 grid gap-6 border-t border-hairline/10 pt-8 sm:grid-cols-2"
        >
          <div>
            <label
              htmlFor={`${fieldId}-qualifier`}
              className="mb-2 block text-eyebrow uppercase text-ink-dim"
            >
              {refinement.label}
            </label>
            <select
              id={`${fieldId}-qualifier`}
              name="qualifier"
              value={qualifier}
              onChange={(event) => setQualifier(event.target.value)}
              className={cn(FIELD_CLASS, 'border-hairline/15', qualifier === '' && 'text-ink-muted')}
            >
              <option value="">{refinement.placeholder}</option>
              {refinement.options.map((option) => (
                <option key={option.id} value={option.title} className="text-ink-primary">
                  {option.title}
                </option>
              ))}
            </select>
          </div>

          <div className="text-body-sm text-ink-secondary">
            <p>{note.body}</p>
            <ArrowLink label={note.secondary.label} to={note.secondary.href} className="mt-4" />
          </div>
        </motion.div>
      ) : null}

      <fieldset className="mt-8 border-0 border-t border-hairline/10 p-0 pt-8">
        <legend className="sr-only">{contact.form.legend}</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          {field('name', 'text')}
          {field('email', 'email')}
          {field('organisation', 'text')}
          {field('message', 'textarea', true)}
        </div>

        {/* Honeypot. Hidden from sight and from assistive tech, so only a bot fills it in. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${fieldId}-website`}>{fields.website.label}</label>
          <input
            id={`${fieldId}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(event) => setValue('website', event.target.value)}
          />
        </div>
      </fieldset>

      {formError ? (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-accent/40 bg-accent/10 px-4 py-3 text-body-sm text-ink-primary"
        >
          {formError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? contact.form.submitting : contact.form.submit}
        </Button>

        {/* The real mailbox, for anyone who would rather use their own client. */}
        <p className="text-body-sm text-ink-secondary">
          {contact.form.mailtoPrefix}{' '}
          <PlaceholderBadge item={site.contact.email}>
            <a
              href={`mailto:${site.contact.email.value}`}
              className="tap-target text-accent-ink transition-colors duration-hover hover:text-ink-primary"
            >
              {site.contact.email.value}
            </a>
          </PlaceholderBadge>
        </p>
      </div>
    </form>
  );
}
