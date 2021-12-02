import 'module-alias/register';
import dotenv from 'dotenv';
import logger from '@/logger';
import loader from '@/loader';

dotenv.config();
const log = logger('APP');

log.info('Initializing loaders');
loader().then(() => log.info('Loaders completed'));
