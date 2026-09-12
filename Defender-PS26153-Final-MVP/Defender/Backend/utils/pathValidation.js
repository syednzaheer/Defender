import path from 'path';
import fs from 'fs';
import { BACKEND_ROOT } from '../config/env.js';

/**
 * Validates a client-supplied csv_path against path traversal and
 * extension/existence checks, containing it inside BACKEND_ROOT.
 *
 * Returns:
 *   - the resolved absolute path (string) if valid
 *   - `false` if the path is present but fails validation (caller should
 *     reject the request, e.g. HTTP 400)
 *   - `null` if no path was supplied at all (caller should fall back to
 *     demo mode, not treat this as an error)
 */
export function safeValidatePath(csvPath) {
  if (!csvPath || typeof csvPath !== 'string') return null;

  const normalized = path.normalize(csvPath);
  const resolved = path.isAbsolute(normalized) ? path.resolve(normalized) : path.resolve(BACKEND_ROOT, normalized);

  // Path traversal containment: resolved path MUST stay within the
  // backend project directory. This is the fix for a real, previously
  // exploitable path-traversal vulnerability -- do not weaken this check.
  if (!resolved.startsWith(BACKEND_ROOT)) {
    return false;
  }

  const ext = path.extname(resolved).toLowerCase();
  if (ext !== '.csv' && ext !== '.pcap') {
    return false;
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    return false;
  }

  return resolved;
}
