import express, { Request, Response, NextFunction } from 'express';
import { teamsRouter } from './teams-router.js';
import { gamesRouter } from './games-router.js';
export const apiRouter = express.Router();


export async function indexRoute(req: Request, res: Response) {
    const data = [
        {
          href: '/teams',
          methods: ['GET', 'POST'],
        },
        {
          href: '/teams/:slug',
          methods: ['GET', 'PATCH', 'DELETE'],
        },
        {
          href: '/games',
          methods: ['GET', 'POST'],
        },
        {
          href: '/games/:slug',
          methods: ['GET', 'PATCH', 'DELETE'],
        },
      ];

    return res.json(data);
  }


apiRouter.get('/', indexRoute);
apiRouter.use('/teams', teamsRouter);
apiRouter.use('/games', gamesRouter);
