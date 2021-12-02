export namespace Health {
    type Request = API.Request<never, never, { response?: string }>;

    type Response = API.Response<{ response: string }>;
}
