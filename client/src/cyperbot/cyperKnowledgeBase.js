// CYPER's offline knowledge base for the Defender MVP.
// Keep answers grounded in the repository's actual README, canonical feature
// contract, forecast workspace, and technical specification. This is local,
// auditable product knowledge: no API key or network call is needed to answer.

export const MODEL_FEATURES = [
  'source_port', 'destination_port', 'protocol_number', 'tcp_flag_bitmask',
  'tcp_syn', 'tcp_ack', 'tcp_fin', 'tcp_rst', 'tcp_psh', 'tcp_urg',
  'bytes_per_flow', 'packets_per_flow', 'flow_duration_ms', 'iat_mean_ms',
  'iat_variance_ms', 'iat_max_ms', 'bidirectional_flow_ratio',
  'ttl_mean', 'ttl_variance', 'tcp_window_mean', 'payload_size_mean',
  'retransmission_count',
];

export const MITRE_STAGES = [
  { name: 'Reconnaissance', id: 'TA0043', aliases: ['recon', 'scanning', 'probing'] },
  { name: 'Initial Access', id: 'TA0001', aliases: ['initial access', 'foothold', 'entry'] },
  { name: 'Lateral Movement', id: 'TA0008', aliases: ['lateral', 'east west', 'internal movement'] },
  { name: 'Command & Control', id: 'TA0011', aliases: ['c2', 'command and control', 'command & control', 'beaconing'] },
  { name: 'Exfiltration', id: 'TA0010', aliases: ['data theft', 'data exfil', 'egress'] },
];

const FEATURE_ANSWERS = {
  source_port: 'source_port is the port on the originating host. It helps distinguish client/server roles and recurring service patterns.',
  destination_port: 'destination_port is the port the flow targets, such as 443 for HTTPS or 22 for SSH. Unusual or repeatedly targeted ports can support scanning or exploitation signals.',
  protocol_number: 'protocol_number identifies the transport protocol used by the flow, such as TCP or UDP. It gives the model context for interpreting flags, packet counts, and timing.',
  tcp_flag_bitmask: 'tcp_flag_bitmask packs the TCP control flags into one value: SYN, ACK, FIN, RST, PSH, and URG. The combination is more informative than looking at one flag in isolation.',
  tcp_syn: 'tcp_syn records whether a SYN packet appeared in the flow. Many SYNs without completed handshakes can be consistent with scanning or a SYN-flood pattern.',
  tcp_ack: 'tcp_ack records whether an ACK packet appeared. A normal established conversation usually has acknowledgements; many SYNs with few ACKs may indicate one-sided probing.',
  tcp_fin: 'tcp_fin records a graceful TCP close. It helps separate normal completed conversations from abrupt or incomplete sessions.',
  tcp_rst: 'tcp_rst records an abrupt TCP reset. Repeated resets can occur when a scan hits closed ports or a service rejects connections.',
  tcp_psh: 'tcp_psh records the push flag, which asks the receiver to deliver buffered data to the application promptly. It can help identify interactive or bursty sessions.',
  tcp_urg: 'tcp_urg records the urgent flag. It is uncommon in ordinary traffic, so unusual use can become a useful contextual signal.',
  bytes_per_flow: 'bytes_per_flow is the total volume transferred in the flow. Large outbound volumes can support an exfiltration hypothesis, while tiny repeated flows can support scanning or beaconing patterns.',
  packets_per_flow: 'packets_per_flow counts packets in the flow. It gives the model scale and helps distinguish short probes from sustained conversations.',
  flow_duration_ms: 'flow_duration_ms is the elapsed duration from the first to the last packet. Very short repeated flows can look like scanning; long regular sessions can be consistent with persistence or C2.',
  iat_mean_ms: 'iat_mean_ms is the average inter-arrival time between packets. Timing helps separate human traffic from scripted or automated behavior.',
  iat_variance_ms: 'iat_variance_ms measures how variable packet gaps are. Very regular gaps can be consistent with automated beaconing, while high variance may indicate bursty activity.',
  iat_max_ms: 'iat_max_ms is the largest observed gap between packets. It helps describe pauses, idle periods, and the rhythm of a flow.',
  bidirectional_flow_ratio: 'bidirectional_flow_ratio describes how much of the flow is traveling in the forward direction relative to the total. A one-sided flow may look different from a balanced request/response conversation.',
  ttl_mean: 'ttl_mean is the average IP time-to-live observed in packet telemetry. It can provide a coarse clue about path and host behavior.',
  ttl_variance: 'ttl_variance measures how much observed TTL values vary. Variation can help identify changing paths, hosts, or unusual packet behavior.',
  tcp_window_mean: 'tcp_window_mean is the average TCP receive-window size. It provides transport-level context about how the conversation is being conducted.',
  payload_size_mean: 'payload_size_mean is the average amount of application payload per packet. It helps distinguish control-heavy flows from data-heavy transfers.',
  retransmission_count: 'retransmission_count counts packets resent because delivery was not acknowledged. It can indicate loss, congestion, or suspicious transport behavior when combined with other signals.',
};

export const KNOWLEDGE_BASE = [
  {
    id: 'greeting',
    category: 'smalltalk',
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
    answer: "I'm CYPER, Defender's local analyst guide. I can explain the forecast, state-transition dynamics, MITRE ATT&CK stages, features, outputs, and how to demo the MVP to judges.",
  },
  {
    id: 'thanks',
    category: 'smalltalk',
    keywords: ['thanks', 'thank you', 'thx', 'appreciate it'],
    answer: 'You are welcome. Ask me to explain any part of Defender in simple terms or with technical detail.',
  },
  {
    id: 'what_is_cyper',
    category: 'overview',
    keywords: ['what is cyper', 'who is cyper', 'cyper bot', 'cyper assistant', 'who are you', 'what are you', 'cyber chat', 'chatbot'],
    answer: '**CYPER is Defender’s local analyst guide.** I live in the **Cyber Chat** workspace tab — a built-in Defender feature, not a separate app. I answer from an auditable offline knowledge layer via Defender’s local `/api/v1/cyper/chat` endpoint, with the same brain available in the browser if the API is offline. After you run a forecast, I can also explain the live predicted stage, peak risk, timeline, and contributing features.',
  },
  {
    id: 'identity',
    category: 'overview',
    keywords: ['what is defender', 'what does defender do', 'explain defender', 'purpose of defender', 'what is this website', 'what is this app', 'what is this system'],
    answer: '**Defender is an AI-based network attack forecasting system.** Instead of only asking whether one packet or flow is malicious, it models how network behavior evolves over time and forecasts the likely next state and infiltration progression over the next K time windows. It combines React/Vite, an Express API, and a PyTorch temporal LSTM engine in an offline analyst workspace.',
  },
  {
    id: 'predictive_defense',
    category: 'overview',
    keywords: ['why predictive', 'predictive defense', 'why forecast attacks', 'traditional ids', 'intrusion detection versus', 'classification versus forecasting'],
    answer: 'Traditional IDS logic often gives a static verdict on an individual packet or flow. Defender adds a temporal question: **given the observed state S_t, where is the network heading next?** That can provide lead time to investigate or isolate systems before an intrusion completes. It is a forecasting aid, not a replacement for analyst judgment.',
  },
  {
    id: 'help',
    category: 'help',
    keywords: ['help', 'what can you do', 'what can i ask', 'capabilities', 'show me examples', 'how do i ask'],
    answer: '**Try questions like:**\n\n• What are the dynamics?\n• Explain P(S_{t+1} | S_t).\n• What is the forward simulation horizon?\n• How does a forecast run?\n• What are the 22 features?\n• Explain MITRE ATT&CK.\n• What is lateral movement or C2?\n• What do the timeline and flagged flows mean?\n• What should I tell a judge about Defender?\n\nI answer from the MVP’s local documentation and live forecast context when available.',
  },
  {
    id: 'judge_pitch',
    category: 'judges',
    keywords: ['what should i tell judges', 'explain to judges', 'judge explanation', 'pitch defender', 'one minute explanation', 'elevator pitch', 'why is this mvp useful'],
    answer: '**Judge-ready explanation:** Defender is a predictive network-defense MVP. It ingests flow or packet telemetry, converts it into a canonical 22-dimensional network state, uses a two-layer PyTorch LSTM to learn state-transition dynamics, rolls the predicted state forward for K future windows, maps the resulting risk trajectory to MITRE ATT&CK stages, and exposes feature attributions and flagged flows so the result is inspectable. The key distinction is forecasting attack progression rather than only labeling the current flow.',
  },
  {
    id: 'how_forecast_runs',
    category: 'forecast',
    keywords: ['how does forecast run', 'how forecast runs', 'forecast pipeline', 'run forecast', 'what happens when i run', 'forecast process', 'how does prediction run', 'how is forecast calculated'],
    answer: '**A Defender forecast runs in five stages:**\n\n1. **Ingest:** read bundled demo traffic or an uploaded CSV/PCAP.\n2. **Canonicalize:** validate and convert telemetry into the shared 22-feature contract.\n3. **Encode:** process the last W=10 state snapshots with a two-layer PyTorch LSTM.\n4. **Roll out:** predict the next state and hazard, feed the predicted state back in, and repeat for K future windows.\n5. **Explain:** render the probability timeline, predicted MITRE stage, feature attributions, flagged flows, and reliability metadata.\n\nThe UI animates these stages while the Express endpoint invokes the Python forecasting bridge. If the backend is unavailable, the MVP has a resilient local demo result so the walkthrough remains usable.',
  },
  {
    id: 'dynamics',
    category: 'model',
    keywords: ['dynamics', 'state dynamics', 'network dynamics', 'temporal dynamics', 'state transition dynamics', 'learn dynamics', 'what does dynamics mean'],
    answer: '**Dynamics means how the network state changes over time.** Defender does not treat each flow as an isolated row. It observes a sequence of feature vectors and learns recurring transitions: which current patterns tend to be followed by which next patterns. In notation, it models **P(S_{t+1} | S_t)** — the estimated next-state behavior conditioned on the current observed state.',
  },
  {
    id: 'state_transition_math',
    category: 'model',
    keywords: ['p s t plus 1', 'p st plus 1', 'p(s', 'next state probability', 'conditional probability', 'what does p mean', 'state transition probability', 'probability of next state'],
    answer: '**P(S_{t+1} | S_t)** means “the estimated next network state given the current network state.” **S_t** is the current 22-dimensional feature vector; **S_{t+1}** is the next predicted vector; the vertical bar means “conditioned on.” In plain language: based on the recent traffic pattern, what is the most likely direction of network behavior in the next time window?',
  },
  {
    id: 'state_vector',
    category: 'model',
    keywords: ['state vector', 'what is st', '22 dimensional', '22 feature state', 'feature vector', 'network state'],
    answer: '**S_t is a 22-dimensional canonical network state.** It combines 17 flow-level features with 5 packet-level features. Each timestamped window becomes one numeric vector; the LSTM receives a sliding sequence of ten such snapshots so it can use both the current values and their recent evolution.',
  },
  {
    id: 'forward_horizon',
    category: 'model',
    keywords: ['forward simulation horizon', 'simulation horizon', 'forecast horizon', 'forward horizon', 'how far ahead', 'future horizon', 'k windows', 'k steps ahead', 'what is k'],
    answer: '**The forward simulation horizon is K future time windows.** If K=5, Defender produces predictions for t+1 through t+5. It is not necessarily five minutes or five packets: K counts the configured forecast steps, while the real-world duration depends on the telemetry windowing and timestamps. A longer horizon can expose a broader trajectory but also accumulates more uncertainty.',
  },
  {
    id: 'k_step_rollout',
    category: 'model',
    keywords: ['k step', 'k-step', 'autoregressive', 'rollout', 'forward simulation', 'feed back', 'recursive forecast'],
    answer: '**K-step rollout is autoregressive simulation.** Step 1 predicts Ŝ_{t+1} and a hazard probability. Defender then feeds Ŝ_{t+1} back into the sequence window to predict Ŝ_{t+2}, and continues until K. The output is a trajectory [P₁, P₂, …, Pₖ], not just one isolated score. Because later steps depend on earlier predictions, uncertainty can compound with horizon length.',
  },
  {
    id: 'temporal_window',
    category: 'model',
    keywords: ['temporal window', 'sliding window', 'w equals 10', 'window of 10', 'last ten', 'sequence window', 'how much history'],
    answer: 'The model uses a **sliding temporal window of W=10 state snapshots**. That gives the LSTM recent history rather than only one row. As new telemetry arrives, the window moves forward and the model can learn whether behavior is stable, accelerating, periodic, or changing direction.',
  },
  {
    id: 'model_architecture',
    category: 'model',
    keywords: ['model architecture', 'what model', 'lstm', 'two layer lstm', 'dual head', 'pytorch model', 'hazard head', 'next state head'],
    answer: 'Defender uses a **two-layer PyTorch LSTM** with input size 22, hidden size 64, and dropout 0.1. It has two output heads: a linear next-state head that predicts Ŝ_{t+1}, and a sigmoid hazard head that estimates P(malicious). This separates “where the state is going” from “how hazardous the current transition is.”',
  },
  {
    id: 'hazard_probability',
    category: 'model',
    keywords: ['hazard', 'malicious probability', 'infiltration probability', 'probability score', 'risk score meaning', 'what does risk mean'],
    answer: 'The hazard head outputs an estimated probability of malicious activity for each simulated step. The interface presents the rollout as **infiltration probability** or risk. It is a model score conditioned on the telemetry and learned data distribution, not a proof that compromise occurred and not a calibrated guarantee of incident likelihood.',
  },
  {
    id: 'training_loss',
    category: 'model',
    keywords: ['loss function', 'training objective', 'mse', 'binary cross entropy', 'bce', 'how trained'],
    answer: 'The documented multi-step objective combines next-state fidelity and hazard classification: **L = L_state + λ·L_hazard**. The state term uses mean squared error for Ŝ_{t+1}; the hazard term uses binary cross-entropy for the malicious label. λ balances trajectory fidelity against hazard accuracy.',
  },
  {
    id: 'attck_overview',
    category: 'mitre',
    keywords: ['mitre', 'mitre attack', 'mitre attck', 'att&ck', 'attack framework', 'kill chain', 'stage mapping', 'what are the stages'],
    answer: '**MITRE ATT&CK is a public knowledge base of adversary tactics and techniques.** In this MVP, Defender uses five high-level stages as an analyst-friendly progression: **Reconnaissance (TA0043) → Initial Access (TA0001) → Lateral Movement (TA0008) → Command & Control (TA0011) → Exfiltration (TA0010)**. The stage is an interpretation of the forecast trajectory, not a claim that every ATT&CK technique has been identified.',
  },
  {
    id: 'reconnaissance',
    category: 'mitre',
    keywords: ['reconnaissance', 'recon', 'scanning', 'port scan', 'probing', 'ta0043'],
    answer: '**Reconnaissance (TA0043)** is the discovery phase: an actor probes hosts, ports, and services to learn what is reachable. Traffic clues can include many short flows, repeated destination-port attempts, and one-sided connections. Defender uses this as an early progression label, not as a definitive attribution of intent.',
  },
  {
    id: 'initial_access',
    category: 'mitre',
    keywords: ['initial access', 'initial-access', 'foothold', 'entry point', 'ta0001', 'first compromise'],
    answer: '**Initial Access (TA0001)** is the first foothold into the environment, for example exploitation of an exposed service or use of compromised credentials. In Defender, the label means the predicted traffic trajectory is consistent with a transition from discovery toward access; it does not identify the exact exploit or credential.',
  },
  {
    id: 'lateral_movement',
    category: 'mitre',
    keywords: ['lateral movement', 'lateral', 'east west', 'internal movement', 'host to host', 'ta0008'],
    answer: '**Lateral Movement (TA0008)** is movement from one compromised or accessed system to other internal systems. Network clues may include unusual east-west connections, new host-to-host relationships, or repeated internal service access. Defender maps trajectory behavior to this stage so analysts can inspect the contributing flows.',
  },
  {
    id: 'command_control',
    category: 'mitre',
    keywords: ['command and control', 'command & control', 'command control', 'c2', 'c and c', 'beaconing', 'ta0011'],
    answer: '**Command & Control (TA0011)** is communication between a compromised system and an attacker-controlled service for instructions or coordination. Periodic, low-volume, regular outbound connections can resemble beaconing. The stage is a behavioral mapping and should be validated against host and threat-intelligence evidence.',
  },
  {
    id: 'exfiltration',
    category: 'mitre',
    keywords: ['exfiltration', 'exfil', 'data theft', 'data exfil', 'outbound transfer', 'ta0010'],
    answer: '**Exfiltration (TA0010)** is the movement of collected data out of the environment. A large or unusual outbound transfer, especially after suspicious prior stages, can raise the forecast. The MVP’s probability and flagged-flow views help an analyst decide what to investigate; they do not prove that data was stolen.',
  },
  {
    id: 'feature_contract',
    category: 'features',
    keywords: ['22 features', 'feature contract', 'canonical contract', 'input features', 'flow features', 'packet features', 'what data does it use'],
    answer: '**The canonical input is 22 numeric features:** 17 flow-level fields — source/destination port, protocol number, TCP flag bitmask, SYN/ACK/FIN/RST/PSH/URG flags, bytes, packets, duration, IAT mean/variance/max, and bidirectional ratio — plus 5 packet-level fields — TTL mean/variance, TCP window mean, payload-size mean, and retransmission count. When packet telemetry is absent, those fields are recorded as unavailable rather than silently treated as real observations.',
  },
  {
    id: 'packet_vs_flow',
    category: 'features',
    keywords: ['flow level', 'packet level', 'difference between flow and packet', 'ipfix', 'pcap features', 'why pcap'],
    answer: 'Flow-level features summarize a conversation, such as ports, duration, bytes, packets, timing, and TCP flags. Packet-level features preserve lower-level clues from PCAP, such as TTL, TCP-window size, payload size, and retransmissions. Combining both levels gives the state vector richer context; a flow-only CSV can legitimately lack packet fields.',
  },
  {
    id: 'feature_attributions',
    category: 'explainability',
    keywords: ['feature attribution', 'attribution', 'explain prediction', 'why prediction', 'why flagged', 'which feature', 'explainability', 'shap'],
    answer: 'The attribution panel estimates how much each feature changed the forecast when it was perturbed or zeroed out. It is a perturbation-based contribution score — **not literally SHAP** — so it should be read as a local sensitivity explanation, not causal proof. The panel is designed to show why a particular result deserves attention.',
  },
  {
    id: 'timeline',
    category: 'outputs',
    keywords: ['timeline', 'probability timeline', 'risk curve', 'trajectory chart', 'chart show', 'rising line'],
    answer: 'The probability timeline plots infiltration probability for forecast steps 1 through K. Read left to right as the simulated future. A rising curve means the model’s rollout is becoming more hazardous across its learned state transitions; a flat or falling curve suggests less escalation under the simulated trajectory.',
  },
  {
    id: 'flagged_flows',
    category: 'outputs',
    keywords: ['flagged flows', 'flow table', 'which flows', 'suspicious flows', 'inspect flows'],
    answer: 'The flagged-flows table surfaces individual records that contribute most to the current risk view. Use it to move from the aggregate score back to concrete traffic evidence: flow index, predicted stage, probability, and the related feature signals. It is an investigation queue, not an automatic incident verdict.',
  },
  {
    id: 'predicted_stage',
    category: 'outputs',
    keywords: ['predicted stage', 'current stage', 'attack phase', 'stage result', 'what stage is it'],
    dynamic: 'stage',
  },
  {
    id: 'current_risk',
    category: 'outputs',
    keywords: ['current risk', 'risk score', 'peak risk', 'risk level', 'how risky', 'what is the risk', 'infiltration probability'],
    dynamic: 'risk',
  },
  {
    id: 'current_features',
    category: 'outputs',
    keywords: ['top features', 'what drives', 'what is driving', 'contributing features', 'why this forecast', 'why did it predict'],
    dynamic: 'features',
  },
  {
    id: 'current_summary',
    category: 'outputs',
    keywords: ['current forecast', 'forecast summary', 'summarize result', 'what is happening now', 'result summary', 'overview of result'],
    dynamic: 'summary',
  },
  {
    id: 'current_timeline',
    category: 'outputs',
    keywords: ['explain the timeline', 'timeline details', 'what does the chart mean', 'read the chart', 'forecast curve', 'screen timeline'],
    dynamic: 'timeline',
  },
  {
    id: 'current_flows',
    category: 'outputs',
    keywords: ['flagged flows', 'flagged records', 'which flows', 'flow table', 'high risk flows'],
    dynamic: 'flows',
  },
  {
    id: 'screen_explanation',
    category: 'outputs',
    keywords: ['explain the screen', 'explain what is on screen', 'read the screen', 'what am i seeing', 'explain the result screen', 'walk through the result'],
    dynamic: 'screen',
  },
  {
    id: 'reliability',
    category: 'outputs',
    keywords: ['reliability', 'confidence', 'novelty', 'defer', 'data quality', 'packet features available', 'should i trust'],
    answer: 'Reliability metadata tells you whether the input resembles the data contract used by the engine. Check row count, packet-feature availability, novelty fraction, and whether defer_recommended is true. Treat a high-novelty or packet-incomplete run as a prompt for analyst review, not as a reason to overstate certainty.',
  },
  {
    id: 'offline',
    category: 'security',
    keywords: ['offline', 'internet', 'cloud', 'does it need internet', 'data leave', 'privacy', 'security posture'],
    answer: 'The documented Defender forecast path is designed for offline operation: telemetry and inference stay on the local machine, with no cloud AI dependency. The web UI talks to the local Express/Python bridge. This local CYPER brain also answers without a network call, so a missing API key cannot make the assistant go silent.',
  },
  {
    id: 'upload',
    category: 'usage',
    keywords: ['upload', 'which file', 'file format', 'pcap or csv', 'csv or pcap', 'sample data'],
    answer: 'In Run Forecast, choose the bundled demo for a judge-friendly deterministic run, or select a **CSV flow export** or **PCAP** file. CSV is convenient for flow-level records; PCAP can provide packet-level features. The uploader validates the extension and the backend applies the canonicalization and safety checks.',
  },
  {
    id: 'console_walkthrough',
    category: 'usage',
    keywords: ['how to use', 'how do i use', 'walk me through', 'getting started', 'demo steps', 'show me the workflow', 'how does the console work'],
    answer: '**Judge demo path:**\n\n1. Enter Defender and open **Run Forecast**.\n2. Choose **MODE A — Quick Demo**.\n3. Run Defender Demo.\n4. Watch the pipeline progress through ingest, 22-feature extraction, LSTM inference, K-step rollout, MITRE mapping, and attribution.\n5. Read the timeline and predicted stage.\n6. Open explanations and flagged flows.\n7. Ask me to explain any panel while you present it.',
  },
  {
    id: 'ui_map',
    category: 'usage',
    keywords: ['sidebar', 'navigation', 'pages', 'tabs', 'website map', 'where do i click', 'workspace map', 'where is home', 'demo runner', 'how it works page', 'evidence page', 'technical details page', 'cyber chat'],
    answer: '**Defender MVP map:**\n\n• **Enter Defender** — entry portal with the binary-rain splash.\n• **Home** — product overview, badges, and jump-off CTAs.\n• **Demo Runner** — Normal vs Attack comparison walkthrough.\n• **Run Forecast** — ingest demo or CSV/PCAP, execute the LSTM, inspect timeline, ATT&CK stage, attributions, and flagged flows. Live results are mapped into Cyber Chat.\n• **How It Works** — 4-step pipeline plus MITRE ATT&CK explanation.\n• **Evidence & Benchmark** — CSE-CIC-IDS2018 cross-day metrics and honesty notes.\n• **Technical Details** — architecture, math spec, and limitations.\n• **Cyber Chat** — CYPER, the built-in analyst guide for this workspace.\n\nUse the left sidebar on desktop or the top menu on mobile.',
  },
  {
    id: 'limitations',
    category: 'honesty',
    keywords: ['limitations', 'caveat', 'caveats', 'false positives', 'benchmark', 'baseline', 'is it accurate', 'scientific honesty'],
    answer: 'The MVP is intentionally transparent about limitations. The documented cross-day CSE-CIC-IDS2018 benchmark shows the LSTM recovered more attack rows but also had a higher false-positive rate than the logistic baseline on that split. Forecasts are sensitive to distribution drift, missing packet telemetry, and longer-horizon error accumulation. Use Defender for prioritized investigation and lead time, not as an autonomous proof of compromise.',
  },
  {
    id: 'baseline',
    category: 'honesty',
    keywords: ['logistic regression', 'baseline comparison', 'compare baseline', 'benchmark result', 'f1', 'precision', 'recall'],
    answer: 'The baseline is logistic regression on the same feature contract without temporal memory. The README reports cross-day results: baseline F1 0.3649, precision 0.2673, recall 0.5744, false-positive rate 61.54%; LSTM F1 0.3492, precision 0.2456, recall 0.6037, false-positive rate 72.50%. The point is honest comparison: temporal modeling adds progression awareness, but it is not claimed to win every metric on every split.',
  },
  {
    id: 'not_medical_or_unrelated',
    category: 'scope',
    keywords: ['weather', 'recipe', 'football', 'movie', 'stock price', 'refund', 'password', 'personal advice'],
    answer: 'That is outside Defender’s domain. I am designed to explain this MVP, its forecast pipeline, MITRE ATT&CK mapping, telemetry features, and the results on screen. Ask me a Defender question and I will answer it directly.',
  },
];

export const CONSOLE_GUIDE_STEPS = [
  '1/5 — **Ingest telemetry:** choose the bundled demo or upload a CSV/PCAP file.',
  '2/5 — **Build the state:** Defender validates telemetry and constructs the canonical 22-feature state sequence.',
  '3/5 — **Run the model:** the two-layer LSTM processes the last W=10 snapshots and predicts next-state and hazard outputs.',
  '4/5 — **Roll forward:** predicted states are fed back for K future windows and mapped to the five MITRE stages.',
  '5/5 — **Inspect evidence:** use the timeline, feature attributions, reliability metadata, and flagged flows to explain the result.',
];

export { FEATURE_ANSWERS };

// FEATURE_ANSWERS existed before but was never wired into the response
// pipeline (cyperEngine.js never imported it) -- that's the root cause of
// "what is syn_flag" and similar plain-English feature questions
// returning the generic fallback instead of a real answer. Fixed here:
// an alias map from how a human actually asks, and old/superseded names
// (e.g. syn_flag, before the 22-feature canonical schema unified naming),
// to the real current MODEL_FEATURES key -- plus a matcher that checks
// this before falling through to the generic reply.
const FEATURE_ALIASES = {
  'source port': 'source_port', 'src port': 'source_port', 'src_port': 'source_port',
  'destination port': 'destination_port', 'dest port': 'destination_port', 'dst port': 'destination_port', 'dst_port': 'destination_port',
  'protocol': 'protocol_number', 'protocol number': 'protocol_number',
  'flag bitmask': 'tcp_flag_bitmask', 'tcp flags': 'tcp_flag_bitmask', 'flags bitmask': 'tcp_flag_bitmask',
  'syn flag': 'tcp_syn', 'syn_flag': 'tcp_syn', 'syn packet': 'tcp_syn',
  'ack flag': 'tcp_ack', 'ack_flag': 'tcp_ack', 'acknowledgement flag': 'tcp_ack',
  'fin flag': 'tcp_fin', 'fin_flag': 'tcp_fin', 'finish flag': 'tcp_fin',
  'rst flag': 'tcp_rst', 'rst_flag': 'tcp_rst', 'reset flag': 'tcp_rst',
  'psh flag': 'tcp_psh', 'psh_flag': 'tcp_psh', 'push flag': 'tcp_psh',
  'urg flag': 'tcp_urg', 'urg_flag': 'tcp_urg', 'urgent flag': 'tcp_urg',
  'bytes per flow': 'bytes_per_flow', 'bytes transferred': 'bytes_per_flow', 'byte count': 'bytes_per_flow',
  'packets per flow': 'packets_per_flow', 'packet count': 'packets_per_flow',
  'flow duration': 'flow_duration_ms', 'duration': 'flow_duration_ms',
  'iat mean': 'iat_mean_ms', 'inter arrival time mean': 'iat_mean_ms', 'average inter arrival': 'iat_mean_ms',
  'iat variance': 'iat_variance_ms', 'inter arrival variance': 'iat_variance_ms',
  'iat max': 'iat_max_ms', 'inter arrival max': 'iat_max_ms', 'largest gap': 'iat_max_ms',
  'bidirectional ratio': 'bidirectional_flow_ratio', 'bidir ratio': 'bidirectional_flow_ratio', 'flow ratio': 'bidirectional_flow_ratio',
  'ttl mean': 'ttl_mean', 'time to live': 'ttl_mean', 'time to live mean': 'ttl_mean',
  'ttl variance': 'ttl_variance', 'time to live variance': 'ttl_variance',
  'window mean': 'tcp_window_mean', 'window size': 'tcp_window_mean', 'tcp window': 'tcp_window_mean',
  'payload size': 'payload_size_mean', 'payload mean': 'payload_size_mean',
  'retransmission': 'retransmission_count', 'retransmissions': 'retransmission_count', 'retransmits': 'retransmission_count', 'retransmission count': 'retransmission_count',
};

function normalizeForFeatureMatch(text) {
  return String(text || '').toLowerCase().replace(/[^a-z0-9_\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Returns { key, answer } for the best-matching real feature, or null.
 * Checks exact canonical names first (longest first, so e.g. "tcp_syn"
 * isn't shadowed by a shorter partial match), then the natural-language
 * alias table above. */
export function matchFeatureQuestion(text) {
  const normalized = normalizeForFeatureMatch(text);
  if (!normalized) return null;

  const exactKeys = Object.keys(FEATURE_ANSWERS).sort((a, b) => b.length - a.length);
  for (const key of exactKeys) {
    if (normalized.includes(key)) return { key, answer: FEATURE_ANSWERS[key] };
  }

  const aliasPhrases = Object.keys(FEATURE_ALIASES).sort((a, b) => b.length - a.length);
  for (const phrase of aliasPhrases) {
    if (normalized.includes(phrase)) {
      const key = FEATURE_ALIASES[phrase];
      return { key, answer: FEATURE_ANSWERS[key] };
    }
  }

  return null;
}
