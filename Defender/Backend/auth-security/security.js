import helmet from 'helmet';
import cors from 'cors';
import { CLIENT_ORIGIN, NODE_ENV } from '../config/env.js';

export const configureSecurityHeaders = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", 'https:', 'http:'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
};

export const enforceHttps = () => {
  return (req, res, next) => {
    if (NODE_ENV === 'production') {
      const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
      if (!isHttps && req.headers.host) {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
    }
    next();
  };
};

export const configureCors = () => {
  const allowedOrigins = CLIENT_ORIGIN
    ? CLIENT_ORIGIN.split(',').map((o) => o.trim())
    // REPLACE_BEFORE_DEPLOY: set CLIENT_ORIGIN in .env to your real
    // deployed frontend URL before going to production -- this
    // localhost-only default is safe for local dev, nothing else.
    : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman) in development or if explicitly allowed
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
};
