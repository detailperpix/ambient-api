import express from 'express';
import testRouter from '@/api/components/test';
import queryData from './query';
import logger from '@/logger';

const api = express.Router();
const log = logger('API');

api.use('/test', testRouter);
api.get(
    '/ambient-device-:id/:type/',
    function (req, res, next) {
        log.info('Request Type:', req.method);
        log.info('Request ID:', req.params.id);
        log.info('Request measurement type:', req.params.type);
        next();
    },
    function (req, res, next) {
        queryData(req.params.id, req.params.type, Date.now() - 3 * 3600 * 1000, Date.now(), res);
    }
);

api.get(
    // query with given fields and starting & stopping time
    '/ambient-device-:id/:type/:start/:stop',
    function (req, res, next) {
        log.info('Request Type:', req.method);
        log.info('Request start time: ', req.params.start);
        log.info('Request stop time ', req.params.stop);
        log.info('Request ID:', req.params.id);
        log.info('Request measurement type:', req.params.type);

        next();
    },
    function (req, res, next) {
        queryData(
            req.params.id,
            req.params.type,
            Number(req.params.start),
            Number(req.params.stop),
            res
        );
    }
);

api.get(
    // query for latest data, given a starting point
    '/ambient-device-:id/:type/:start',
    function (req, res, next) {
        queryData(req.params.id, req.params.type, Number(req.params.start), Date.now(), res);
    }
);
export default api;
