import logger from '@/logger';
import match from 'mqtt-match';
import mqtt, { MqttClient, IClientOptions, IClientPublishOptions } from 'mqtt';

const log = logger('MQTT');

export default class MqttService {
    private retryCount = 0;
    private subscribers: Record<string, Mosquitto.Subscriber[]> = {};
    private readonly client: MqttClient;

    private readonly topicPrefix: string;

    constructor(
        host: string,
        port?: number,
        topicPrefix?: string,
        username?: string,
        password?: string,
        options?: IClientOptions
    ) {
        this.topicPrefix = topicPrefix ?? '';

        options ??= {
            will: {
                topic: this.topicPrefix + 'service-status/device-integrator',
                payload: 'offline',
                retain: true,
                qos: 0,
            },
        };

        const client = mqtt.connect(`mqtt://${host}`, {
            ...options,
            port,
            username,
            password,
        });

        client.on('connect', () => {
            log.info('Connected to broker');
            this.retryCount = 0;
            client.publish(this.topicPrefix + 'service-status/device-integrator', 'online', {
                retain: true,
                qos: 0,
            });

            const subscriptions = Object.keys(this.subscribers);
            if (subscriptions.length) {
                subscriptions.forEach((topic) => client.subscribe(topic));
                log.info(`Resumed subscriptions of ${subscriptions.length} topics`);
            }
        });

        client.on('error', (e) => log.error(e));

        client.on('close', () => {
            if (!(this.retryCount % 10))
                log.warn(
                    `Disconnected from broker ${this.retryCount > 0 ? `[${this.retryCount}]` : ''}`
                );
            this.retryCount++;
        });

        client.on('message', (topic, payload) => {
            log.debug('Incoming mqtt message', topic, payload.toString());
            const localTopic = topic.replace(this.topicPrefix, '');

            Object.entries(this.subscribers).forEach(([topicPattern, handlers]) => {
                if (match(localTopic, topicPattern))
                    handlers.forEach((handler) => handler(localTopic, payload.toString()));
            });
        });

        this.client = client;
    }

    subscribe(topic: string, handler: Mosquitto.Subscriber): void {
        this.client.subscribe(this.topicPrefix + topic);
        if (!this.subscribers[topic]) this.subscribers[topic] = [];

        this.subscribers[topic].push(handler);
    }

    publish(topic: string, payload: any, options: IClientPublishOptions = {}): void {
        topic = this.topicPrefix + topic;

        log.debug(`Publishing to topic ${topic} with options ${JSON.stringify(options)}`, payload);

        this.client.publish(
            topic,
            typeof payload === 'string' ? payload : JSON.stringify(payload),
            options
        );
    }
}
