import express from 'express';
import * as controller from './controller';

const testRouter = express.Router();

testRouter.get('/', controller.health);

export default testRouter;
