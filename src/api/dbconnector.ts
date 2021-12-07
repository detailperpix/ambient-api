import './insert';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import logger from '../logger'

const TOKEN =
  'UF-kfD65SM6_S63Y239S7JkNESD-s_svemnLgOlBLIVV6ceCUjELgCksLJHag8pXBghCnoV7-9Xy2EhrNvNibA==';
const ORG = 'individual';
const BUCKET = 'ambient-data';
const DB_URL = 'http://localhost:8086'

const client = new InfluxDB({ url: DB_URL, token: TOKEN });

/**
 * insertData
 * perform insertion of object obtained from simulation data
 * into the influxDB
 * @param data
 * @see ../index.js
 */
function insertData(data: string):void {
  const log = logger('DBConnector')
  const parsedData = JSON.parse(data);

  const writeApi = client.getWriteApi(ORG, BUCKET, 'ms');
  // writeApi.useDefaultTags({ 'device-Id': `dummy-device-default` }); can be removed
  const aPoint = new Point('ambient')
    .tag('deviceId', parsedData.deviceId)
    .floatField('humidity', parsedData.humidity)
    .floatField('temperature', parsedData.temperature)
    .timestamp(parsedData.timestamp);
  writeApi.writePoint(aPoint);

  writeApi
    .close()
    .then(() => {
      log.info('Successfully inserted data to DB');
    })
    .catch((e: Error) => {
      log.error(e)
      log.info('Error in insertion');
    });
};
export { insertData };
