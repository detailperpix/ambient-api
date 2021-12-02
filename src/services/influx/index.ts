import config from 'config';
import * as util from '@/util';
import InfluxService from './service';
import {
    ParameterizedQuery,
    WritePrecisionType,
    fluxInteger,
    fluxFloat,
    fluxString,
    fluxDateTime,
    toFluxValue,
} from '@influxdata/influxdb-client';

const { url, token, org, bucket, writeOptions, precision = 's' } = config.get<Config.influx>('influx');
const service = new InfluxService({ url, token, org, bucket }, precision, writeOptions);

export { bucket };

export function int(value: number): string {
    return fluxInteger(value).toString();
}

export function float(value: number): string {
    return fluxFloat(Number.isInteger(value) ? value.toFixed(1) : value).toString();
}

export function string(value: string): string {
    return fluxString(value).toString();
}

export function array(value: any[]): string {
    return toFluxValue(value);
}

export function datetime(value: number, unit: WritePrecisionType = precision): string {
    switch (unit) {
        case 's':
            value *= 1000;
            break;
        case 'ms':
            break;
        case 'us':
            value /= 1000;
            break;
        case 'ns':
            value /= 1000_000;
            break;
        default:
            throw Error(`Unknown precision of type ${precision}`);
    }
    return fluxDateTime(new Date(value).toISOString()).toString();
}

export const semaphore = new util.Semaphore(3, true);

export function write(payload: Influx.Payload | Influx.Payload[]): void {
    return service.write(payload);
}

export async function query<T>(query: string | ParameterizedQuery): Promise<T[]> {
    return service.query(query);
}
