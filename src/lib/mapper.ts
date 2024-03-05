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