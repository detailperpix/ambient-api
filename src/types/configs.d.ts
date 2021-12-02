import amqp from 'amqplib';
import { ClientConfig } from 'pg';
import { RedisOptions } from 'ioredis';
import { IClientOptions } from 'mqtt';
import { WriteOptions, WritePrecisionType } from '@influxdata/influxdb-client';

declare global {
    namespace Config {
        type api = {
            port: number;
        };

        type influx = {
            url: string;
            bucket: string;
            org: string;
            token: string;
            precision: WritePrecisionType;
            writeOptions: Partial<WriteOptions>;
        };

        type mqtt = {
            host: string;
            port?: number;
            // Prefix added to every topic published via MQTT service
            topicPrefix?: string;
            username?: string;
            password?: string;
            options: IClientOptions;
        };

        type postgres = ClientConfig;

        type redis = RedisOptions & { namespace?: string };

        type rabbitmq = {
            config: amqp.Options.Connect;
            connReconInterval: number;
            chanReconInterval: number;
            queues: { [key: string]: string };
            rpcTimeout?: number;
        };
    }
}
