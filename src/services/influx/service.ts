import logger, { LogLevel } from '@/logger';
import {
    InfluxDB,
    Point,
    QueryApi,
    WriteApi,
    WriteOptions,
    WritePrecisionType,
    ParameterizedQuery,
} from '@influxdata/influxdb-client';

const DEFAULT_BATCH_SIZE = 250;
const DEFAULT_FLUSH_INTERVAL = 3000;
const DEFAULT_MAX_RETRIES = 100;
const DEFAULT_MAX_RETRY_DELAY = 180000;
const DEFAULT_MIN_RETRY_DELAY = 1000;
const DEFAULT_RETRY_JITTER = 5000;

const log = logger('INFLUX');

export default class InfluxService {
    private writeApi: WriteApi;
    private queryApi: QueryApi;

    constructor(
        config: Influx.Config,
        precision: WritePrecisionType,
        writeOptions: Partial<WriteOptions>,
        minLevel: LogLevel = 'debug'
    ) {
        log.setSettings({ minLevel });

        const { url, token, org, bucket } = config;

        const influxDB = new InfluxDB({ url, token });

        this.queryApi = influxDB.getQueryApi(org);

        writeOptions.batchSize ??= DEFAULT_BATCH_SIZE;
        writeOptions.flushInterval ??= DEFAULT_FLUSH_INTERVAL;
        writeOptions.maxRetries ??= DEFAULT_MAX_RETRIES;
        writeOptions.maxRetryDelay ??= DEFAULT_MAX_RETRY_DELAY;
        writeOptions.minRetryDelay ??= DEFAULT_MIN_RETRY_DELAY;
        writeOptions.retryJitter ??= DEFAULT_RETRY_JITTER;

        this.writeApi = influxDB.getWriteApi(org, bucket, precision, {
            ...writeOptions,
            writeSuccess(lines) {
                log.debug(`Write success! ${lines.length} points flushed.`);
            },
            async writeFailed(error, lines, attempts) {
                log.warn(`Write failed ${attempts} times due to ${error.message}`);
                log.debug(`Failed data: ${lines}`);
            },
        });
    }

    write<T extends Influx.Payload>(payload: T | T[]): void {
        Array.isArray(payload) ? payload.forEach(this.writePoint.bind(this)) : this.writePoint(payload);
        log.silly('Write success');
    }

    async query<T>(query: string | ParameterizedQuery): Promise<T[]> {
        try {
            return (await this.queryApi.collectRows(query)) ?? [];
        } catch (e) {
            if (e.code !== 'ECONNREFUSED') log.warn({ query, ...e });
            throw e;
        }
    }

    private writePoint(payload: Influx.Payload): void {
        const { measurement, timestamp, tags, fields } = payload;
        const point = new Point(measurement).timestamp(timestamp);

        Object.entries(tags).forEach(([key, val]) => point.tag(key, val));
        Object.entries(fields).forEach(([key, val]) => point.floatField(key, +val));
        this.writeApi.writePoint(point);
    }
}
