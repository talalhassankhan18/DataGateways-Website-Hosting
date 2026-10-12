import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_FIELD_LIMITS } from '@datagateways/shared';
import { Button } from '@/components/primitives/Button';
import { SplitHeading } from '@/components/primitives/SplitHeading';
import { ContactError, postPartnerApplication } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { partners } from '@/content/partners';

const form = partners.become.form;

type TextField = 'company' | 'website' | 'country' | 'contact' | 'email' | 'phone' | 'about';
type SelectField = 'region' | 'size';
type FieldName = TextField | SelectField;
type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY = {
  company: '',
  website: '',
  region: '',
  country: '',
  contact: '',
  email: '',
  phone: '',
  size: '',
  about: '',
};

const FIELD_CLASS =
  'w-full rounded-sm border bg-bg-base px-4 py-3 text-body-sm text-ink-primary transition-colors duration-hover placeholder:text-ink-muted';

/**
 * The partner programme application.
 *
 * Submits the partner-specific fields to the public partner-request endpoint, which stores the
 * application in the backend's PartnerRequest table.
 */
export function PartnerApplicationForm() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState('');
  const [logo, setLogo] = useState<File | null>(null);

  const fieldId = useId();
  const successRef = useRef<HTMLParagraphElement>(null);
  const startReported = useRef(false);

  /* One form_start per mount, on the first real interaction — see the matching note in
     ContactForm for why this is not fired on render. */
  const reportStart = () => {
    if (startReported.current) return;
    startReported.current = true;
    trackEvent('form_start', { form_name: 'partner_application' });
  };

  const setValue = (name: keyof typeof EMPTY, value: string) => {
    reportStart();
    setValues((previous) => ({ ...previous, [name]: value }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldName, string>> = {};
    const required: readonly [FieldName, string][] = [
      ['company', form.errors.company],
      ['region', form.errors.region],
      ['country', form.errors.country],
      ['contact', form.errors.contact],
      ['phone', form.errors.phone],
      ['size', form.errors.size],
    ];

    for (const [name, message] of required) {
      if (values[name].trim().length === 0) next[name] = message;
    }

    if (!EMAIL.test(values.email.trim())) next.email = form.errors.email;
    if (values.website.trim()) {
      try {
        new URL(values.website.trim());
      } catch {
        next.website = form.errors.website;
      }
    }
    if (values.company.length > CONTACT_FIELD_LIMITS.organisation) next.company = form.errors.tooLong;
    if (values.contact.length > CONTACT_FIELD_LIMITS.name) next.contact = form.errors.tooLong;
    if (values.email.length > CONTACT_FIELD_LIMITS.email) next.email = form.errors.tooLong;
    if (values.about.length > CONTACT_FIELD_LIMITS.message) next.about = form.errors.tooLong;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!validate()) {
      trackEvent('form_error', { form_name: 'partner_application', error_kind: 'validation' });
      return;
    }

    setStatus('sending');

    const payload = {
      companyName: values.company.trim(),
      companyWebsite: values.website.trim(),
      region: values.region,
      country: values.country.trim(),
      contactName: values.contact.trim(),
      workEmail: values.email.trim(),
      phone: values.phone.trim(),
      companySize: values.size,
      businessDescription: values.about.trim(),
    };

    try {
      const accepted = await postPartnerApplication(payload);

      /* The same recommended event as the contact form, distinguished by form_name, so both
         conversions roll up into GA4's lead reporting while staying separable. No company name,
         contact name, email, phone or free-text description is sent — only that it happened. */
      trackEvent('generate_lead', { form_name: 'partner_application' });

      setReference(accepted.data.id);
      setStatus('sent');
      setValues(EMPTY);
      setLogo(null);
      startReported.current = false;
      window.setTimeout(() => successRef.current?.focus(), 0);
    } catch (error) {
      const rateLimited = error instanceof ContactError && error.kind === 'rateLimited';

      trackEvent('form_error', {
        form_name: 'partner_application',
        error_kind: rateLimited ? 'rate_limited' : 'generic',
      });

      setStatus('error');
      setFormError(rateLimited ? form.errors.rateLimited : form.errors.generic);
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-sm border border-accent/30 bg-bg-surface/60 p-8">
        <SplitHeading
          as="h3"
          roman={form.success.heading.roman}
          accent={form.success.heading.accent}
        />
        <p
          ref={successRef}
          tabIndex={-1}
          className="mt-4 max-w-measure text-body-sm text-ink-secondary outline-none"
        >
          {form.success.body}
        </p>
        <p className="mt-6 font-mono text-index text-ink-dim">
          {form.success.referenceLabel}: <span className="text-accent-ink">{reference}</span>
        </p>
        <Button variant="ghost" className="mt-8" onClick={() => setStatus('idle')}>
          {form.success.again}
        </Button>
      </div>
    );
  }

  const describe = (id: string, name: FieldName, hint?: string) => {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    return {
      invalid: Boolean(errors[name]),
      errorId,
      hintId,
      describedBy: cn(errors[name] && errorId, hint && hintId) || undefined,
    };
  };

  const textField = (
    name: TextField,
    type: 'text' | 'email' | 'tel' | 'url' | 'textarea',
    wide = false,
  ) => {
    const id = `${fieldId}-${name}`;
    const config = form.fields[name];
    const hint = 'hint' in config ? config.hint : undefined;
    const autoComplete = 'autoComplete' in config ? config.autoComplete : 'off';
    const { invalid, errorId, hintId, describedBy } = describe(id, name, hint);

    const shared = {
      id,
      name,
      value: values[name],
      'aria-invalid': invalid || undefined,
      'aria-describedby': describedBy,
      className: cn(FIELD_CLASS, invalid ? 'border-accent-ink' : 'border-hairline/15'),
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setValue(name, event.target.value),
    };

    return (
      <div key={name} className={cn(wide && 'sm:col-span-2')}>
        <label htmlFor={id} className="mb-2 block text-eyebrow uppercase text-ink-dim">
          {config.label}
        </label>

        {type === 'textarea' ? (
          <textarea {...shared} rows={4} maxLength={CONTACT_FIELD_LIMITS.message} />
        ) : (
          <input {...shared} type={type} autoComplete={autoComplete} />
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

  const selectField = (name: SelectField, options: readonly string[]) => {
    const id = `${fieldId}-${name}`;
    const config = form.fields[name];
    const { invalid, errorId, describedBy } = describe(id, name);

    return (
      <div key={name}>
        <label htmlFor={id} className="mb-2 block text-eyebrow uppercase text-ink-dim">
          {config.label}
        </label>

        <select
          id={id}
          name={name}
          value={values[name]}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => setValue(name, event.target.value)}
          className={cn(
            FIELD_CLASS,
            'appearance-none bg-[length:0.7rem] bg-[right_1rem_center] bg-no-repeat pr-10',
            invalid ? 'border-accent-ink' : 'border-hairline/15',
            values[name].length === 0 && 'text-ink-muted',
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath fill='%235A6675' d='M1 1.5 6 6.5l5-5'/%3E%3C/svg%3E\")",
          }}
        >
          <option value="">{config.placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option} className="text-ink-primary">
              {option}
            </option>
          ))}
        </select>

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
      <fieldset className="border-0 p-0">
        <legend className="sr-only">{form.legend}</legend>

        <div className="grid gap-6 sm:grid-cols-2">
          {textField('company', 'text')}
          {textField('website', 'url')}
          {selectField('region', form.regions)}
          {textField('country', 'text')}
          {textField('contact', 'text')}
          {textField('email', 'email')}
          {textField('phone', 'tel')}
          {selectField('size', form.sizes)}
          {textField('about', 'textarea', true)}
          <div className="sm:col-span-2">
            <label
              htmlFor={`${fieldId}-logo`}
              className="mb-2 block text-eyebrow uppercase text-ink-dim"
            >
              {form.fields.logo.label}
            </label>
            <input
              id={`${fieldId}-logo`}
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) => setLogo(event.target.files?.[0] ?? null)}
              className={cn(
                FIELD_CLASS,
                'file:mr-4 file:rounded-sm file:border-0 file:bg-accent-ink file:px-4 file:py-2 file:text-body-sm file:font-semibold file:text-white',
                'file:transition-colors file:hover:bg-accent',
              )}
            />
            <p className="mt-2 text-body-sm text-ink-muted">
              PNG, JPG, WebP or SVG. Maximum 5 MB.
              {logo ? ` Selected: ${logo.name}` : ''}
            </p>
          </div>
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
          {status === 'sending' ? form.submitting : form.submit}
        </Button>

        <p className="text-body-sm text-ink-secondary">
          {form.loginPrompt}{' '}
          <Link to={form.loginHref} className="tap-target text-accent-ink underline underline-offset-4">
            {form.loginLabel}
          </Link>
        </p>
      </div>
    </form>
  );
}
