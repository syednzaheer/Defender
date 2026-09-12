import React from 'react';
import { Database, ShieldCheck, Cpu, GitCommit, FileSpreadsheet, Network, KeyRound, Bug, Landmark } from 'lucide-react';

const datasets = [
  { name: 'CIC-IDS2017', type: 'ADAPTER-READY — Official CIC', href: 'https://www.unb.ca/cic/datasets/ids-2017.html', icon: <Database size={18} color="#67e8f9" /> },
  { name: 'CSE-CIC-IDS2018', type: 'VERIFIED / RUNNABLE — AWS Open Data', href: 'https://registry.opendata.aws/cse-cic-ids2018/', icon: <Database size={18} color="#67e8f9" /> },
  { name: 'UNSW-NB15', type: 'ADAPTER-READY — UNSW Academic', href: 'https://research.unsw.edu.au/projects/unsw-nb15-dataset', icon: <Cpu size={18} color="#c4b5fd" /> },
  { name: 'CTU-13', type: 'ADAPTER-READY — Stratosphere', href: 'https://www.stratosphereips.org/datasets-ctu13', icon: <FileSpreadsheet size={18} color="#fbbf24" /> },
  { name: 'CICIoT2023', type: 'ADAPTER-READY — Official CIC', href: 'https://www.unb.ca/cic/datasets/iotdataset-2023.html', icon: <Network size={18} color="#34d399" /> },
  { name: 'LANL Authentication', type: 'REFERENCE ONLY — Request token / CC0', href: 'https://csr.lanl.gov/data/auth/', icon: <KeyRound size={18} color="#f472b6" /> },
  { name: 'DARPA IDS', type: 'REFERENCE ONLY — MIT Lincoln Lab', href: 'https://archive.ll.mit.edu/ideval/data/', icon: <Landmark size={18} color="#fb923c" /> },
  { name: 'MITRE ATT&CK + CAPEC', type: 'REFERENCE TAXONOMY — STIX / TAXII', href: 'https://attack.mitre.org/resources/attack-data-and-tools/', icon: <ShieldCheck size={18} color="#a78bfa" /> },
  { name: 'CVE/NVD + NCIIPC', type: 'REFERENCE TAXONOMY — Vulnerability intel', href: 'https://nvd.nist.gov/developers/vulnerabilities', icon: <Bug size={18} color="#f87171" /> },
];

const LogoTicker = () => (
  <section className="dataset-grid-section" aria-labelledby="dataset-grid-title">
    <div className="dataset-grid-kicker" id="dataset-grid-title">SUPPORTED DATASETS &amp; ATTACK BENCHMARK TAXONOMY (NTRO PS 26153)</div>
    <div className="dataset-grid">
      {datasets.map((item) => (
        <a className="dataset-grid-card" key={item.name} href={item.href} target="_blank" rel="noreferrer">
          <span className="dataset-grid-icon">{item.icon}</span>
          <span className="dataset-grid-copy"><strong>{item.name}</strong><small>{item.type}</small></span>
          <span className="dataset-grid-arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  </section>
);

export default LogoTicker;
