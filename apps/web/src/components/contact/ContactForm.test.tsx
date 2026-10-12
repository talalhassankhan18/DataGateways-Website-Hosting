import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type * as ApiModule from '@/lib/api';
import { contact } from '@/content/contact';

const postContact = vi.fn();
vi.mock('@/lib/api', async () => {
  const actual = await vi.importActual<typeof ApiModule>('@/lib/api');
  return { ...actual, postContact: (...args: unknown[]) => postContact(...args) };
});

const { ContactForm } = await import('./ContactForm');

const { enquiry } = contact;
const [evaluate, , support] = enquiry.branches;

const setup = () => {
  const user = userEvent.setup();
  render(<ContactForm />, { wrapper: MemoryRouter });
  return user;
};

const fillDetails = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(contact.form.fields.name.label), 'Ada Lovelace');
  await user.type(screen.getByLabelText(contact.form.fields.email.label), 'ada@example.com');
  await user.type(screen.getByLabelText(contact.form.fields.organisation.label), 'Analytical Ltd');
  await user.type(screen.getByLabelText(contact.form.fields.message.label), 'A line or two.');
};

beforeEach(() => {
  postContact.mockReset();
  postContact.mockResolvedValue({ status: 'accepted', reference: 'DG-TEST-1' });
});

describe('ContactForm', () => {
  /*
   * The whole point of replacing the wizard. Every field was previously three screens and two
   * transitions away; a contact page that hides its form has the wrong default.
   */
  it('shows every field on arrival, with nothing to click through first', () => {
    setup();

    for (const label of [
      contact.form.fields.name.label,
      contact.form.fields.email.label,
      contact.form.fields.organisation.label,
      contact.form.fields.message.label,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: contact.form.submit })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(enquiry.branches.length);
  });

  it('asks for an intent before sending, so the message is routed', async () => {
    const user = setup();
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: contact.form.submit }));

    expect(await screen.findByText(contact.form.errors.branch)).toBeInTheDocument();
    expect(postContact).not.toHaveBeenCalled();
  });

  it('offers the matching refinement once an intent is chosen', async () => {
    const user = setup();

    expect(screen.queryByLabelText(enquiry.refine.support.label)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: new RegExp(support.title, 'i') }));

    const select = await screen.findByLabelText(enquiry.refine.support.label);
    expect(within(select).getAllByRole('option')).toHaveLength(
      enquiry.refine.support.options.length + 1,
    );
  });

  /*
   * The API requires a qualifier (`z.string().min(1)`), and the refinement is optional by design.
   * Sending the branch title keeps both true — without this the form would 400 for anyone who
   * skipped a question they were told they could skip.
   */
  it('sends the intent as the qualifier when no refinement is chosen', async () => {
    const user = setup();
    await user.click(screen.getByRole('radio', { name: new RegExp(evaluate.title, 'i') }));
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: contact.form.submit }));

    expect(postContact).toHaveBeenCalledTimes(1);
    const payload = postContact.mock.calls[0][0] as { branch: string; qualifier: string };
    expect(payload.branch).toBe(evaluate.id);
    expect(payload.qualifier).toBe(evaluate.title);
    expect(payload.qualifier.length).toBeGreaterThan(0);
  });

  it('sends the refinement when one is chosen', async () => {
    const user = setup();
    await user.click(screen.getByRole('radio', { name: new RegExp(support.title, 'i') }));
    await user.selectOptions(
      await screen.findByLabelText(enquiry.refine.support.label),
      enquiry.refine.support.options[2].title,
    );
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: contact.form.submit }));

    const payload = postContact.mock.calls[0][0] as { qualifier: string };
    expect(payload.qualifier).toBe(enquiry.refine.support.options[2].title);
  });

  it('hands back a reference rather than leaving the sender guessing', async () => {
    const user = setup();
    await user.click(screen.getByRole('radio', { name: new RegExp(evaluate.title, 'i') }));
    await fillDetails(user);
    await user.click(screen.getByRole('button', { name: contact.form.submit }));

    expect(await screen.findByText(/DG-TEST-1/)).toBeInTheDocument();
  });

  /* Four chips should cost one tab stop, not four — that is what the radio pattern buys. */
  it('exposes the intents as one radiogroup', () => {
    setup();

    const group = screen.getByRole('radiogroup');
    const stops = within(group)
      .getAllByRole('radio')
      .filter((chip) => chip.getAttribute('tabindex') === '0');
    expect(stops).toHaveLength(1);
  });
});
