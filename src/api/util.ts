export function success<ResBody>(
    response: API.Response<ResBody>,
    data?: ResBody,
    message = 'ok',
    code = 200
): void {
    // @ts-ignore
    response.status(code).send({
        result: true,
        message,
        data,
    });
}

export function failure(response: API.Response, message: any = 'WIP', code = 400): void {
    response.status(code).send({
        result: false,
        message,
    });
}
