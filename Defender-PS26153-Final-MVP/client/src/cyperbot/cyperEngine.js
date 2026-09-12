import { matchMessage } from './cyperIntentMatcher.js';
import { CONSOLE_GUIDE_STEPS, matchFeatureQuestion } from './cyperKnowledgeBase.js';
import { formatDynamicAnswer } from './cyperForecastContext.js';

export const SCOPE_REPLY =
  'I am focused on Defender. I can explain the website, forecast pipeline, state-transition dynamics, P(S_{t+1} | S_t), the K-step forward simulation horizon, the 22-feature contract, MITRE ATT&CK stages, timeline, attributions, flagged flows, reliability, and the judge demo. Try one of those topics.';

export const DOMAIN_REPHRASE_REPLY =
  'I could not map that wording to a saved Defender explanation yet. I can still help if you rephrase it as a question about the forecast, dynamics, ATT&CK stage, feature, timeline, attribution, or judge demo.\n\nFor example: **What does this forecast mean?** or **Why is the model using a K-step rollout?**';

export function isGuideAdvance(text) {
  return /^(next|continue|go on|next step|yes)$/i.test(String(text || '').trim());
}

function normalizeGuideStep(guideStep) {
  if (guideStep === 0) return 0;
  if (typeof guideStep === 'number' && Number.isInteger(guideStep) && guideStep > 0) return guideStep;
  if (typeof guideStep === 'string' && /^\d+$/.test(guideStep)) return Number(guideStep);
  return null;
}

/**
 * Shared CYPER brain used by the Cyber Chat UI and POST /api/v1/cyper/chat.
 * Offline, auditable, and independent of the forecasting/ML pipeline.
 */
export function answerCyperQuestion({ text, context = null, guideStep = null } = {}) {
  const trimmed = String(text || '').trim();
  let nextGuideStep = normalizeGuideStep(guideStep);

  if (!trimmed) {
    return {
      reply: '',
      guideStep: nextGuideStep,
      intentId: null,
      source: 'local-knowledge',
    };
  }

  if (nextGuideStep !== null && isGuideAdvance(trimmed)) {
    const next = nextGuideStep + 1;
    if (next < CONSOLE_GUIDE_STEPS.length) {
      return {
        reply: CONSOLE_GUIDE_STEPS[next],
        guideStep: next,
        intentId: 'console_walkthrough',
        source: 'local-knowledge',
      };
    }
    return {
      reply: 'That completes the judge demo path. Ask me about any stage, feature, chart, or technical term for a deeper explanation.',
      guideStep: null,
      intentId: 'console_walkthrough',
      source: 'local-knowledge',
    };
  }

  const entry = matchMessage(trimmed);

  // Check for a question about one specific feature (by its real name, an
  // old/superseded name, or a plain-English phrase) before the generic
  // 22-feature paragraph or the "I am focused on Defender" fallback --
  // a specific answer is always better than a generic one when the user
  // named a specific thing.
  const featureMatch = matchFeatureQuestion(trimmed);
  if (featureMatch) {
    return {
      reply: featureMatch.answer,
      guideStep: nextGuideStep,
      intentId: `feature_${featureMatch.key}`,
      source: 'local-knowledge',
    };
  }

  const asksForRisk = /\b(risk|probability|infiltration)\b/i.test(trimmed);
  const asksForStage = /\b(stage|phase|mitre)\b/i.test(trimmed);
  if (context && asksForRisk && asksForStage) {
    return {
      reply: `${formatDynamicAnswer('risk', context)}\n\n${formatDynamicAnswer('stage', context)}`,
      guideStep: nextGuideStep,
      intentId: 'live_risk_and_stage',
      source: 'local-knowledge',
    };
  }

  if (entry?.id === 'console_walkthrough') {
    return {
      reply: `${entry.answer}\n\nIf you want a guided walkthrough, type **next** after each step.`,
      guideStep: 0,
      intentId: entry.id,
      source: 'local-knowledge',
    };
  }

  if (entry?.dynamic) {
    return {
      reply: formatDynamicAnswer(entry.dynamic, context),
      guideStep: nextGuideStep,
      intentId: entry.id,
      source: 'local-knowledge',
    };
  }

  if (entry?.answer) {
    return {
      reply: entry.answer,
      guideStep: nextGuideStep,
      intentId: entry.id,
      source: 'local-knowledge',
    };
  }

  if (/\b(defender|forecast|attack|network|model|risk|mitre|telemetry|flow|pcap|csv|lstm|stage|feature|website|mvp|cyper|chat)\b/i.test(trimmed)) {
    return {
      reply: DOMAIN_REPHRASE_REPLY,
      guideStep: nextGuideStep,
      intentId: null,
      source: 'local-knowledge',
    };
  }

  return {
    reply: SCOPE_REPLY,
    guideStep: nextGuideStep,
    intentId: null,
    source: 'local-knowledge',
  };
}
