export type Team ={
    id?: number;
    name: string;
    slug: string;
    description?: string;
}

export type Game = {
    date: Date;
    home: Team;
    away: Team;
    home_score: number;
    away_score: number;
}
/*
export function getTeams(): Team[] {
    return [];
}*/

export function getTeam(slug: string): Team {
    return {
        name: 'temp',
        slug
    };
}