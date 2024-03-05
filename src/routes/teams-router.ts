import express, { Request, Response, NextFunction } from 'express';
import { getTeams, Team } from '../lib/teams.js';
export const teamsRouter = express.Router();

export async function GetTeams(req: Request, res: Response) {
    const teams = getTeams()

    return res.json(teams);
}

export async function createTeamHandler(req: Request, res:Response, next:NextFunction) {

  const {name, description} = req.body;

  const teamToCreate: Omit<Team ,'id'> = {
    name,
    slug: 'slugify(title)',
    description,
  }
  /* const createdTeam = await insertTeam(teamToCreate, false);
  
  if (!createdTeam){
    return next(new Error('unable to create team'));
  }

  return res.status(201).json(createdTeam);
  */
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
