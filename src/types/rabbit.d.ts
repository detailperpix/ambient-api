import amqp from 'amqplib';

declare global {
    namespace Rabbit {
        namespace Channel {
            type Consumers = { [queue: string]: { handler: Consumer; consumerTag: string } };
        }

        type Consumer = (channel: amqp.Channel) => any;

        type MessageHandler = (msg: amqp.ConsumeMessage) => Promise<string | void>;
    }
}
