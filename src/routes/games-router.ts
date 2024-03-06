import express, { Request, Response, NextFunction } from 'express';
import {GameQuery, Team } from '../lib/teams.js';
import { conditionalUpdate, deleteTeamBySlug, getGameByID, getGames, getTeams, getTeamsBySlug, insertGame, insertTeam } from '../lib/db.js';
import slugify from 'slugify';
import { atLeastOneBodyValueValidator, dateValidator, genericSanitizer, idValidator, notSameTeamValidator, scoreValidator, stringValidator, teamDoesNotExistValidator, validationCheck, xssSanitizer } from '../lib/validation.js';
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
    notSameTeamValidator('home', 'away', 'Heima og útilið mega ekki vera það sama'),
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
export const updateGame=[
    dateValidator({
        field: 'date',
        optional:true
    }),
    scoreValidator({
        field: 'home_score',
        optional:true
    }),
    scoreValidator({
        field: 'away_score',
        optional:true
    }),
    idValidator({
        field:'home',
        optional:true
    }),
    idValidator({
        field:'away',
        optional:true
    }),
    atLeastOneBodyValueValidator(['date', 'home_score', 'away_score', 'home', 'away']),
    validationCheck,
    updateGameHandler,
]

export async function updateGameHandler(req: Request, res:Response, next:NextFunction) {
    const{id} = req.params

    const game = await getGameByID(id);

    if(!game){
        return res.status(404).json({ message: "Game not found" });
    }

    const{date, home, away, home_score, away_score} = req.body
    

    const newHome = home || game.home;
    const newAway = away || game.away;

    if(newHome === newAway){
        return res.status(400).json({ message: "Heima og útilið mega ekki vera það sama" });
    }

    
  const parsedDate = date ? new Date(date) : null;
 
  const isDateValid = parsedDate && !isNaN(parsedDate.getTime());

  const fields = [
    isDateValid ? 'date' : null,
    typeof home === 'number' ? 'home' : null,
    typeof away === 'number' ? 'away' : null,
    typeof home_score === 'number' ? 'home_score' : null,
    typeof away_score === 'number' ? 'away_score' : null,
    'updated',
  ]

  const values = [
    isDateValid ? parsedDate : null,
    typeof home === 'number' ? home : null,
    typeof away === 'number' ? away : null,
    typeof home_score === 'number' ? home_score : null,
    typeof away_score === 'number' ? away_score : null,
    new Date(),
  ]


  if (fields.length === 0) {
    return res.status(400).json({ message: "No valid fields provided for update" });
  }



  const updated = await conditionalUpdate('games', game.id, fields, values);

  if (!updated) {
    throw new Error('Update operation failed');
  }

  const updatedGame = await getGameByID(id);
return res.status(200).json(updatedGame);

}


gamesRouter.get('/', GetGames);
gamesRouter.post('/', createGame)
gamesRouter.get('/:id', GetGame);
gamesRouter.patch('/:id', updateGame);