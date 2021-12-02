import IORedis from 'ioredis';
import logger, { Logger, LogLevel } from '@/logger';

export default class RedisService {
  readonly db: string;
  readonly namespace: string;

  private readonly log: Logger;
  private readonly client: IORedis.Redis;
  private readonly subscriber: IORedis.Redis;
  private readonly subscribers: { [channel: string]: Redis.Subscriber[] } = {};
  private readonly psubscribers: { [pattern: string]: Redis.PSubscriber[] } = {};

  constructor(options: IORedis.RedisOptions = {}, namespace = 'redis', logLevel: LogLevel = 'info') {
    this.namespace = namespace;
    this.log = logger('REDIS', namespace);
    this.log.setSettings({ minLevel: logLevel });

    this.client = new IORedis(options);
    this.subscriber = new IORedis(options);

    this.db = (this.client.options.db ?? 0).toString();

    this.subscriber.on('message', (channel, message) => {
      this.log.debug('message', { channel, message });
      this.subscribers[channel]?.forEach((subscriber) => subscriber(channel, message));
    });

    this.subscriber.on('pmessage', (pattern, channel, message) => {
      this.log.debug('pmessage', { pattern, channel, message });
      this.psubscribers[pattern]?.forEach((subscriber) => subscriber(pattern, channel, message));
    });

    this.client.config('SET', 'notify-keyspace-events', 'KEA').then(() => this.log.info('keyspace-events enabled'));
  }

  async keys(pattern: string): Promise<string[]> {
    return (await this.client.keys(pattern)) ?? [];
  }

  async set<T extends Json>(key: string, value: T): Promise<IORedis.Ok | null> {
    return this.client.set(key, JSON.stringify(value));
  }

  async get<T extends Json>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data == null ? null : JSON.parse(data);
  }

  async hkeys(key: string): Promise<string[]> {
    return (await this.client.hkeys(key)) ?? [];
  }

  async hset<T extends Json>(key: string, field: string, value: T): Promise<number> {
    return this.client.hset(key, field, JSON.stringify(value));
  }

  // Uses hset to perform multiple-set as hmset is no longer preferred https://redis.io/commands/HMSET
  async hmset<T extends Record<string, Json>>(key: string, values: T): Promise<number> {
    return this.client.hset(
        key,
        ...Object.entries(values)
            .map(([field, value]) => [field, JSON.stringify(value)])
            .flat()
    );
  }

  async hsetnx<T extends Json>(key: string, field: string, value: T): Promise<T> {
    const set = await this.client.hsetnx(key, field, JSON.stringify(value));
    return set ? value : (await this.hget(key, field))!;
  }

  async hget<T extends Json>(key: string, field: string): Promise<T | null> {
    const data = await this.client.hget(key, field);
    return data == null ? null : JSON.parse(data);
  }

  async hgetall<T extends Record<string, Json>>(key: string): Promise<T> {
    const data = (await this.client.hgetall(key)) ?? {};
    return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, JSON.parse(value)])) as T;
  }

  async hdel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  async hlen(key: string): Promise<number> {
    return this.client.hlen(key);
  }

  async del(...keys: string[]): Promise<number> {
    return this.client.del(keys);
  }

  async subscribe(channel: string, subscriber: Redis.Subscriber): Promise<void> {
    if (!this.subscribers[channel]) {
      this.subscribers[channel] = [];
      await this.subscriber.subscribe(channel);
    }

    this.subscribers[channel].push(subscriber);
  }

  unsubscribe(channel: string, subscriber: Redis.Subscriber): void {
    if (!this.subscribers[channel]) {
      this.log.warn(`Attempting to unsubscribe from unsubscribed channel ${channel}`);
      return;
    }

    const index = this.subscribers[channel].indexOf(subscriber);

    if (index === -1) this.log.error(`Subscriber not found in channel ${channel}`);
    else {
      this.subscribers[channel].splice(index, 1);
      this.subscriber.unsubscribe(channel).then(() => delete this.subscribers[channel]);
    }
  }

  async psubscribe(pattern: string, subscriber: Redis.PSubscriber): Promise<void> {
    if (!this.psubscribers[pattern]) {
      this.psubscribers[pattern] = [];
      await this.subscriber.psubscribe(pattern);
    }

    this.psubscribers[pattern].push(subscriber);
  }

  punsubscribe(pattern: string, subscriber: Redis.PSubscriber): void {
    if (!this.psubscribers[pattern]) {
      this.log.warn(`Attempting to punsubscribe from unsubscribed pattern ${pattern}`);
      return;
    }

    const index = this.psubscribers[pattern].indexOf(subscriber);

    if (index === -1) this.log.error(`PSubscriber not found in pattern ${pattern}`);
    else {
      this.psubscribers[pattern].splice(index, 1);
      if (!this.psubscribers[pattern].length) {
        this.subscriber.punsubscribe(pattern).then(() => delete this.psubscribers[pattern]);
      }
    }
  }
}
