import React, { useState, useEffect } from 'react';
import Badge from '../ui/Badge';
import GlassCard from '../ui/GlassCard';
import DefenderRadar from '../ui/DefenderRadar';
import {
  UploadCloud,
  Play,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  Download,
  Sliders,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search
} from 'lucide-react';

const ForecastWorkspace = ({ autoRunDemo = false, onForecastResult }) => {
  const [activeMode, setActiveMode] = useState('demo'); // 'demo' | 'custom'
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [kSteps, setKSteps] = useState(5);
  const [modelMode, setModelMode] = useState('Validated real-data LSTM artifact');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [forecastData, setForecastData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [flowSearchQuery, setFlowSearchQuery] = useState('');
  const [uploadPayload, setUploadPayload] = useState(null);

  const executionPhases = [
    'Ingesting & Validating Telemetry',
    'Extracting 22-Feature Network State Matrix S_t',
    'Executing PyTorch Temporal LSTM Model',
    'Rolling Forward K-Step Autoregressive Predictions P(S_{t+1} | S_t)',
    'Mapping MITRE ATT&CK Attack Progression',
    'Computing Feature Attributions (Perturbation-based)'
  ];

  const runForecastExecution = async (overrideMode = activeMode, overrideFile = selectedFile) => {
    setIsExecuting(true);
    setErrorMsg(null);
    setExecutionStep(0);

    // Show genuine pipeline phases without adding an artificial multi-second delay.
    setExecutionStep(0);

    try {
      const response = await fetch('/api/v1/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          steps: kSteps,
          model_mode: modelMode,
          use_demo: overrideMode === 'demo',
          upload: overrideMode === 'custom' ? uploadPayload : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to execute forecast engine.`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setForecastData(data);
    } catch (err) {
      console.error('Forecast execution failed:', err);
      setForecastData(null);
      setErrorMsg(`${err.message || 'Forecast execution failed.'} No result was generated.`);
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    if (autoRunDemo && !forecastData && !isExecuting) {
      runForecastExecution('demo', null);
    }
  }, [autoRunDemo]);

  useEffect(() => {
    if (typeof onForecastResult === 'function') {
      onForecastResult(forecastData);
    }
  }, [forecastData, onForecastResult]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const lower = file.name.toLowerCase();
    const isCsv = file.type === 'text/csv' || lower.endsWith('.csv');
    const isPcap = lower.endsWith('.pcap') || lower.endsWith('.pcapng');
    if (!isCsv && !isPcap) {
      setErrorMsg('Unsupported file. Choose a CSV flow export, PCAP, or PCAPNG capture.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrorMsg('Telemetry file exceeds the 50 MB safety limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const payload = result.includes(',') ? result.split(',')[1] : result;
      if (isCsv) {
        const content = result;
        const firstLine = content.split(/\r?\n/, 1)[0].trim();
        if (!firstLine || !firstLine.includes(',')) {
          setErrorMsg('The selected file is not a valid comma-delimited CSV.');
          return;
        }
        setFileDetails({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', format: 'Flow CSV Export', status: 'Validated for 22-feature normalization', rowCount: Math.max(0, content.split(/\r?\n/).length - 1) + ' rows' });
      } else {
        setFileDetails({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', format: 'Packet Capture', status: 'Uploaded for local packet adapter handoff', rowCount: 'binary capture' });
      }
      setUploadPayload({ filename: file.name, content_base64: payload });
      setSelectedFile(file);
      setErrorMsg(null);
      setActiveMode('custom');
    };
    reader.onerror = () => setErrorMsg('Could not read the selected telemetry file.');
    reader.readAsDataURL(file);
  };

  const mitreStagesList = [
    { name: 'Reconnaissance', id: 'TA0043', color: '#38BDF8' },
    { name: 'Initial Access', id: 'TA0001', color: '#FBBF24' },
    { name: 'Lateral Movement', id: 'TA0008', color: '#F87171' },
    { name: 'Command & Control', id: 'TA0011', color: '#EC4899' },
    { name: 'Exfiltration', id: 'TA0010', color: '#EF4444' },
  ];

  const filteredFlows = forecastData?.flagged_flows?.filter(f =>
    String(f.flow_index).includes(flowSearchQuery) ||
    String(f.predicted_stage).toLowerCase().includes(flowSearchQuery.toLowerCase())
  ) || [];

  return (
    <div className="forecast-workspace" style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 100px' }}>
      
      {/* Header */}
      <div className="forecast-header" style={{ marginBottom: '32px' }}>
        <div className="forecast-header-copy">
          <div className="forecast-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Badge icon={Activity} variant="accent">THREAT INTELLIGENCE WORKSPACE</Badge>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>OFFLINE INFERENCE ENGINE // LOCAL EVIDENCE</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            Network Attack Forecasting &amp; Dynamics Analysis
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-secondary)', margin: 0, maxWidth: '760px', lineHeight: 1.6 }}>
            Analyze flow CSV or PCAP network telemetry using PyTorch temporal state-transition dynamics <code style={{ color: '#06B6D4' }}>P(S_{'{t+1}'} | S_t)</code>. Roll out future time windows, track MITRE ATT&amp;CK stage progression, and inspect perturbation-based feature attributions.
          </p>
        </div>
        <div className="radar-card" style={{ maxWidth: '330px', margin: '0 0 0 auto', padding: '4px 8px', border: '0', borderRadius: '0', background: 'transparent' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#06B6D4', letterSpacing: '.12em' }}>DEFENDER RADAR // LIVE SIGNAL</div>
          <DefenderRadar size="large" />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>THREAT HORIZON / 5 STEPS / REAL BENCHMARK STATE</div>
        </div>
      </div>

      {/* Input Selection & Mode Cards */}
      <div className="forecast-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Mode A: Quick Demo */}
        <div
          onClick={() => setActiveMode('demo')}
          style={{
            backgroundColor: activeMode === 'demo' ? 'rgba(6, 182, 212, 0.08)' : 'var(--bg-card)',
            border: activeMode === 'demo' ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={18} color="#06B6D4" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  MODE A — Quick Demo
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#06B6D4' }}>
                  1-Click Deterministic Simulation
                </span>
              </div>
            </div>
            {activeMode === 'demo' && <Badge icon={CheckCircle2} variant="success">SELECTED</Badge>}
          </div>

          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.5 }}>
            Instantly run PyTorch model inference on bundled canonical attack telemetry. Evaluates 48 records without requiring local file uploads.
          </p>

          <button
            onClick={(e) => { e.stopPropagation(); setActiveMode('demo'); runForecastExecution('demo', null); }}
            disabled={isExecuting}
            style={{
              width: '100%',
              backgroundColor: '#06B6D4',
              color: '#000000',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '13px',
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isExecuting ? 0.7 : 1,
            }}
          >
            {isExecuting && activeMode === 'demo' ? (
              <RefreshCw size={14} className="spin" />
            ) : (
              <Play size={14} />
            )}
            Run Defender Demo
          </button>
        </div>

        {/* Mode B: Analyze Your Data */}
        <div
          onClick={() => setActiveMode('custom')}
          style={{
            backgroundColor: activeMode === 'custom' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-card)',
            border: activeMode === 'custom' ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UploadCloud size={18} color="#6366F1" />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  MODE B — Analyze Your Data
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#6366F1' }}>
                  CSV Flow Exports &amp; Raw PCAP
                </span>
              </div>
            </div>
            {activeMode === 'custom' && <Badge icon={CheckCircle2} variant="info">SELECTED</Badge>}
          </div>

          {fileDetails ? (
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#F4F4F6', fontWeight: 600, marginBottom: '4px' }}>
                <span>✓ {fileDetails.name}</span>
                <span style={{ color: '#10B981' }}>{fileDetails.size}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                <span>{fileDetails.format}</span>
                <span>{fileDetails.rowCount}</span>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Upload flow CSV exports or raw PCAP files. Automatically mapped to the 22-feature canonical contract.
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <label
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: 'pointer',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <UploadCloud size={14} />
              {selectedFile ? 'Change File' : 'Choose CSV / PCAP'}
              <input type="file" accept=".csv,.pcap,.pcapng" onChange={handleFileSelect} style={{ display: 'none' }} />
            </label>

            <a
              href="/sample_traffic.csv"
              download="sample_traffic.csv"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                padding: '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Download size={14} /> Sample CSV
            </a>
          </div>
        </div>
      </div>

      {/* Execution Controls Bar */}
      <GlassCard className="forecast-controls" style={{ padding: '20px 24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          {/* Slider K */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
            <Sliders size={18} color="#06B6D4" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>FORWARD SIMULATION HORIZON (K):</span>
                <span style={{ color: '#06B6D4', fontWeight: 700 }}>K = {kSteps} windows</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={kSteps}
                onChange={(e) => setKSteps(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#06B6D4', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Engine Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>ENGINE:</span>
            <select
              value={modelMode}
              onChange={(e) => setModelMode(e.target.value)}
              style={{
                backgroundColor: '#000000',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              <option value="Validated real-data LSTM artifact">Validated real-data LSTM artifact (Official 2018)</option>
              <option value="Transparent offline scorer">Transparent offline scorer (Heuristic fallback)</option>
            </select>
          </div>

          {/* Run Forecast Action Button */}
          <button
            onClick={() => runForecastExecution(activeMode, selectedFile)}
            disabled={isExecuting}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#000000',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: '14px',
              padding: '12px 28px',
              borderRadius: '8px',
              border: 'none',
              cursor: isExecuting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)',
              opacity: isExecuting ? 0.6 : 1,
            }}
          >
            {isExecuting ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            {isExecuting ? 'ANALYZING TELEMETRY...' : '⚡ RUN FORECAST'}
          </button>
        </div>
      </GlassCard>

      {/* Error Message */}
      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', border: '1px solid #F43F5E', borderRadius: '8px', padding: '14px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#F4F4F6' }}>
          <AlertTriangle size={18} color="#F43F5E" />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px' }}>{errorMsg}</span>
        </div>
      )}

      {/* Controlled Progress State Overlay */}
      {isExecuting && (
        <GlassCard style={{ padding: '24px', marginBottom: '32px', border: '1px solid #06B6D4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <RefreshCw size={18} color="#06B6D4" className="spin" />
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Executing PyTorch Temporal World Model Simulation...
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            {executionPhases.map((phase, idx) => {
              const isDone = idx < executionStep;
              const isCurrent = idx === executionStep;
              return (
                <div
                  key={phase}
                  style={{
                    backgroundColor: isDone ? 'rgba(16, 185, 129, 0.1)' : isCurrent ? 'rgba(6, 182, 212, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: isDone ? '1px solid #10B981' : isCurrent ? '1px solid #06B6D4' : '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: isDone ? '#10B981' : isCurrent ? '#06B6D4' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {isDone ? <CheckCircle2 size={12} color="#10B981" /> : isCurrent ? <RefreshCw size={12} className="spin" color="#06B6D4" /> : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--text-muted)' }} />}
                  <span>0{idx + 1} {phase}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
      )}

      {/* Forecast Analyst Results Dashboard */}
      {forecastData && !isExecuting && (
        <div className="forecast-results" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Summary Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <GlassCard style={{ padding: '16px 20px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                PEAK INFILTRATION RISK
              </span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: forecastData.peak_risk >= 0.5 ? '#F87171' : '#10B981', marginTop: '4px' }}>
                {(forecastData.peak_risk * 100).toFixed(1)}%
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Maximum projected risk over K steps
              </span>
            </GlassCard>

            <GlassCard style={{ padding: '16px 20px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                PREDICTED MITRE STAGE
              </span>
              <div style={{ marginTop: '6px' }}>
                <Badge icon={Layers} variant={forecastData.predicted_stage === 'Exfiltration' ? 'danger' : 'warning'}>
                  {forecastData.predicted_stage.toUpperCase()}
                </Badge>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                Mapped kill-chain stage trajectory
              </span>
            </GlassCard>

            <GlassCard style={{ padding: '16px 20px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                SIMULATION HORIZON
              </span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: '#F4F4F6', marginTop: '4px' }}>
                K = {kSteps}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Forward time windows evaluated
              </span>
            </GlassCard>

            <GlassCard style={{ padding: '16px 20px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                FLAGGED FLOW RECORDS
              </span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: '#FBBF24', marginTop: '4px' }}>
                {forecastData.flagged_flows?.length || 0}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                Flows exceeding local 55% threshold
              </span>
            </GlassCard>
          </div>

          {/* Risk Timeline Hero Visualization */}
          <GlassCard style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Forward Infiltration Probability Timeline
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  P(S_{'{t+k}'} \mid S_t) rollout trajectory over K={kSteps} future time steps
                </span>
              </div>
              <Badge variant="accent">MODEL: {forecastData.model_source?.slice(0, 35)}...</Badge>
            </div>

            {/* Custom SVG High-Contrast Timeline Chart */}
            <div style={{ width: '100%', height: '220px', position: 'relative', marginTop: '12px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map((yVal) => (
                  <line key={yVal} x1="40" y1={yVal} x2="780" y2={yVal} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                ))}

                {/* Plot Area */}
                {(() => {
                  const points = forecastData.timeline.map((item, idx) => {
                    const x = 40 + (idx / Math.max(1, forecastData.timeline.length - 1)) * 740;
                    const y = 180 - (item.infiltration_probability * 160);
                    return { x, y, prob: item.infiltration_probability, step: item.forecast_step };
                  });

                  const pathD = points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
                  const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#riskGrad)" />
                      <path d={pathD} fill="none" stroke="#F87171" strokeWidth="3" />
                      {points.map((pt) => (
                        <g key={pt.step}>
                          <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#F87171" strokeWidth="3" />
                          <text x={pt.x} y={pt.y - 12} fill="#F4F4F6" fontSize="10" fontFamily="monospace" textAnchor="middle">
                            {(pt.prob * 100).toFixed(1)}%
                          </text>
                          <text x={pt.x} y="195" fill="#8A8A93" fontSize="10" fontFamily="monospace" textAnchor="middle">
                            T+{pt.step}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </GlassCard>

          {/* Predicted Attack Progression Chain */}
          <GlassCard style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Predicted Attack Stage Progression (MITRE ATT&amp;CK Mapping)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {mitreStagesList.map((stage, idx) => {
                const trajectory = forecastData.stage_trajectory || [forecastData.predicted_stage];
                const trajectorySteps = trajectory.reduce((steps, value, step) => {
                  if (value?.toLowerCase() === stage.name.toLowerCase()) steps.push(step + 1);
                  return steps;
                }, []);
                const isActive = trajectorySteps.length > 0;
                return (
                  <div
                    key={stage.id}
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.3)',
                      border: isActive ? `2px solid ${stage.color}` : '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '14px',
                      boxShadow: isActive ? `0 0 16px ${stage.color}33` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>0{idx + 1} // {stage.id}</span>
                      {isActive && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: stage.color }} />}
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 700, color: isActive ? stage.color : '#F4F4F6' }}>
                      {stage.name}
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isActive ? stage.color : 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      {isActive ? `FORECAST T+${trajectorySteps.join(', T+')}` : 'NOT IN FORECAST TRAJECTORY'}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Why Defender Flagged This (Feature Attribution) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <GlassCard style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                Why Defender Flagged This
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                Perturbation-based feature attribution ($\Delta P$ sensitivity analysis on PyTorch model window).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {forecastData.explanations?.slice(0, 6).map((item) => (
                  <div key={item.feature}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '4px' }}>
                      <span style={{ color: '#F4F4F6' }}>{item.feature}</span>
                      <span style={{ color: '#10B981' }}>+{Number(item.contribution).toFixed(4)}</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.max(8, Math.abs(item.contribution) * 200))}%`, backgroundColor: '#10B981' }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Flagged Flow Records Table */}
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  High-Risk Flagged Flows
                </h3>
                <div style={{ position: 'relative', width: '160px' }}>
                  <input
                    type="text"
                    placeholder="Search flow..."
                    value={flowSearchQuery}
                    onChange={(e) => setFlowSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#000000',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '4px 8px 4px 24px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: '#F4F4F6',
                    }}
                  />
                  <Search size={10} color="var(--text-muted)" style={{ position: 'absolute', left: 8, top: 7 }} />
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '220px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '11px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '6px' }}>INDEX</th>
                      <th style={{ padding: '6px' }}>RISK PROB</th>
                      <th style={{ padding: '6px' }}>STAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFlows.length > 0 ? (
                      filteredFlows.slice(0, 10).map((row) => (
                        <tr key={row.flow_index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#F4F4F6' }}>
                          <td style={{ padding: '6px' }}>Flow #{row.flow_index}</td>
                          <td style={{ padding: '6px', color: '#F87171', fontWeight: 600 }}>
                            {(row.infiltration_probability * 100).toFixed(1)}%
                          </td>
                          <td style={{ padding: '6px' }}>{row.predicted_stage}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                          No flagged flows matching query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>

          {/* Progressive Disclosure: Technical Details Accordion */}
          <GlassCard style={{ padding: '20px 24px' }}>
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#06B6D4" />
                View Technical Details &amp; Mathematical Specification
              </div>
              {showTechnicalDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showTechnicalDetails && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div>
                    <h4 style={{ color: '#F4F4F6', margin: '0 0 8px', fontSize: '12px' }}>NETWORK STATE S_t CONTRACT</h4>
                    <p style={{ margin: 0 }}>
                      22-dimensional canonical feature vector combining 17 Flow-Level IPFIX fields (source/dest ports, TCP flags bitmask, duration, IAT mean/var, bytes, packets) and 5 Packet-Level PCAP fields (TTL mean/var, TCP window, payload size, retransmission count).
                    </p>
                  </div>
                  <div>
                    <h4 style={{ color: '#F4F4F6', margin: '0 0 8px', fontSize: '12px' }}>PYTORCH LSTM ARCHITECTURE</h4>
                    <p style={{ margin: 0 }}>
                      2-Layer LSTM Encoder (hidden_size=64, dropout=0.1) over window size W=10. Dual heads: Linear next-state head $\hat{S}_{t+1}$ and Sigmoid hazard head $P(\text{malicious})$. Autoregressive loop feeds predicted next state back into input window.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

        </div>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ForecastWorkspace;
