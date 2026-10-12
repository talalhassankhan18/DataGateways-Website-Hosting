import { Router } from 'express';

export const healthRouter = (version: string): Router => {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      version,
      uptime: Math.round(process.uptime()),
    });
  });

  return router;
};
