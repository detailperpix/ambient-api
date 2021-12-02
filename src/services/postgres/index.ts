import type { QueryConfig } from 'pg';

import logger from '@/logger';
import postgresClient from './service';

const log = logger('POSTGRES');
log.setSettings({ minLevel: 'debug' });

export async function query<T>(query: string | QueryConfig, values?: any[]): Promise<T[]> {
    try {
        return (await postgresClient.query(query, values)).rows ?? [];
    } catch (e) {
        log.error(query, e);
        throw e;
    }
}
