export type Team ={
    id: number;
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

