import { Team, Game, GameQuery } from "./types";

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
    potentialGame: GameQuery,
  ): Game | null {
    if (!potentialGame || !potentialGame.id || !potentialGame.date || !potentialGame.home_id || !potentialGame.away_id) {
      return null;
  }

  const mapped: Game = {
      id: potentialGame.id,
      date: potentialGame.date,
      home: {
          id: potentialGame.home_id,
          name: potentialGame.home_name,
          slug: potentialGame.home_slug,
          description: potentialGame.home_description,
      },
      away: {
          id: potentialGame.away_id,
          name: potentialGame.away_name,
          slug: potentialGame.away_slug,
          description: potentialGame.away_description,
      },
      home_score: potentialGame.home_score,
      away_score: potentialGame.away_score,
      created: potentialGame.created,
      updated: potentialGame.updated,
  };

  return mapped;
  }
  
  export function gamesMapper(
    potentialGames: GameQuery[],
  ): Array<Game> {
  
    if (!potentialGames) {
      return [];
    }
  
    const mapped = potentialGames.map((dept) => gameMapper(dept));
  
    return mapped.filter((i): i is Game => Boolean(i));
  }