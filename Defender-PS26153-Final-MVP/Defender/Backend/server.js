import express from 'express';
import { fileURLToPath } from 'url';
import { configureSecurityHeaders, configureCors, enforceHttps } from './auth-security/security.js';
import { apiRateLimiter } from './auth-security/rateLimiter.js';
import healthRoutes from './api/healthRoutes.js';
import forecastRoutes from './api/forecastRoutes.js';
import cyperRoutes from './api/cyperRoutes.js';
import { PORT, NODE_ENV } from './config/env.js';
import { logger } from './logging/logger.js';

const app = express();

// Security middleware
app.use(enforceHttps());
app.use(configureSecurityHeaders());
app.use(configureCors());

// Payload cap (10kb max, prevents simple DoS via oversized bodies)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting across all /api/ routes
app.use('/api/', apiRateLimiter);

// Routes
app.use('/api', healthRoutes);
app.use('/api/v1', forecastRoutes);
app.use('/api/v1/cyper', cyperRoutes);

// 404 fallback -- structured JSON, not an HTML error page
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    status: 404,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler -- structured JSON, doesn't leak internals in production
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  logger.error(err.message);
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    status: statusCode,
    message: NODE_ENV === 'production' ? 'An internal error occurred.' : err.message,
    timestamp: new Date().toISOString(),
  });
});

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain && NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Hardened NTRO PS 26153 server running on port ${PORT}`);
  });
}

export default app;
