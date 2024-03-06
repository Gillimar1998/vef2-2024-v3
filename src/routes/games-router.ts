import express, { Request, Response, NextFunction } from 'express';
import {GameQuery, Team } from '../lib/teams.js';
import { conditionalUpdate, deleteTeamBySlug, getGameByID, getGames, getTeams, getTeamsBySlug, insertGame, insertTeam } from '../lib/db.js';
import slugify from 'slugify';
import { atLeastOneBodyValueValidator, dateValidator, genericSanitizer, idValidator, scoreValidator, skraValidation, stringValidator, teamDoesNotExistValidator, validationCheck, xssSanitizer } from '../lib/validation.js';
import { teamMapper } from '../lib/mapper.js';

export const gamesRouter = express.Router();

export async function GetGames(req: Request, res: Response, next:NextFunction) {
    const games = await getGames()

    if(!games){
        return next();
    }

    return res.json(games);
}

export async function GetGame(req: Request, res: Response, next:NextFunction) {
    const { id } = req.params;
  
    const game = await getGameByID(id);
  
    if(!game){
        return res.status(404).json({ message: "Game not found" });
    }
  
    return res.json(game);
}

export const createGame=[
    dateValidator({
        field: 'date'
    }),
    scoreValidator({
        field: 'home_score'
    }),
    scoreValidator({
        field: 'away_score'
    }),
    idValidator({
        field:'home'
    }),
    idValidator({
        field:'away'
    }),
    validationCheck,
    createGameHandler,
];

export async function createGameHandler(req: Request, res:Response, next:NextFunction){
    const {date, home, away, home_score, away_score} = req.body;

    console.log('home = ' + home + ' og away= ' + away)

    const gameToCreate: Omit<GameQuery,
     'id' | 
     'home_name' | 
     'home_slug' | 
     'home_description' | 
     'away_name' | 
     'away_slug' | 
     'away_description' | 
     'created' | 
     'updated'>={
        date,
        home_id : home,
        away_id : away,
        home_score,
        away_score
    }
    console.log('gametocreate ' + gameToCreate)
    const createdGame = await insertGame(gameToCreate, false)

    if(!createdGame){
        return next(new Error('unable to create game'))
    }

    return res.status(201).json(createdGame)
}


gamesRouter.get('/', GetGames);
gamesRouter.post('/', createGame)
gamesRouter.get('/:id', GetGame);