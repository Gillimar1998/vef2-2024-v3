import express, { Request, Response, NextFunction } from 'express';
import {Team } from '../lib/teams.js';
import { conditionalUpdate, deleteTeamBySlug, getGames, getTeams, getTeamsBySlug, insertTeam } from '../lib/db.js';
import slugify from 'slugify';
import { atLeastOneBodyValueValidator, genericSanitizer, stringValidator, teamDoesNotExistValidator, validationCheck, xssSanitizer } from '../lib/validation.js';
import { teamMapper } from '../lib/mapper.js';

export const gamesRouter = express.Router();

export async function GetGames(req: Request, res: Response) {
    const games = await getGames()

    return res.json(games);
}

gamesRouter.get('/', GetGames);