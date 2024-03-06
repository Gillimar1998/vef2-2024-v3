import pg from 'pg';
import { Team, Game, GameQuery } from './types.js';
import { gameMapper, gamesMapper, teamMapper, teamsMapper } from './mapper.js';

let savedPool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (savedPool) {
    return savedPool;
  }

  const { DATABASE_URL: connectionString } = process.env;
  if (!connectionString) {
    console.error('vantar DATABASE_URL í .env');
    throw new Error('missing DATABASE_URL');
  }

  savedPool = new pg.Pool({ connectionString });

  savedPool.on('error', (err:Error) => {
    console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
    throw new Error('error in db connection');
  });

  return savedPool;
}

export async function query(
  q: string,
  values: Array<unknown> = [],
  silent = false,
) {
  const pool = getPool();

  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    if (!silent) console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    if (!silent) console.error('unable to query', e);
    if (!silent) console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function conditionalUpdate(
  table: 'teams' | 'games',
  id: number,
  fields: Array<string | null>,
  values: Array<string | number | Date| null>,
) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i): i is string | number | Date => typeof i === 'string' || typeof i === 'number' || i instanceof Date
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues: Array<string | number | Date> = (
    [id] as Array<string | number | Date>
  ).concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}

export async function poolEnd() {
  const pool = getPool();
  await pool.end();
}

export async function getTeams(): Promise<Array<Team> | null> {
  const result = await query('SELECT * FROM teams');

  if (!result) {
    return null;
  }

  const teams = teamsMapper(result.rows).map((d) => {
    return d;
  });

  return teams;
}
export async function getGames(): Promise<Array<Game> | null> {

  const queryText = `
  SELECT g.id, 
       g.date, 
       home_team.id AS home_id, home_team.name AS home_name, home_team.slug AS home_slug, home_team.description AS home_description,
       away_team.id AS away_id, away_team.name AS away_name, away_team.slug AS away_slug, away_team.description AS away_description,
       g.home_score, 
       g.away_score, 
       g.created, 
       g.updated
FROM games g
JOIN teams home_team ON g.home = home_team.id
JOIN teams away_team ON g.away = away_team.id
ORDER BY g.date;
`;

  const result = await query(queryText);

  if (!result) {
    return null;
  }

  const games = gamesMapper(result.rows).map((d) => {
    return d;
  });

  return games;
}
export async function getGameByID(
  id: string,
): Promise<Game | null> {

  const queryText = `
  SELECT g.id, 
       g.date, 
       home_team.id AS home_id, home_team.name AS home_name, home_team.slug AS home_slug, home_team.description AS home_description,
       away_team.id AS away_id, away_team.name AS away_name, away_team.slug AS away_slug, away_team.description AS away_description,
       g.home_score, 
       g.away_score, 
       g.created, 
       g.updated
FROM games g
JOIN teams home_team ON g.home = home_team.id
JOIN teams away_team ON g.away = away_team.id
WHERE g.id = $1
ORDER BY g.date;
`;
  const result = await query(queryText, [
    id,
  ]);

  if (!result) {
    return null;
  }

  const game = gameMapper(result.rows[0]);

  return game;
}

export async function getTeamsBySlug(
  slug: string,
): Promise<Team | null> {
  const result = await query('SELECT * FROM teams WHERE slug = $1', [
    slug,
  ]);

  if (!result) {
    return null;
  }

  const team = teamMapper(result.rows[0]);

  return team;
}

export async function insertGame(
  Game: Omit<GameQuery, 'id' | 'home_name' | 'home_slug' | 'home_description' | 'away_name' | 'away_slug' | 'away_description' | 'created' | 'updated'>,
  silent = false,
): Promise<Game | null> {
  const { date, home_id, away_id, home_score, away_score,} = Game;
  console.log({ date, home_id, away_id, home_score, away_score });
  const result = await query(
    'INSERT INTO games (date, home, away, home_score, away_score) VALUES ($1, $2, $3, $4, $5) RETURNING id ',
    [date, home_id, away_id, home_score, away_score],
    silent,
  );
  if(result?.rows.length === 0){
    throw new Error('Game insertion failed')
  }

  const gameID = result?.rows[0].id;
  const game = await getGameByID(gameID.toString());

  return game;
}

export async function insertTeam(
  Team: Omit<Team, 'id'>,
  silent = false,
): Promise<Team | null> {
  const { name, slug, description } = Team;
  const result = await query(
    'INSERT INTO teams (name, slug, description) VALUES ($1, $2, $3) RETURNING id, name, slug, description',
    [name, slug, description],
    silent,
  );

  const mapped = teamMapper(result?.rows[0]);

  return mapped;
}

export async function deleteTeamBySlug(slug: string): Promise<boolean> {
  const result = await query('DELETE FROM teams WHERE slug = $1', [slug]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function deleteGameByID(id :string):Promise<boolean> {
  const result = await query('DELETE FROM games WHERE id = $1', [id]);

  if (!result) {
    return false;
  }

  return result.rowCount === 1;
}

export async function checkTeamExists(id:number): Promise<boolean> {
  const queryText = 'SELECT id FROM teams WHERE id = $1';
  const result = await query(queryText, [id]);

  if(!result){
    return false;
  }

  return result.rows.length > 0;
}