import logger from '@/logger';

export default async function (): Promise<void> {
    const log = logger('LOADER');

    await import('./api');
    log.info('API loaded');
}
