declare namespace Influx {
    type Config = { url: string; token: string; org: string; bucket: string };

    type Payload = {
        measurement: string;
        timestamp: number;
        tags: { [key: string]: string };
        fields: { [key: string]: number | boolean };
    };
}
