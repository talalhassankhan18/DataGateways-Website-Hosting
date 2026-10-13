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

const regionSelect = () => screen.getByLabelText('Filter partners by region');

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

    await user.selectOptions(regionSelect(), 'Europe');

    expect(shown()).toEqual(['Alpha Europe', 'Beta Europe']);
  });

  it('restores every partner when the region goes back to all', async () => {
    const user = await renderDirectory();

    await user.selectOptions(regionSelect(), 'Europe');
    expect(shown()).toHaveLength(2);

    await user.selectOptions(regionSelect(), 'all');

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
    const countrySelect = screen.getByLabelText('Filter partners by country');

    await user.selectOptions(countrySelect, 'Japan');
    expect(shown()).toEqual(['Gamma Asia']);

    await user.selectOptions(countrySelect, 'all');

    expect(shown()).toHaveLength(DIRECTORY.length);
  });

  it('combines region and country while both are set', async () => {
    const user = await renderDirectory();

    await user.selectOptions(regionSelect(), 'Asia');
    await user.selectOptions(screen.getByLabelText('Filter partners by country'), 'Japan');

    expect(shown()).toEqual(['Gamma Asia']);
  });

  it('clears the country when the region changes, so no invisible filter survives', async () => {
    const user = await renderDirectory();

    await user.selectOptions(regionSelect(), 'Asia');
    await user.selectOptions(screen.getByLabelText('Filter partners by country'), 'Japan');
    expect(shown()).toEqual(['Gamma Asia']);

    await user.selectOptions(regionSelect(), 'all');

    // The country list is rebuilt for the new region, so a country left over from the previous
    // one would narrow the results with nothing on screen explaining why.
    expect(shown()).toHaveLength(DIRECTORY.length);
    expect(screen.getByLabelText('Filter partners by country')).toHaveValue('all');
  });

  it('offers only the countries that exist in the chosen region', async () => {
    const user = await renderDirectory();

    await user.selectOptions(regionSelect(), 'Europe');

    const options = Array.from(
      screen.getByLabelText<HTMLSelectElement>('Filter partners by country').options,
    ).map((option) => option.value);

    // Europe plus Japan would be an empty result that both controls make look reasonable. The
    // contradiction is removed rather than explained.
    expect(options).toEqual(['all', 'France', 'Germany']);
  });
});
