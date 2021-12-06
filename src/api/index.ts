import express from 'express';
import testRouter from '@/api/components/test';
import queryData from './query';

const api = express.Router();

api.use('/test', testRouter);
api.get(
    '/ambient-device-:id/:start/:stop',
    function (req, res, next) {
        console.log('Request ID: ', req.params.id);
        next();
    },
    function (req, res, next) {
        queryData(req.params.id, '', Number(req.params.start), Number(req.params.stop), res);
    }
);
api.get(
    '/ambient-device-:id/:type/',
    function (req, res, next) {
        console.log('Request ID:', req.params.id);
        console.log('Request measurement type:', req.params.type);

        next();
    },
    function (req, res, next) {
        console.log('Request Type:', req.method);
        queryData(req.params.id, req.params.type, Date.now() - 3 * 3600 * 1000, Date.now(), res);
    }
);

api.get(
    '/ambient-device-:id/:type/:start/:stop',
    function (req, res, next) {
        console.log('Request ID:', req.params.id);
        console.log('Request measurement type:', req.params.type);

        next();
    },
    function (req, res, next) {
        console.log('Request Type:', req.method);
        console.log('Request start time: ', req.params.start);
        console.log('Request stop time ', req.params.stop);
        queryData(
            req.params.id,
            req.params.type,
            Number(req.params.start),
            Number(req.params.stop),
            res
        );
    }
);
export default api;
