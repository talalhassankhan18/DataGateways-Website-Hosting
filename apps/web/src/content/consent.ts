/**
 * Cookie-consent copy.
 *
 * Here rather than in the component for the usual reason — no user-visible string belongs in
 * JSX — and for one specific to this banner: consent copy is the part of the site most likely to
 * come back from a lawyer with wording changes, and it should be editable without opening a
 * component.
 *
 * The wording is deliberately plain. "We use cookies to enhance your experience" describes
 * nothing; a visitor cannot consent to a purpose they have not been told. This says who, what
 * for, and what refusing costs them, which is nothing.
 */
export const consent = {
  banner: {
    /** Labels the region for assistive tech, and is announced when the banner appears. */
    landmark: 'Cookie consent',

    heading: {
      roman: 'Before you',
      accent: 'carry on',
    },

    body:
      'We would like to use Google Analytics to count visits and see which pages are read. It sets ' +
      'cookies in your browser. Nothing is shared with advertisers, and the site works exactly the ' +
      'same if you decline.',

    /* "Accept cookies", not "Accept analytics": the visitor is being asked to allow something
       stored on their device, and that is the word they recognise from every other banner. The
       body above still names Google Analytics, which is the transparency the GDPR actually
       wants — the button is the decision, the body is the disclosure. */
    accept: 'Accept cookies',
    reject: 'Decline',

    /** Sits under the buttons, pointing at the page that describes the cookies in full. */
    policyPrefix: 'More in our',
    policyLabel: 'Privacy Policy',
    policyHref: '/privacy',
  },

  /**
   * The footer control. GDPR Article 7(3) requires withdrawing consent to be as easy as giving it,
   * which means a permanent, findable control — not a banner that never returns once dismissed.
   */
  settings: {
    label: 'Cookie settings',
    /* Announced politely after the footer link is used, because the only visible result is a
       banner appearing at the other end of the page, which a screen-reader user would not
       otherwise know about. */
    reopened: 'Cookie choices opened. Accept or decline below.',
  },

  /** Shown in place of the banner's buttons when the browser sends Global Privacy Control. */
  globalPrivacyControl: {
    label: 'Global Privacy Control',
    body: 'Your browser is sending a Global Privacy Control signal, so analytics stays off. We have not asked you to choose.',
  },
} as const;

export type Consent = typeof consent;
