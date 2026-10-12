import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { useLinkTracking } from './useLinkTracking';
import { trackEvent } from './analytics';
import type * as AnalyticsModule from './analytics';
import { Button } from '@/components/primitives/Button';
import { ArrowLink } from '@/components/primitives/ArrowLink';

/* The real classifyLink, a fake trackEvent, and analyticsConfigured forced on — otherwise the
   listener never attaches and every assertion below passes for the wrong reason. */
vi.mock('./analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof AnalyticsModule>();
  return { ...actual, analyticsConfigured: true, trackEvent: vi.fn() };
});

const events = () => vi.mocked(trackEvent).mock.calls;
const eventsNamed = (name: string) => events().filter(([eventName]) => eventName === name);

function Harness({ children }: { children: React.ReactNode }) {
  useLinkTracking();
  return <MemoryRouter>{children}</MemoryRouter>;
}

/* jsdom has no navigation, and an unhandled "Not implemented: navigation" error from a real
   anchor click would fail the run. Cancelling at the root leaves the capture-phase listener —
   which runs first — with exactly the event it would see in a browser. */
const renderLinks = (children: React.ReactNode) => {
  const result = render(<Harness>{children}</Harness>);
  result.container.addEventListener('click', (event) => event.preventDefault());
  return result;
};

describe('useLinkTracking', () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
  });

  it('counts a click on another site as an outbound click', async () => {
    const user = userEvent.setup();
    renderLinks(
      <a href="https://www.linkedin.com/company/data-gateways/" aria-label="LinkedIn">
        <svg />
      </a>,
    );

    await user.click(screen.getByRole('link', { name: 'LinkedIn' }));

    expect(eventsNamed('outbound_click')).toHaveLength(1);
    expect(eventsNamed('outbound_click')[0][1]).toMatchObject({
      link_domain: 'www.linkedin.com',
      // The footer's social links wrap an SVG and have no text, so only the label says which
      // network was clicked.
      link_text: 'LinkedIn',
    });
  });

  it('records which contact channel was used, never who was contacted', async () => {
    const user = userEvent.setup();
    renderLinks(
      <>
        <a href="mailto:info@datagateways.net">Email us</a>
        <a href="tel:+18722842859">Call us</a>
      </>,
    );

    await user.click(screen.getByRole('link', { name: 'Email us' }));
    await user.click(screen.getByRole('link', { name: 'Call us' }));

    expect(eventsNamed('contact_channel_click').map(([, params]) => params)).toEqual([
      { channel: 'email' },
      { channel: 'phone' },
    ]);

    // The address and the number are personal data and have no business in a GA4 property.
    const serialised = JSON.stringify(events());
    expect(serialised).not.toContain('info@datagateways.net');
    expect(serialised).not.toContain('8722842859');
  });

  it('ignores in-page anchors, which the anchor rail is built from', async () => {
    const user = userEvent.setup();
    renderLinks(<a href="#enquiry">Jump to enquiry</a>);

    await user.click(screen.getByRole('link', { name: 'Jump to enquiry' }));

    expect(events()).toHaveLength(0);
  });

  describe('the no-double-count invariant', () => {
    it('counts an internal CTA once, as a cta_click', async () => {
      const user = userEvent.setup();
      renderLinks(<Button to="/contact">Request a Demo</Button>);

      await user.click(screen.getByRole('link', { name: 'Request a Demo' }));

      expect(events()).toHaveLength(1);
      expect(events()[0]).toEqual([
        'cta_click',
        expect.objectContaining({
          cta_label: 'Request a Demo',
          cta_destination: '/contact',
        }),
      ]);
    });

    it('counts an outbound CTA once, as an outbound_click', async () => {
      const user = userEvent.setup();
      renderLinks(<Button href="https://status.example.com">Service status</Button>);

      await user.click(screen.getByRole('link', { name: 'Service status' }));

      // The primitive stays out of it for external destinations and the delegated listener takes
      // it. One click, one event -- not one click arriving as two that each claim to be the
      // whole story.
      expect(events()).toHaveLength(1);
      expect(events()[0][0]).toBe('outbound_click');
    });

    it('carries the card context on an ArrowLink, so four Explores are distinguishable', async () => {
      const user = userEvent.setup();
      renderLinks(<ArrowLink label="Explore" context="DataNerve" to="/products/datanerve" />);

      await user.click(screen.getByRole('link', { name: 'Explore, DataNerve' }));

      expect(events()[0][1]).toMatchObject({
        cta_label: 'Explore, DataNerve',
        cta_destination: '/products/datanerve',
      });
    });
  });
});
