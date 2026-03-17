import { config } from 'dotenv';
config(); // Must be first — loads .env before anything reads process.env

import validateEnv from './utils/validateEnv.js';
validateEnv(); // Crash early if any required env var is missing

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import protect from './middleware/auth.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import passwordRouter from './routes/password.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS — never '*' with credentials (browsers block it)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false, credentials: true }));

app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: { success: false, message: 'Too many requests, please try again later.' },
}));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', protect, userRouter);
app.use('/api/password', protect, passwordRouter);

// Error handling — must be after all routes
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown — finish in-flight requests before exiting
function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info('All connections closed. Exiting.');
    process.exit(0);
  });
  // Force-kill if still alive after 10 s
  setTimeout(() => { logger.error('Forced shutdown after timeout'); process.exit(1); }, 10000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Catch any unhandled promise rejections — log them, do not crash silently
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
