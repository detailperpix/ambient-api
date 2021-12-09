import logger from '@/logger';
import { subscribeHost } from '@/api/insert';

export default async function (): Promise<void> {
    const log = logger('LOADER');

    await import('./api');
    log.info('API loaded');

    subscribeHost();
}
