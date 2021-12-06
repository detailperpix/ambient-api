import {
    FluxTableMetaData,
    InfluxDB,
} from '@influxdata/influxdb-client';
import dotenv from 'dotenv';
import { Response } from 'express';
const TOKEN =
    'UF-kfD65SM6_S63Y239S7JkNESD-s_svemnLgOlBLIVV6ceCUjELgCksLJHag8pXBghCnoV7-9Xy2EhrNvNibA==';
const ORG = 'individual';
const BUCKET = 'ambient-data';
const DB_URL = 'http://localhost:8086';

dotenv.config({ path: __dirname + '../.env' });

/**
 * queryData is middlware function to query the data from influxDB and 
 * send the results to the requester.
 * @param deviceId
 * @param fieldName 
 * @param res - response object provided in Express
 */
export default function queryData(deviceId: string, fieldName: string, startTime: number, stopTime: number, res: Response): void {
    const queryApi = new InfluxDB({ url: DB_URL, token: TOKEN }).getQueryApi(ORG);

    let fluxQuery = `from(bucket: "${BUCKET}") |> range(start: ${Math.floor(startTime / 1000)}, stop: ${Math.floor(stopTime / 1000)}) |> filter(fn: (r) => r["_measurement"] == "ambient") |> filter(fn: (r) => r["deviceId"] == "dummy-temp-${deviceId}")`;
    const fieldFluxQuery = ` |> filter(fn: (r) => r["_field"] == "${fieldName}")`;
    if (fieldName) {
        console.log("One field api")
        fluxQuery = fluxQuery.concat(fieldFluxQuery);
    }
    const result: object[] = [];
    const fluxObserver = {
        next(row: any, tableMeta: FluxTableMetaData): void {
            const o = tableMeta.toObject(row);
            // filter the query data
            const o_filtered = {value: o._value, time: o._time, field: fieldName ? '' : o._field};
            result.push(o_filtered);
        },
        error(error: Error): void {
            console.error(error);
            console.log('\nError');
        },
        complete(): void {
            console.log('Finished obtaining query.');
            res.send(result);
            console.log('Finished sending data to client.');
        },
    };

    queryApi.queryRows(fluxQuery, fluxObserver);
}
