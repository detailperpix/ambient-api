import config from 'config';
import MqttService from './service';

const { host, port, topicPrefix } = config.get<Config.mqtt>('mqtt');

const mqtt = new MqttService(host, port, topicPrefix);

export default mqtt;
