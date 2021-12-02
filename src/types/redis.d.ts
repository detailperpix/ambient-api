declare namespace Redis {
    type Value = string | number | Record<any, any> | any[];
    type Subscriber = (channel: string, message: string) => any;
    type PSubscriber = (pattern: string, channel: string, message: string) => any;
}
