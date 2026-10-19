import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PartnerFindPage from './PartnerFindPage';
import { fetchPublicPartners, type PublicPartner } from '@/lib/api';
import type * as ApiModule from '@/lib/api';
import { triggerIntersection } from '../../vitest.setup';

vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof ApiModule>();
  return { ...actual, fetchPublicPartners: vi.fn() };
});

const partner = (
  id: string,
  company: string,
  region: string,
  country: string,
): PublicPartner => ({
  id,
  company,
  region,
  country,
  focusArea: 'Governance',
  tier: 'Gold',
  logoUrl: null,
});

const DIRECTORY: readonly PublicPartner[] = [
  partner('1', 'Alpha Europe', 'Europe', 'Germany'),
  partner('2', 'Beta Europe', 'Europe', 'France'),
  partner('3', 'Gamma Asia', 'Asia', 'Japan'),
  partner('4', 'Delta Asia', 'Asia', 'India'),
  partner('5', 'Epsilon NA', 'North America', 'USA'),
];

const shown = () => screen.queryAllByRole('heading', { level: 3 }).map((h) => h.textContent);

const regionInput = () => screen.getByLabelText('Filter partners by region');
const countryInput = () => screen.getByLabelText('Filter partners by country');

/** The controls are typed now, so clearing means emptying the box rather than picking "all". */
const type = async (
  user: ReturnType<typeof userEvent.setup>,
  field: HTMLElement,
  value: string,
) => {
  await user.clear(field);
  if (value) await user.type(field, value);
};

describe('the partner directory', () => {
  beforeEach(() => {
    vi.mocked(fetchPublicPartners).mockResolvedValue(DIRECTORY);
  });

  const renderDirectory = async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PartnerFindPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(shown()).toHaveLength(DIRECTORY.length));
    // The cards reveal on scroll; drive the observer so they are in their settled state before
    // anything is filtered, which is the condition the bug needed.
    triggerIntersection(true);

    return user;
  };

  it('lists every partner the API returns', async () => {
    await renderDirectory();

    expect(shown()).toEqual([
      'Alpha Europe',
      'Beta Europe',
      'Gamma Asia',
      'Delta Asia',
      'Epsilon NA',
    ]);
  });

  it('narrows to the chosen region', async () => {
    const user = await renderDirectory();

    await type(user, regionInput(), 'Europe');

    expect(shown()).toEqual(['Alpha Europe', 'Beta Europe']);
  });

  it('narrows on a partial entry rather than emptying the directory', async () => {
    const user = await renderDirectory();

    // The controls are typed, so a half-finished word has to behave sensibly on the way in.
    await type(user, countryInput(), 'ger');

    expect(shown()).toEqual(['Alpha Europe']);
  });

  it('offers every country, not only the ones a partner sits in', async () => {
    await renderDirectory();

    const options = Array.from(
      document.querySelectorAll<HTMLOptionElement>('datalist option'),
    ).map((option) => option.value);

    // Management asked for the full list on 19 Oct. Countries with a partner come first.
    expect(options).toContain('Germany');
    expect(options).toContain('Switzerland');
    expect(options.length).toBeGreaterThan(200);
  });

  it('restores every partner when the region goes back to all', async () => {
    const user = await renderDirectory();

    await type(user, regionInput(), 'Europe');
    expect(shown()).toHaveLength(2);

    await type(user, regionInput(), '');

    /*
     * The reported bug. The filter arithmetic was never wrong — the partners came straight back
     * into the DOM — but they came back inside a RevealGroup that had already finished
     * animating, so the ones that had been filtered out mounted at `hidden` and stayed
     * invisible. The directory looked stuck on the narrower result.
     *
     * Asserting presence is what this test can do in jsdom, where there is no layout and
     * framer-motion does not paint. It guards the half that is testable: that every partner is
     * rendered again. The other half is structural — each card now carries its own Reveal rather
     * than inheriting a one-shot group variant, so a card cannot mount into a settled parent and
     * be forgotten.
     */
    expect(shown()).toEqual([
      'Alpha Europe',
      'Beta Europe',
      'Gamma Asia',
      'Delta Asia',
      'Epsilon NA',
    ]);
  });

  it('restores every partner when the country goes back to all', async () => {
    const user = await renderDirectory();
    await type(user, countryInput(), 'Japan');
    expect(shown()).toEqual(['Gamma Asia']);

    await type(user, countryInput(), '');

    expect(shown()).toHaveLength(DIRECTORY.length);
  });

  it('combines region and country while both are set', async () => {
    const user = await renderDirectory();

    await type(user, regionInput(), 'Asia');
    await type(user, countryInput(), 'Japan');

    expect(shown()).toEqual(['Gamma Asia']);
  });

  it('shows nothing when the two filters cannot both be true', async () => {
    const user = await renderDirectory();

    // Now that every country is offered, Europe plus Japan is expressible again. An empty
    // directory with its empty-state message is the honest answer to an impossible question.
    await type(user, regionInput(), 'Europe');
    await type(user, countryInput(), 'Japan');

    expect(shown()).toHaveLength(0);
  });
});
