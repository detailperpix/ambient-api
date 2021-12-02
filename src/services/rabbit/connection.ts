import amqp from 'amqplib';
import config from 'config';
import logger from '@/logger';
import EventEmitter from 'events';

const log = logger('RABBIT CON');
const rabbitConfig: Config.rabbitmq = config.get('rabbitmq');

class RabbitConnection extends EventEmitter {
    private connection?: amqp.Connection;

    constructor() {
        super();
        this.connect().then(() => log.info('Connection initialised'));
    }

    private async connect(): Promise<void> {
        try {
            const connection = await amqp.connect(rabbitConfig.config);

            connection.once('error', (e) => {
                if (e.message !== 'Rabbitmq connection closing')
                    this.reconnect(`Connection Error ${e.message}`);
            });

            connection.once('close', () =>
                this.reconnect('Connection closed, attempting to reconnect...')
            );

            log.info('Connection established');
            this.connection = connection;
            this.emit('connected');
        } catch (e) {
            return this.reconnect(e.message);
        }
    }

    private async reconnect(e: string): Promise<void> {
        log.error(e);
        try {
            await this.connection?.close();
        } catch (_) {}
        delete this.connection;
        setTimeout(() => this.connect(), rabbitConfig.connReconInterval);
    }

    getConnection(): amqp.Connection {
        if (!this.connection) throw new Error('Connection not ready');
        return this.connection;
    }
}

export default RabbitConnection;
