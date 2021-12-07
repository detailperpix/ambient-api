import dotenv = require('dotenv');
dotenv.config({ path: __dirname + '../.env' });
import mqtt = require('mqtt');
import { insertData } from './dbconnector';
import logger from '../logger'
import {io} from 'socket.io-client'

type SensorData = {
    deviceId: string;
    temperature: number;
    humidity: number;
    timestamp: number;
};

function subscribeHost(): void {
    const log = logger('INSERT')
    const MQTT_HOST = String(process.env.MQTT_HOST);
    const PORT_NUMBER = Number(process.env.PORT_NUMBER);
    const client = mqtt.connect(`mqtt://${MQTT_HOST}:${PORT_NUMBER}`);
    const topic = `site-a/data/+/temp`;
    const socket = io("http://localhost:8000");
    client.on('connect', () => {
        log.info(`MQTT Connected`);

        // subscribe to each device
        client.subscribe(topic, (err: Error) => {
            if (!err) {
                log.info('Subscribed to host');
            } else {
                log.info('No host');
            }
        });
    });

    client.on('message', function (topic: string, message: string) {
        // write data to influxDB
        insertData(message);
        // emit message here
        socket.emit('newdata');


        
    });

    client.on('close', () => {
        log.info(`MQTT closed`);
    });
}

export { SensorData, subscribeHost };
