import {
  flag,
  type Heading,
  type SeoMeta,
} from '@datagateways/shared';
import type { AnchorDef } from './home';

export const aboutAnchors: readonly AnchorDef[] = [
  { id: 'hero', label: 'Intro' },
  { id: 'story', label: 'Story' },
  { id: 'vision', label: 'Vision' },
];

export const about = {
  seo: {
    title: 'About DataGateways | From Industry Gaps to Intelligent Solutions',
    description:
      'Founded by professionals across Cyber Security, Data and Artificial Intelligence, DataGateways identifies meaningful industry gaps and turns them into practical, intelligent software solutions.',
  } satisfies SeoMeta,

  anchors: aboutAnchors,

  hero: {
    id: 'hero',
    eyebrow: 'About DataGateways',
    heading: { roman: 'Securing data', accent: 'Powering AI' } satisfies Heading,
    subhead: { roman: 'From industry gaps to', accent: 'intelligent solutions' } satisfies Heading,
    media: {
      poster: '/media/img-about.jpg',
      /* The shared clip, the same one every other hero runs, so the site keeps one moving
         identity. Drop a distinct hero-about.webm/.mp4 into assets/media and point this at it if
         the client ever supplies separate footage for this page. */
      sources: [
        { src: '/media/hero-home.webm', type: 'video/webm' },
        { src: '/media/hero-home.mp4', type: 'video/mp4' },
      ],
      generative: 'lattice' as const,
    },
  },

  /** The founding story, in concise paragraphs with the original milestones intact. */
  story: {
    id: 'story',
    eyebrow: 'Who we are',
    /* Split across the two inks like every other heading on the site. It was set entirely in the
       primary ink, which is the inconsistency the 19 Oct email is about — the words are the
       client's own either way. */
    heading: { roman: 'About', accent: 'us' } satisfies Heading,
    paragraphs: [
      flag.verified(
        'DataGateways was founded by practitioners in Cyber Security, Data and Artificial Intelligence. Their work exposed gaps in existing approaches to real-world technology challenges.',
      ),
      flag.verified(
        'Many enterprises manage data at rest and AI in motion separately, relying on spreadsheets to connect them. This can leave audits stalled, breaches undetected and AI use unsanctioned.',
      ),
      flag.verified(
        'We build software by understanding the problem first. DataGateways turns meaningful industry gaps into practical, intelligent solutions.',
      ),
    ],
  },

  /** The client's own vision statement, given a band of its own rather than a bullet. */
  vision: {
    id: 'vision',
    eyebrow: 'Our Vision',
    heading: { roman: 'Our', accent: 'Vision' } satisfies Heading,
    subhead: { roman: 'A safer, smarter,', accent: 'more intelligent digital world' } satisfies Heading,
    statement:
      'Turning critical gaps across Cyber Security, Data, Artificial Intelligence and Digital Intelligence into solutions for a safer, smarter world.',
    paragraphs: [
      'We envision frameworks where organizations can trust their data, strengthen their security, harness the power of AI, and transform digital information into actionable intelligence.',
      'Our ambition is to build a globally recognized portfolio of intelligent products that address complex challenges, create measurable business value and continuously evolve with the changing technology landscape.',
    ],
  },

} as const;

export type About = typeof about;
