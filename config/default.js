const projectId = 'template';

exports.api = {
    port: 8000,
};

exports.influx = {
    url: 'http://localhost:8086',
    bucket: projectId,
    org: '',
    token: '',
    precision: 's',
    writeOptions: {
        batchSize: 250,
        flushInterval: 3000,
        maxRetries: 100,
        maxRetryDelay: 180000,
        minRetryDelay: 1000,
        retryJitter: 5000,
    },
};

exports.mqtt = {
    host: 'localhost',
    topicPrefix: `${projectId}/`,
};

exports.postgres = {
    host: 'localhost',
    port: 5432,
    user: '',
    password: '',
    database: projectId,
};

exports.redis = {
    host: 'localhost',
    port: 6379,
    db: 0,
    namespace: projectId,
};

exports.rabbitmq = {
    config: {
        protocol: 'amqp',
        hostname: 'localhost',
        port: 5672,
        username: '',
        password: '',
        vhost: '/',
        authMechanism: ['PLAIN', 'AMQPLAIN', 'EXTERNAL'],
    },
    connReconInterval: 1000,
    chanReconInterval: 1000,
    queues: {
        rpc_response: 'amq.rabbitmq.reply-to',
    },
};
