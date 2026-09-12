import '@cyper/cyperAssistant.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Bot, MessageCircle, Send, ShieldCheck, Sparkles } from 'lucide-react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import { requestCyperReply } from '@cyper/cyperClient.js';
import { formatContextSummary, normalizeCyperContext } from '@cyper/cyperForecastContext.js';

const QUICK_PROMPTS = [
  'What are the dynamics?',
  'How does a forecast run?',
  'What is the forward simulation horizon?',
  'Explain MITRE ATT&CK',
];

const STAGE_PROMPTS = ['Reconnaissance', 'Initial Access', 'Lateral Movement', 'Command & Control', 'Exfiltration'];

const INITIAL_MESSAGES = [
  {
    role: 'bot',
    text: 'CYPER is online inside Defender. I am the local analyst guide. Ask about the forecast pipeline, ATT&CK stages, the 22-feature contract, or the current run after you execute a forecast.',
  },
];

function MessageText({ text }) {
  const lines = String(text).split('\n');
  return (
    <div className="cyper-message-copy">
      {lines.map((line, lineIndex) => {
        const pieces = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={`${line}-${lineIndex}`} className={line.trim() === '' ? 'cyper-message-spacer' : ''}>
            {pieces.map((piece, pieceIndex) => {
              const bold = piece.startsWith('**') && piece.endsWith('**');
              const content = bold ? piece.slice(2, -2) : piece;
              return bold ? <strong key={pieceIndex}>{content}</strong> : <span key={pieceIndex}>{content}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function Message({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`cyper-message-row ${isUser ? 'is-user' : 'is-bot'}`}>
      {!isUser && (
        <div className="cyper-avatar cyper-avatar-small">
          <Bot size={14} />
        </div>
      )}
      <div className={`cyper-message ${isUser ? 'cyper-message-user' : 'cyper-message-bot'}`}>
        <MessageText text={text} />
      </div>
    </div>
  );
}

export default function CyberChatSection({
  cyperContext = null,
  onTabChange,
  messages: controlledMessages,
  onMessagesChange,
  guideStep: controlledGuideStep,
  onGuideStepChange,
  compact = false,
}) {
  const [localMessages, setLocalMessages] = useState(INITIAL_MESSAGES);
  const [localGuideStep, setLocalGuideStep] = useState(null);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const liveContext = useMemo(() => normalizeCyperContext(cyperContext), [cyperContext]);

  const messages = controlledMessages ?? localMessages;
  const setMessages = onMessagesChange ?? setLocalMessages;
  const guideStep = controlledGuideStep === undefined ? localGuideStep : controlledGuideStep;
  const setGuideStep = onGuideStepChange ?? setLocalGuideStep;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const answerQuestion = useCallback(async (rawText) => {
    const text = rawText.trim();
    if (!text || busy) return;

    setMessages((current) => [...current, { role: 'user', text }]);
    setInput('');
    setBusy(true);

    try {
      const result = await requestCyperReply({
        message: text,
        forecastContext: liveContext,
        guideStep,
      });
      if (result.reply) {
        setMessages((current) => [...current, { role: 'bot', text: result.reply }]);
      }
      setGuideStep(result.guideStep ?? null);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'bot', text: 'CYPER could not complete that reply. Try again, or open Run Forecast if you were asking about a live result.' },
      ]);
    } finally {
      setBusy(false);
    }
  }, [busy, guideStep, liveContext, setGuideStep, setMessages]);

  const liveStatus = liveContext ? `LIVE RUN · ${liveContext.stage || 'RESULT READY'}` : 'LOCAL BRAIN · READY';
  const contextCopy = liveContext
    ? formatContextSummary(liveContext)
    : 'No forecast has been run in this session yet. Open Run Forecast, execute a demo or upload, then return here and ask about risk, stage, timeline, or contributing features.';

  return (
    <div className={compact ? 'cyper-page cyper-page-compact' : 'cyper-page'} style={compact ? { width: '100%' } : { width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 100px' }}>
      {!compact && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <Badge dot dotColor="#06B6D4">
              CYBER CHAT · CYPER
            </Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06B6D4' }}>
              NTRO PS 26153 // ANALYST GUIDE
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Cyber Chat
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', margin: 0, maxWidth: '820px' }}>
            CYPER is Defender&apos;s built-in analyst guide. It uses the same local knowledge layer and live forecast context as the rest of this workspace — not a separate app.
          </p>
        </div>
      )}

      <div className={compact ? '' : 'cyper-page-grid'}>
        <GlassCard hoverEffect={false} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: compact ? '100%' : '640px' }}>
          <section className="cyper-panel is-page" aria-label="CYPER Cyber Chat">
            <header className="cyper-header">
              <div className="cyper-brand-group">
                <div className="cyper-avatar">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="cyper-title-row">
                    <span className="cyper-title">CYPER</span>
                    <span className="cyper-live-dot" aria-hidden="true" />
                  </div>
                  <div className="cyper-subtitle">DEFENDER ANALYST GUIDE</div>
                </div>
              </div>
              <span className="cyper-page-mode-pill">
                <MessageCircle size={13} /> BUILT-IN
              </span>
            </header>

            <div className="cyper-status-strip">
              <span>{liveStatus}</span>
              <span className="cyper-status-lock">
                <Sparkles size={12} /> {busy ? 'THINKING' : 'AUDITABLE ANSWERS'}
              </span>
            </div>

            <div className="cyper-body" ref={scrollRef}>
              <div className="cyper-context-card">
                <div className="cyper-context-label">ASK ABOUT THE MVP</div>
                <div className="cyper-context-copy">
                  I answer from Defender&apos;s local product knowledge, and I can explain the current run after you execute a forecast.
                </div>
                <div className="cyper-chip-row">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button type="button" className="cyper-chip" key={prompt} onClick={() => answerQuestion(prompt)} disabled={busy}>
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((message, index) => (
                <Message key={`${message.role}-${index}`} {...message} />
              ))}

              {!messages.some((message) => message.role === 'user') && (
                <div className="cyper-stage-suggestions">
                  <div className="cyper-context-label">ATT&amp;CK STAGE EXPLAINERS</div>
                  <div className="cyper-chip-row">
                    {STAGE_PROMPTS.map((prompt) => (
                      <button
                        type="button"
                        className="cyper-chip cyper-chip-muted"
                        key={prompt}
                        onClick={() => answerQuestion(`What is ${prompt}?`)}
                        disabled={busy}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              className="cyper-composer"
              onSubmit={(event) => {
                event.preventDefault();
                answerQuestion(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask CYPER about Defender..."
                aria-label="Ask CYPER a question"
                disabled={busy}
              />
              <button type="submit" aria-label="Send question" disabled={!input.trim() || busy}>
                <Send size={16} />
              </button>
            </form>
            <div className="cyper-footer-note">
              <span>Local Express API with offline fallback</span>
              <span>Press Enter to send</span>
            </div>
          </section>
        </GlassCard>

        {!compact && (
          <div className="cyper-side-stack">
            <GlassCard hoverEffect={false}>
              <div className="cyper-context-label">LIVE FORECAST CONTEXT</div>
              <div className="cyper-side-copy">
                {liveContext ? (
                  <>
                    <div>Predicted stage: {liveContext.stage || 'not available'}</div>
                    <div>
                      Peak infiltration probability:{' '}
                      {liveContext.peakRisk == null ? 'not available' : `${(Number(liveContext.peakRisk) * 100).toFixed(1)}%`}
                    </div>
                    <div>Horizon: {liveContext.kSteps || 'configured'} window(s)</div>
                    <div>
                      Top features:{' '}
                      {liveContext.topFeatures?.length ? liveContext.topFeatures.join(', ') : 'not available'}
                    </div>
                  </>
                ) : (
                  contextCopy
                )}
              </div>
              {onTabChange && (
                <button type="button" className="cyper-side-cta" onClick={() => onTabChange('forecast')}>
                  <Activity size={14} /> {liveContext ? 'Open Run Forecast' : 'Run a forecast first'}
                </button>
              )}
            </GlassCard>

            <GlassCard hoverEffect={false}>
              <div className="cyper-context-label">HOW THIS FITS DEFENDER</div>
              <p className="cyper-side-copy">
                Cyber Chat is Defender&apos;s built-in analyst guide, available anywhere via the floating launcher. Forecast inference still runs through the existing Express/Python LSTM path. CYPER only explains Defender, including the latest result published by Run Forecast.
              </p>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

export { INITIAL_MESSAGES as CYPER_INITIAL_MESSAGES };
