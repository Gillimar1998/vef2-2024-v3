import { Team, Game } from "./teams";

export function teamMapper(
    potentialTeam: unknown,
  ): Team | null {
    const team = potentialTeam as Partial<Team> | null;
  
    if (!team || !team.id || !team.name || !team.slug) {
      return null;
    }
  
  
    const mapped: Team = {
      id: team.id,
      name: team.name,
      slug: team.slug,
      description: team.description ?? undefined,
    };
  
    return mapped;
  }
  export function teamsMapper(
    potentialTeams: unknown,
  ): Array<Team> {
    const teams = potentialTeams as Array<unknown> | null;
  
    if (!teams) {
      return [];
    }
  
    const mapped = teams.map((dept) => teamMapper(dept));
  
    return mapped.filter((i): i is Team => Boolean(i));
  }


  export function gameMapper(
    potentialGame: unknown,
  ): Game | null {
    const game = potentialGame as Partial<Game> | null;
  
    if (!game || !game.date || !game.home || !game.away || !game.home_score || !game.away_score) {
      return null;
    }
  
  
    const mapped: Game = {
      date: game.date,
      home: game.home,
      away: game.away,
      home_score: game.home_score,
      away_score: game.away_score
    };
  
    return mapped;
  }
  
  export function gamesMapper(
    potentialGames: unknown,
  ): Array<Game> {
    const games = potentialGames as Array<unknown> | null;
  
    if (!games) {
      return [];
    }
  
    const mapped = games.map((dept) => gameMapper(dept));
  
    return mapped.filter((i): i is Game => Boolean(i));
  }