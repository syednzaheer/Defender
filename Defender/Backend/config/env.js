import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Backend/config/ -> Backend/ is the actual project root for path purposes
export const BACKEND_ROOT = path.resolve(__dirname, '..');
export const PYTHON_ENGINE_DIR = path.join(BACKEND_ROOT, 'models', 'python');
export const ARTIFACTS_DIR = path.join(BACKEND_ROOT, 'models', 'artifacts');

export const PORT = process.env.PORT || 4000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || null;

// CYPER escalation email credentials -- see auth-security/ for how these
// are used, and the top-level .env.example for setup instructions.
export const CYPER_SMTP_USER = process.env.CYPER_SMTP_USER || null;
export const CYPER_SMTP_APP_PASSWORD = process.env.CYPER_SMTP_APP_PASSWORD || null;
export const CYPER_ALERT_TO = process.env.CYPER_ALERT_TO || CYPER_SMTP_USER;
