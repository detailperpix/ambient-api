import e from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

type JSON = Record<string, any>;

declare global {
    namespace API {
        interface Request<
            Params = ParamsDictionary,
            ResBody extends JSON = any,
            ReqBody extends JSON = any,
            ReqQuery = Query,
            Locals extends JSON = JSON
        > extends e.Request<Params, ResBody, ReqBody, ReqQuery, Locals> {}

        interface Response<ResBody extends JSON = any, Locals extends JSON = any>
            extends e.Response<ResBody, Locals> {}
    }
}
