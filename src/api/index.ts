import express from 'express';
import testRouter from '@/api/components/test';

const api = express.Router();

api.use('/test', testRouter);

export default api;
