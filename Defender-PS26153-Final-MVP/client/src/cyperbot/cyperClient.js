import { answerCyperQuestion } from '@cyper/cyperEngine.js';

/**
 * Ask CYPER through Defender's Express API, then fall back to the local
 * knowledge engine so Cyber Chat still works if the server is offline.
 */
export async function requestCyperReply({ message, forecastContext = null, guideStep = null } = {}) {
  try {
    const response = await fetch('/api/v1/cyper/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, forecastContext, guideStep }),
    });
    if (!response.ok) throw new Error(`CYPER API ${response.status}`);
    const payload = await response.json();
    if (!payload?.reply) throw new Error('Empty CYPER reply');
    return {
      reply: payload.reply,
      guideStep: payload.guideStep ?? null,
      intentId: payload.intentId ?? null,
      source: payload.source || 'api',
    };
  } catch {
    return answerCyperQuestion({
      text: message,
      context: forecastContext,
      guideStep,
    });
  }
}
