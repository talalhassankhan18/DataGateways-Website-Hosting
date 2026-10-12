export const ARTICLE_CATEGORIES = ['briefing', 'guide', 'release-note', 'press'] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export const isArticleCategory = (value: unknown): value is ArticleCategory =>
  typeof value === 'string' && (ARTICLE_CATEGORIES as readonly string[]).includes(value);

export interface Article {
  readonly slug: string;
  /** ISO 8601 date. */
  readonly date: string;
  readonly category: ArticleCategory;
  readonly headline: string;
  readonly caption: string;
  readonly href: string;
}

export interface ArticleListResponse {
  readonly articles: readonly Article[];
  readonly total: number;
}

/**
 * The copy deck cuts the Resources page if fewer than four real articles exist at launch.
 * The feature flag in site config is the switch; this is the threshold behind the decision.
 */
export const RESOURCES_MIN_ARTICLES = 4;
