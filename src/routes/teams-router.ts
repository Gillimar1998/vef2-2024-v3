import express, { Request, Response, NextFunction } from 'express';
import { getTeams } from '../lib/teams.js';
export const teamsRouter = express.Router();

export async function GetTeams(req: Request, res: Response) {
    const teams = getTeams()

    return res.json(teams);
}

export async function PostTeams(req: Request, res: Response) {
    const teams = getTeams()

    return res.json(teams);
}

export async function GetTeam(req: Request, res: Response) {
  const teams = getTeams()

  return res.json(teams);
}

export async function UpdateTeam(req: Request, res: Response) {
  const teams = getTeams()

  return res.json(teams);
}

export async function DeleteTeam(req: Request, res: Response) {
  const teams = getTeams()

  return res.json(teams);
}



teamsRouter.get('/', GetTeams);
teamsRouter.post('/', PostTeams);
teamsRouter.get('/:slug', GetTeam);
teamsRouter.patch('/:slug', UpdateTeam);
teamsRouter.delete('/:slug', DeleteTeam);
