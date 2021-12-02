# Typescript Template for Node.js APIs

Typescript starter template for Node.js APIs

## Installation

Clone from git url

```bash
git clone https://github.com/tanand-tech/node-api-template-ts.git
```

## Usage

```shell
# Deployment

npm run start

# Testing

npm run watch&&npm run dev
```

## Service Templates

### Express API
src/api
```shell
# Dependencies
npm i cors express express-list-endpoints

# Dev dependencies
npm i -D @types/cors @types/express @types/express-list-endpoints
```

### Redis
src/services/redis
```shell
# Dependencies
npm i ioredis

# Dev dependencies
npm i -D @types/ioredis
```

### Mosquitto
src/services/mosquitto
```shell
# Dependencies
npm i mqtt mqtt-match
```

### Influx
src/services/influx
```shell
# Dependencies
npm i @influxdata/influxdb-client
```

### Postgres
src/services/postgres
```shell
# Dependencies
npm i pg

# Dev dependencies
npm i @types/pg
```

### RabbitMQ
src/services/rabbit
```shell
# Dependencies
npm i uuid amqplib

# Dev dependencies
npm i -D @types/uuid @types/amqplib
```
