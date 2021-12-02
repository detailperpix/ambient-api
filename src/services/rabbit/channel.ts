import amqp from 'amqplib';
import config from 'config';
import logger from '@/logger';
import EventEmitter from 'events';
import RabbitConnection from './connection';

const log = logger('RABBIT CHA');
const rabbitConfig: Config.rabbitmq = config.get('rabbitmq');

class RabbitChannel extends EventEmitter {
    private channel?: amqp.Channel;
    private connection?: amqp.Connection;
    private connection_handler: RabbitConnection;
    private readonly consumers: Rabbit.Channel.Consumers;

    constructor(connection: RabbitConnection) {
        super();
        log.info('Creating new Channel');
        connection.on('connected', () => this.connect());
        this.connection_handler = connection;

        this.consumers = {};
        this.connect();
    }

    private async connect(): Promise<void> {
        try {
            this.connection = this.connection_handler.getConnection();
            const channel = await this.connection.createConfirmChannel();

            channel.once('error', (e) => this.reconnect(e.message));
            channel.once('close', (_) => this.reconnect('Channel closed'));

            for (const queue of Object.keys(this.consumers)) {
                this.consumers[queue].consumerTag = await this.consumers[queue].handler(channel);
            }

            log.info(`${Object.keys(this.consumers).length} consumers reconnected`);
            this.channel = channel;
            log.info('Channel connected');
        } catch (e) {
            if (e.message !== 'Connection not ready') return this.reconnect(e.message);
        }
    }

    private async reconnect(e: string): Promise<void> {
        log.error(e);
        try {
            await this.channel?.close();
        } catch (_) {}
        delete this.channel;
        setTimeout(() => this.connect(), rabbitConfig.chanReconInterval);
    }

    getConsumers(): string[] {
        return Object.keys(this.consumers);
    }

    async addConsumer(queue: string, consumer: Rabbit.Consumer): Promise<void> {
        if (this.consumers[queue]) throw new Error('Consumer on queue already exists');

        this.consumers[queue] = { handler: consumer, consumerTag: '' };

        // Starts consumer & saves consumerTag for stopping consumer
        this.consumers[queue].consumerTag = await consumer(this.getChannel());
        log.info(`Channel now consuming from queue ${queue}`);
    }

    async delConsumer(queue: string): Promise<void> {
        if (!this.consumers[queue]) throw new Error(`No consumer on queue ${queue}`);

        // Throws error if channel not ready
        await this.getChannel().cancel(this.consumers[queue].consumerTag);
        delete this.consumers[queue];
    }

    getChannel(): amqp.Channel {
        if (!this.channel) throw new Error('Channel not ready');
        return this.channel;
    }
}

export default RabbitChannel;
