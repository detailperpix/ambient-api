import uuid from 'uuid';
import amqp from 'amqplib';
import config from 'config';
import logger from '@/logger';
import EventEmitter from 'events';
import RabbitChannel from './channel';
import RabbitConnection from './connection';

const {
    queues: { rpc_response: replyTo },
    rpcTimeout = 1000,
}: Config.rabbitmq = config.get('rabbitmq');
const defaultConnection = new RabbitConnection();
const defaultChannel = new RabbitChannel(defaultConnection);

// RPC
const rpc_handler = replyTo ? new EventEmitter() : undefined;
if (rpc_handler) {
    const log = logger('RABBIT RPC');
    log.info('Initialising RPC Handler...');

    async function rpcHandler(channel: amqp.Channel): Promise<void> {
        await channel.assertQueue(replyTo, { durable: true });

        channel
            .consume(
                replyTo,
                (msg) => {
                    rpc_handler!.emit(msg?.properties.correlationId, msg);
                },
                { noAck: true }
            )
            .then(() => log.info('RPC Handler connected'));
    }

    // Add RPC Handler to channel reconnection handler
    defaultChannel.addConsumer('rpc', rpcHandler).catch(log.warn);
    // Channel possibly not yet ready; Handler will be added by channel reconnection logic when channel is available
} else logger('RABBIT RPC').info('No RPC Configs found; RPC Handler not initialised');

export function consume(
    queue: string,
    handler: Rabbit.MessageHandler,
    options: amqp.Options.Consume = {},
    channel = defaultChannel
): string {
    async function consumeHandler(channel: amqp.Channel): Promise<string> {
        await channel.assertQueue(queue, { durable: true });

        const { consumerTag } = await channel.consume(
            queue,
            async (msg) => {
                try {
                    const reply = await handler(msg!);
                    const { replyTo, correlationId } = msg?.properties ?? {};

                    // Reply to reply queue if designated
                    if (replyTo)
                        channel.sendToQueue(
                            replyTo,
                            Buffer.from(reply || 'No reply from handler'),
                            { correlationId }
                        );

                    // Acks message if Ack required
                    if (!options.noAck && msg) channel.ack(msg);
                } catch (e) {
                    // NAcks message if Ack required
                    if (!options.noAck && msg) channel.nack(msg);
                }
            },
            options
        );
        return consumerTag;
    }

    channel
        .addConsumer(queue, consumeHandler)
        .then(() => logger('RABBIT SUB').info(`Consumer on queue ${queue} initialised`))
        .catch((e) => logger('RABBIT SUB').error(e));
    // Channel possibly not yet ready; Handler will be added by channel reconnection logic when channel is available

    return queue;
}

export async function send(
    queue: string,
    msg: string,
    options: amqp.Options.Publish = {},
    channel = defaultChannel
): Promise<void> {
    try {
        const t_channel = channel.getChannel();
        await t_channel.assertQueue(queue, { durable: true });

        t_channel.sendToQueue(queue, Buffer.from(msg), options);
    } catch (e) {
        // Channel not yet ready; Throws error for parent function to deal with
        logger('RABBIT PUB').error(e);
        throw e;
    }
}

export async function sendReply(
    queue: string,
    msg: string,
    timeout: number = rpcTimeout,
    options: amqp.Options.Publish = {},
    channel = defaultChannel
): Promise<string> {
    if (!rpc_handler) throw new Error('No RPC Queues defined in config! RPC Not available');

    const correlationId = uuid.v4(),
        rpcOptions = { correlationId, replyTo },
        sendOptions = Object.keys(options).length ? Object.assign(rpcOptions, options) : rpcOptions;

    // Throws error if channel not ready
    await send(queue, msg, sendOptions, channel);

    return new Promise<string>((resolve, reject) => {
        rpc_handler.once(correlationId, (msg: amqp.ConsumeMessage) =>
            resolve(msg.content.toString())
        );
        setTimeout(() => reject(Error('Local server timed out')), timeout);
    });
}

export { defaultChannel, defaultConnection, RabbitChannel, RabbitConnection };
