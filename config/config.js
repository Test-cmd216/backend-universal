import { config as loadEnv } from 'dotenv';
loadEnv();

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE || '15m',       // short-lived access token
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  },
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
};
export default config;
