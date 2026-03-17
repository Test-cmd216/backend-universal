import logger from '../utils/logger.js';

// Global error handler — must be registered last (4-arg signature)
const errorHandler = (err, req, res, next) => {
  // Supabase unique-constraint violation → 409 Conflict
  const statusCode = err.statusCode || (err.code === '23505' ? 409 : 500);

  // Always log the full error internally (stack trace included)
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    // In production hide internal 500 details — never leak stack traces
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Something went wrong. Please try again later.'
      : err.message,
    // Stack only visible in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
export default errorHandler;
