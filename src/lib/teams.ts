export type Team ={
    id: number;
    name: string;
    slug: string;
    description?: string;
}

export type Game = {
    id: number;
    date: Date;
    home: Team;
    away: Team;
    home_score: number;
    away_score: number;
    created: Date;
    updated: Date;
}

export type GameQuery = {
    id: number;
    date: Date;
    home_id: number;
    home_name: string;
    home_slug: string;
    home_description?: string;
    away_id: number;
    away_name: string;
    away_slug: string;
    away_description?: string;
    home_score: number;
    away_score: number;
    created: Date;
    updated: Date;
};

