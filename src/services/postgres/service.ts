import pg from 'pg';
import config from 'config';

const postgresClient = new pg.Client(config.get<Config.postgres>('postgres'));

// Type setters
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);

export default postgresClient;

export async function initPostgres(): Promise<void> {
    return postgresClient.connect();
}
