import { AppConfig } from './configuration.type';

export default (): AppConfig => ({
  port: Number(process.env.PORT) || 4000,
  environment: process.env.NODE_ENV || 'development',
  sessionSecret: process.env.SESSION_SECRET || 'secret-key',
  database: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT) || 5432,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: process.env.CA_CERT
      ? {
          rejectUnauthorized: true,
          ca: process.env.CA_CERT,
        }
      : false,
  },
  cache: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-haiku-latest',
  },
});
