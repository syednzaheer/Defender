const STAGE_EXPLANATIONS = {
  Reconnaissance: 'The trajectory currently resembles discovery or probing behavior.',
  'Initial Access': 'The trajectory currently resembles a move toward an initial foothold.',
  'Lateral Movement': 'The trajectory currently resembles movement between internal systems.',
  'Command & Control': 'The trajectory currently resembles recurring coordination with an external controller.',
  Exfiltration: 'The trajectory currently resembles movement of data out of the environment.',
};

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'not available';
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function cleanFeature(feature) {
  if (!feature) return null;
  if (typeof feature === 'string') return feature;
  return feature.feature || feature.name || null;
}

function timelineValues(timeline = []) {
  return timeline.map((point) => Number(point?.infiltration_probability ?? point?.probability)).filter(Number.isFinite);
}

function timelineTrend(timeline = []) {
  const values = timelineValues(timeline);
  if (values.length < 2) return 'The run did not provide enough timeline points to describe a trend.';
  const delta = values[values.length - 1] - values[0];
  if (delta > 0.03) return `The trajectory rises from ${percent(values[0])} to ${percent(values[values.length - 1])}.`;
  if (delta < -0.03) return `The trajectory falls from ${percent(values[0])} to ${percent(values[values.length - 1])}.`;
  return `The trajectory is broadly stable around ${percent(Math.max(...values))}.`;
}

export function normalizeCyperContext(result) {
  if (!result) return null;
  const timeline = Array.isArray(result.timeline) ? result.timeline : [];
  const explanations = Array.isArray(result.explanations) ? result.explanations : [];
  const topFeatures = (result.topFeatures || explanations).map(cleanFeature).filter(Boolean).slice(0, 5);
  const flaggedFlows = Array.isArray(result.flagged_flows) ? result.flagged_flows : (Array.isArray(result.flaggedFlows) ? result.flaggedFlows : []);
  const reliability = result.reliability || {};
  return {
    stage: result.stage || result.predicted_stage || null,
    peakRisk: result.peakRisk ?? result.peak_risk ?? null,
    topFeatures,
    flowId: result.flowId ?? result.flow_id ?? null,
    timeline,
    sourceLabel: result.sourceLabel || result.source_label || null,
    totalFlows: result.totalFlows ?? result.total_flows ?? null,
    flaggedFlows,
    flaggedCount: result.flaggedCount ?? result.flagged_flows_count ?? flaggedFlows.length,
    modelSource: result.modelSource || result.model_source || null,
    reliability,
    kSteps: result.kSteps ?? result.steps ?? (timeline.length || null),
  };
}

export function formatContextSummary(context) {
  const live = normalizeCyperContext(context);
  if (!live) return 'No forecast has been run in this session yet. Open Run Forecast, choose Quick Demo or upload telemetry, and run the simulation. Once results exist, I can explain the live stage, risk, timeline, flagged flows, and contributing features.';
  const stage = live.stage || 'not available';
  const risk = percent(live.peakRisk);
  const featureText = live.topFeatures.length ? live.topFeatures.join(', ') : 'not available';
  const reliabilityText = live.reliability.defer_recommended ? 'defer recommended' : 'no defer flag';
  return `**Current Defender forecast**\n\n• Predicted stage: **${stage}**\n• Peak infiltration probability: **${risk}**\n• Horizon: **${live.kSteps || 'configured'} future window(s)**\n• Top contributing features: **${featureText}**\n• Flagged flows: **${live.flaggedCount}**\n• Reliability: **${reliabilityText}**\n• Source: ${live.sourceLabel || 'current telemetry'}\n\n${STAGE_EXPLANATIONS[stage] || 'Review the timeline and flagged flows before drawing an operational conclusion.'} ${timelineTrend(live.timeline)}`;
}

export function formatDynamicAnswer(kind, context) {
  const live = normalizeCyperContext(context);
  if (!live) return formatContextSummary(null);
  if (kind === 'stage') return `The latest run predicts **${live.stage || 'an unavailable stage'}**. ${STAGE_EXPLANATIONS[live.stage] || ''} This is a behavioral mapping of the simulated trajectory, not proof of a specific technique or compromise.`;
  if (kind === 'risk') return `The latest run's peak infiltration probability is **${percent(live.peakRisk)}** across ${live.kSteps || 'the configured'} future window(s). ${timelineTrend(live.timeline)} Treat this as a model score for prioritization, not a guaranteed incident probability.`;
  if (kind === 'features') {
    const text = live.topFeatures.length ? live.topFeatures.map((feature) => `**${feature}**`).join(', ') : 'No feature-attribution names were returned.';
    return `The current run's leading contributing features are ${text}. The attribution panel is a perturbation-based sensitivity explanation: it shows which inputs changed the score when perturbed, not causal proof.`;
  }
  if (kind === 'timeline') {
    const values = timelineValues(live.timeline);
    const points = values.length ? values.map((value, index) => `T+${index + 1}: ${percent(value)}`).join(' · ') : 'no timeline points returned';
    return `The visible forecast timeline is a ${live.kSteps || values.length}-step forward rollout. **${points}**. ${timelineTrend(live.timeline)} Later points are autoregressive estimates, so uncertainty can compound.`;
  }
  if (kind === 'flows') return `The current results panel contains **${live.flaggedCount} flagged flow record(s)** above the local threshold. Use the flow search/table to inspect indices and mapped stages; flagged rows are prioritization evidence, not proof of compromise.`;
  if (kind === 'screen') return `${formatContextSummary(live)}\n\nTo read the screen: start with the peak-risk card, then the timeline direction, the active ATT&CK stage, the attribution bars, and finally flagged-flow/reliability details.`;
  return formatContextSummary(live);
}

export function formatContextForEmail(context, question) {
  const live = normalizeCyperContext(context);
  return [`Question: ${question}`, `Stage: ${live?.stage || 'No forecast'}`, `Peak risk: ${live ? percent(live.peakRisk) : 'n/a'}`, `Top features: ${live?.topFeatures?.join(', ') || 'n/a'}`, `Flagged flows: ${live?.flaggedCount ?? 'n/a'}`].join('\n');
}
