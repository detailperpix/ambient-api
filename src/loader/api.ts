import cors from 'cors';
import api from '@/api';
import config from 'config';
import express from 'express';
import logger from '@/logger';
import listEndpoints from 'express-list-endpoints';
import http from 'http';

import { Server } from 'socket.io';

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

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:8080',
        methods: ['GET'],
        allowedHeaders: ['custom-header'],
        credentials: true,
    },
});
io.on('connection', (socket) => {
    log.info('Socket.io - Client connected');
    socket.on('newdata', (msg) => {
        log.info('Received event from client.');
        io.emit('newdata', msg);
    });
});

server.listen(port, () => {
    log.info(`API Server started @ port ${port}`);
    log.debug('Listening to routes', listEndpoints(app));
});

// not used, provide listener implemenetation above instead of in another module
app.set('socketio', io);
