# Defender — Repository Architecture

## System Overview

Defender is an AI-based network attack forecasting system built for NTRO Problem Statement 26153 (SIH 2026). It uses temporal state-transition dynamics P(S_{t+1} | S_t) to predict how network activity may evolve before an attack fully develops.

## Directory Structure

```
MVP/
├── assets/
│   └── branding/
│       └── logo.png               # Defender brand logo asset
├── artifacts/                      # Trained model weights & benchmark outputs
│   ├── cross_day_benchmark/        # CSE-CIC-IDS2018 Wed→Thu cross-day artifacts
│   │   ├── cross_day_world_model_state_dict.pt
│   │   └── cross_day_model_config.json
│   └── world_model/                # Primary model artifacts
├── docs/                           # Project documentation
│   ├── architecture/               # This file and technical architecture docs
│   └── submission/                 # Final audit and submission materials
├── public/                         # Static assets served by Vite
│   ├── assets/branding/            # Public-facing logo
│   ├── logos/                      # SVG icon variants
│   └── sample_traffic.csv          # Downloadable demo dataset
├── scripts/                        # Training and evaluation scripts
│   ├── train_real_world_model.py   # LSTM world model training pipeline
│   ├── train_cross_day_real_benchmark.py  # Cross-day evaluation benchmark
│   └── smoke_real_adapter.py       # Quick adapter smoke test
├── server/                         # Express REST API + Python bridge
│   ├── index.js                    # Express API server (Port 4000)
│   └── bridge.py                   # Python bridge: Node ↔ PyTorch inference
├── src/                            # Core source code
│   ├── App.jsx                     # Root application component with routing
│   ├── main.jsx                    # Vite entry point
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── CyberMeshBackground.jsx    # Three.js wireframe wave background
│   │   │   └── CyberBinaryBackground.jsx  # Canvas binary digital rain (entry screen)
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Fixed top navigation bar
│   │   │   ├── MobileNav.jsx       # Mobile slide-out navigation
│   │   │   └── Footer.jsx          # Site footer
│   │   ├── sections/
│   │   │   ├── EntryPortal.jsx     # Entry/splash screen with "Enter Defender" CTA
│   │   │   ├── HeroSection.jsx     # Home hero with title, badges, and CTAs
│   │   │   ├── IntroSection.jsx    # Problem statement introduction
│   │   │   ├── FeaturesSection.jsx # Feature highlights grid
│   │   │   ├── LogoTicker.jsx      # Partner/technology logo ticker
│   │   │   ├── HowItWorksSection.jsx      # 4-step interactive pipeline + MITRE explanation
│   │   │   ├── DemoRunnerSection.jsx      # Normal vs Attack demo comparison
│   │   │   ├── ForecastWorkspace.jsx      # Full forecast workspace (upload/demo/results)
│   │   │   ├── EvidenceSection.jsx        # Empirical benchmark evidence display
│   │   │   └── TechnicalDetailsSection.jsx # Progressive-disclosure technical spec
│   │   └── ui/
│   │       ├── Badge.jsx           # Reusable badge/pill component
│   │       └── GlassCard.jsx       # Glassmorphism card component
│   ├── data/
│   │   └── telemetryConstants.js   # Shared SHAP attribution rankings
│   ├── defender/                   # Core Python package
│   │   ├── __init__.py
│   │   ├── cli.py                  # CLI entry point
│   │   ├── traffic.py              # CSV/PCAP telemetry ingestion
│   │   ├── forecasting.py          # Scoring engine and MITRE stage mapping
│   │   ├── integration_contract.py # 22-feature canonical contract
│   │   ├── world_model_adapter.py  # PyTorch LSTM inference adapter
│   │   └── reliability.py          # Input quality assessment
│   ├── pages/
│   │   └── Home.jsx                # Home page composition
│   └── styles/
│       └── globals.css             # Design system tokens and global styles
├── tests/                          # Pytest regression suite
│   ├── test_defender_console.py    # Core engine tests
│   └── test_integration_contract.py # Feature contract tests
├── pyproject.toml                  # Python package configuration
├── package.json                    # Node.js dependencies
├── vite.config.js                  # Vite build configuration
└── README.md                       # Project README
```

## Application Flow

```
Entry Portal (CyberBinaryBackground)
    ↓ [Enter Defender] button (450ms transition)
Command Center Home (CyberMeshBackground)
    ├── Demo Runner (Normal vs Attack comparison)
    ├── Run Forecast (upload CSV/PCAP → real PyTorch inference)
    ├── How It Works (4-step pipeline + MITRE ATT&CK explanation)
    ├── Evidence & Benchmark (CSE-CIC-IDS2018 cross-day results)
    └── Technical Details (model architecture, math spec, limitations)
```

## Backend Architecture

```
React Frontend (Vite, port 5173)
    ↓ POST /api/v1/forecast
Express API Server (Node.js, port 4000)
    ↓ child_process.spawn()
Python Bridge (server/bridge.py)
    ↓ imports from src/defender/
PyTorch LSTM Model (world_model_adapter.py)
    ↓ returns JSON
Express → React (forecast timeline, SHAP, MITRE mapping)
```

## Key Design Decisions

1. **Offline-first**: All inference runs locally with bundled model artifacts. No cloud dependency.
2. **Honest benchmarks**: Cross-day metrics (F1=0.35) are presented with full provenance, not inflated.
3. **Progressive disclosure**: Technical details are hidden behind accordion panels, not dumped on judges.
4. **Real model outputs**: The UI connects to actual PyTorch inference via Node→Python IPC, not mock data.
