import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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

/*
 * The filters are a custom dropdown, not a <select>: a trigger button that opens a panel with a
 * search field and a listbox. Driving it means opening it, optionally searching, then choosing —
 * which is also the sequence a visitor performs, so the tests exercise the real interaction
 * rather than poking at state.
 */
const open = async (user: ReturnType<typeof userEvent.setup>, caption: 'Region' | 'Country') => {
  await user.click(screen.getByRole('button', { name: caption }));
  return screen.getByRole('listbox', {
    name: `Filter partners by ${caption.toLowerCase()}`,
  });
};

const pick = async (
  user: ReturnType<typeof userEvent.setup>,
  caption: 'Region' | 'Country',
  option: string,
) => {
  const listbox = await open(user, caption);
  await user.click(within(listbox).getByRole('option', { name: option }));
};

/* Named, not derived: "Country" does not pluralise to "countrys". */
const SEARCH_PLACEHOLDER = { Region: 'Search regions', Country: 'Search countries' } as const;

const search = async (
  user: ReturnType<typeof userEvent.setup>,
  caption: 'Region' | 'Country',
  term: string,
) => {
  const listbox = await open(user, caption);
  await user.type(screen.getByRole('searchbox', { name: SEARCH_PLACEHOLDER[caption] }), term);
  return listbox;
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

    await pick(user, 'Region', 'Europe');

    expect(shown()).toEqual(['Alpha Europe', 'Beta Europe']);
  });

  it('filters the option list as you search it', async () => {
    const user = await renderDirectory();

    // The point of the search field: 249 countries is not a list to scroll.
    const listbox = await search(user, 'Country', 'ger');
    const visible = within(listbox)
      .getAllByRole('option')
      .map((option) => option.textContent?.trim());

    expect(visible).toContain('Germany');
    expect(visible).not.toContain('Japan');
  });

  it('offers every country, not only the ones a partner sits in', async () => {
    const user = await renderDirectory();

    const listbox = await open(user, 'Country');
    const options = within(listbox)
      .getAllByRole('option')
      .map((option) => option.textContent?.trim());

    // Management asked for the full list on 19 Oct. Countries with a partner come first.
    expect(options).toContain('Germany');
    expect(options).toContain('Switzerland');
    expect(options.length).toBeGreaterThan(200);
  });

  it('restores every partner when the region goes back to all', async () => {
    const user = await renderDirectory();

    await pick(user, 'Region', 'Europe');
    expect(shown()).toHaveLength(2);

    await pick(user, 'Region', 'All regions');

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
    await pick(user, 'Country', 'Japan');
    expect(shown()).toEqual(['Gamma Asia']);

    await pick(user, 'Country', 'All countries');

    expect(shown()).toHaveLength(DIRECTORY.length);
  });

  it('combines region and country while both are set', async () => {
    const user = await renderDirectory();

    await pick(user, 'Region', 'Asia');
    await pick(user, 'Country', 'Japan');

    expect(shown()).toEqual(['Gamma Asia']);
  });

  it('shows nothing when the two filters cannot both be true', async () => {
    const user = await renderDirectory();

    // Now that every country is offered, Europe plus Japan is expressible again. An empty
    // directory with its empty-state message is the honest answer to an impossible question.
    await pick(user, 'Region', 'Europe');
    await pick(user, 'Country', 'Japan');

    expect(shown()).toHaveLength(0);
  });
});
