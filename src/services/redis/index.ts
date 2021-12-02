import config from 'config';
import RedisService from './service';

const {
    host = 'localhost',
    port = 6379,
    db = 0,
    namespace = 'root',
} = config.get<Config.redis>('redis');

const redis = new RedisService({ host, port, db }, namespace);

export default redis;
