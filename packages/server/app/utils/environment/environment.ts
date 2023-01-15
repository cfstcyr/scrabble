/* eslint-disable @typescript-eslint/naming-convention */
import { cleanEnv, num, str } from 'envalid';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
        default: 'development',
    }),
    PORT: num({ default: 3000 }),

    CORS: str({ default: '*' }),
    SERVER_URL: str({ example: 'http://localhost:3000' }),
    MONGO_URL: str({ example: 'mongodb+srv://{USERNAME}:{PASSWORD}@{CLUSTER}' }),
    MONGO_NAME: str(),

    PG_HOST: str({ example: 'localhost' }),
    PG_PORT: num({ default: 5432 }),
    PG_USER: str(),
    PG_PASSWORD: str(),
    PG_DATABASE: str(),
});

export { env };
