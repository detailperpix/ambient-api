import cors from 'cors';
import api from '@/api';
import config from 'config';
import express from 'express';
import logger from '@/logger';
import listEndpoints from 'express-list-endpoints';

const { port } = config.get<Config.api>('api');

const log = logger('LOADER', 'API');
log.setSettings({ minLevel: 'info' });

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    log.debug(`Incoming request ${req.method} ${req.path} from ${req.ip}`);
    next();
});
app.use('/', api);

app.listen(port, () => {
    log.info(`API Server started @ port ${port}`);
    log.debug('Listening to routes', listEndpoints(app));
});
