import { Router } from 'express';
import { z } from 'zod';
import { ARTICLE_CATEGORIES, type Article, type ArticleListResponse } from '@datagateways/shared';

const querySchema = z.object({
  category: z.enum(['all', ...ARTICLE_CATEGORIES]).optional(),
});

export interface ResourcesDeps {
  articles: readonly Article[];
}

/**
 * Reads from a JSON file for now. The contract — filter by category, return `{articles, total}` —
 * is what a CMS would replace later, without the frontend noticing.
 */
export const resourcesRouter = ({ articles }: ResourcesDeps): Router => {
  const router = Router();

  router.get('/', (req, res) => {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      res.status(400).json({
        error: { code: 'invalid_query', message: 'Unknown category filter.' },
      });
      return;
    }

    const { category } = parsed.data;
    const filtered =
      category && category !== 'all'
        ? articles.filter((article) => article.category === category)
        : articles;

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

    res.json({ articles: sorted, total: sorted.length } satisfies ArticleListResponse);
  });

  return router;
};
