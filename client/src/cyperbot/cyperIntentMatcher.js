import { KNOWLEDGE_BASE, MODEL_FEATURES } from './cyperKnowledgeBase.js';

const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'be', 'can', 'does', 'for', 'how', 'i', 'is', 'it', 'me', 'of', 'on', 'or', 'the', 'this', 'to', 'what', 'why', 'with']);

const ALIASES = [
  [/p\s*\(?\s*s[_\s]*\{?\s*t\s*\+\s*1\s*\}?\s*\)?\s*\|\s*s[_\s]*\{?\s*t\s*\}?/gi, 'next state given current state'],
  [/s[_\s]*\{?\s*t\s*\+\s*1\s*\}?/gi, 'next state'],
  [/s\s*t\s*\|\s*s\s*t/gi, 'state transition'],
  [/command\s*[&and]+\s*control/gi, 'command and control c2'],
  [/initial\s+access/gi, 'initial access foothold'],
  [/lateral\s+movement/gi, 'lateral movement internal movement'],
  [/forward\s+simulation\s+horizon/gi, 'forecast horizon future horizon'],
  [/next[-\s]?state/gi, 'next state'],
  [/world[-\s]?model/gi, 'world model'],
  [/time[-\s]?window/gi, 'time window'],
];

function normalize(text = '') {
  let value = String(text).toLowerCase();
  for (const [pattern, replacement] of ALIASES) value = value.replace(pattern, replacement);
  value = value
    .replace(/\battck\b/g, 'att&ck')
    .replace(/\bmitre\s+attack\b/g, 'mitre att&ck')
    .replace(/\bplus\b/g, ' plus ')
    .replace(/[^a-z0-9_&+\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return value;
}

function tokens(text) {
  return normalize(text)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token && !STOP_WORDS.has(token));
}

function phraseMatches(message, keyword) {
  const source = normalize(message);
  const target = normalize(keyword);
  if (!target) return 0;
  if (source === target || source.includes(` ${target} `) || source.startsWith(`${target} `) || source.endsWith(` ${target}`)) {
    return target.split(' ').length > 1 ? 4 + target.split(' ').length : 3;
  }

  const targetTokens = tokens(target);
  if (!targetTokens.length) return 0;
  const sourceTokens = new Set(tokens(source));
  const overlap = targetTokens.filter((token) => sourceTokens.has(token)).length;
  if (targetTokens.length >= 2 && overlap === targetTokens.length) return 2 + targetTokens.length / 10;
  if (targetTokens.length >= 2 && overlap / targetTokens.length >= 0.66) return 0.75;
  return 0;
}

function keywordScore(message, keywords = []) {
  return keywords.reduce((score, keyword) => score + phraseMatches(message, keyword), 0);
}

function featureBoost(message, entry) {
  const normalized = normalize(message);
  const featureNames = MODEL_FEATURES.filter((feature) => normalized.includes(feature));
  if (!featureNames.length) return 0;
  return entry.category === 'features' ? 8 : 0;
}

export function findMatches(userMessage, limit = 5) {
  const normalized = normalize(userMessage);
  if (!normalized) return [];

  return KNOWLEDGE_BASE
    .map((entry, index) => ({
      entry,
      score: keywordScore(normalized, entry.keywords) + featureBoost(normalized, entry) + ((/\bhorizon\b|\bhow far ahead\b|\bfar ahead\b/.test(normalized) && entry.id === 'forward_horizon') ? 10 : 0),
      index,
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ entry, score }) => ({ entry, score }));
}

/** Return the strongest auditable knowledge entry, or null when no intent is found. */
export function matchMessage(userMessage) {
  const [best] = findMatches(userMessage, 1);
  return best && best.score >= 1 ? best.entry : null;
}

export { normalize as normalizeForMatch };
