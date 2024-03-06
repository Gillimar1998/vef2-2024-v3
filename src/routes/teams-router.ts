import express, { Request, Response, NextFunction } from 'express';
import {Team } from '../lib/teams.js';
import { conditionalUpdate, deleteTeamBySlug, getTeams, getTeamsBySlug, insertTeam } from '../lib/db.js';
import slugify from 'slugify';
import { atLeastOneBodyValueValidator, genericSanitizer, stringValidator, teamDoesNotExistValidator, validationCheck, xssSanitizer } from '../lib/validation.js';
import { teamMapper } from '../lib/mapper.js';

export const teamsRouter = express.Router();

export async function GetTeams(req: Request, res: Response, next:NextFunction) {
    const teams = await getTeams()

    if(!teams){
      return next();
    }

    return res.json(teams);
}

export async function GetTeam(req: Request, res: Response, next:NextFunction) {
  const { slug } = req.params;

  const team = await getTeamsBySlug(slug);

  if(!team){
    return next();
  }

  return res.json(team);
}

export async function createTeamHandler(req: Request, res:Response, next:NextFunction) {

  const {name, description} = req.body;

  const teamToCreate: Omit<Team ,'id'> = {
    name,
    slug: slugify(name, { lower: true }),
    description
  }
  const createdTeam = await insertTeam(teamToCreate, false);
  
  if (!createdTeam){
    return next(new Error('unable to create team'));
  }

  return res.status(201).json(createdTeam);
}

export const createTeam = [
  stringValidator({ 
    field: 'name', 
    maxLength: 128 }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1024,
  }),
  teamDoesNotExistValidator,
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  genericSanitizer('name'),
  genericSanitizer('description'),
  createTeamHandler,
];

export const updateTeam = [
  stringValidator({ 
    field: 'name', 
    maxLength: 128,
   optional: true 
  }),
  stringValidator({
    field: 'description',
    valueRequired: false,
    maxLength: 1024,
    optional: true 
  }),
  atLeastOneBodyValueValidator(['name', 'description']),
  xssSanitizer('name'),
  xssSanitizer('description'),
  validationCheck,
  updateTeamHandler,
];

export async function updateTeamHandler(req: Request, res:Response, next:NextFunction) {
  console.log('teamhandler');

  const {slug} = req.params;
  console.log('slug', slug);

  const team = await getTeamsBySlug(slug);
  console.log('team', team);
  
  if (!team){
    console.log('team not found exiting');
    return next();
  }

  const {name, description} = req.body;

  console.log('name', name, 'desc', description);

  const fields = [
    typeof name === 'string' && name ? 'name' : null,
    typeof name === 'string' && name ? 'slug' : null,
    typeof description === 'string' && description ? 'description' : null,
  ];
  console.log('fields', fields);

  const values = [
    typeof name === 'string' && name ? name : null,
    typeof name === 'string' && name ? slugify(name).toLowerCase() : null,
    typeof description === 'string' && description ? description : null,
  ];
  console.log('value', values);

  const updated = await conditionalUpdate(
    'teams',
    team.id,
    fields,
    values,
  );

  console.log('updated', updated);
  if(!updated){
    return next(new Error('unable to update team'))
  }

  const updatedTeam = teamMapper(updated.rows[0])
  return res.status(200).json(updatedTeam);
}

export async function DeleteTeam(req: Request, res: Response, next: NextFunction) {
  const { slug } = req.params;
  const team = await getTeamsBySlug(slug);

  if(!team){
    return next();
  }

  const result = await deleteTeamBySlug(slug);

  if(!result){
    return next(new Error('unable to delete team'));
  }

  return res.status(204).json({});
}



teamsRouter.get('/', GetTeams);
teamsRouter.post('/', createTeam);
teamsRouter.get('/:slug', GetTeam);
teamsRouter.patch('/:slug', updateTeam);
teamsRouter.delete('/:slug', DeleteTeam);
