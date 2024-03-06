import express, { Request, Response, } from 'express';
import { DeleteTeam, GetTeam, GetTeams, createTeam, updateTeam } from './teams-router.js';
import { GetGame, GetGames, createGame, deleteGame, updateGame } from './games-router.js';

export const apiRouter = express.Router();
export const teamsRouter = express.Router();
export const gamesRouter = express.Router();

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

teamsRouter.get('/', GetTeams);
teamsRouter.post('/', createTeam);
teamsRouter.get('/:slug', GetTeam);
teamsRouter.patch('/:slug', updateTeam);
teamsRouter.delete('/:slug', DeleteTeam);

gamesRouter.get('/', GetGames);
gamesRouter.post('/', createGame)
gamesRouter.get('/:id', GetGame);
gamesRouter.patch('/:id', updateGame);
gamesRouter.delete('/:id', deleteGame)