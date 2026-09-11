import { IS_PRODUCTION } from '../config/env.js';

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (...args) => console.log(`[${timestamp()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${timestamp()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${timestamp()}] [ERROR]`, ...args),
  // Verbose/debug logs are suppressed in production to avoid leaking
  // internal detail in deployed logs; still available in development.
  debug: (...args) => {
    if (!IS_PRODUCTION) console.log(`[${timestamp()}] [DEBUG]`, ...args);
  },
};
