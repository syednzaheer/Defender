import { useMemo } from "react";

const nodes = [
  { label: "RECON", angle: -90, radius: 29, color: "#69d5ff", value: "0.91" },
  { label: "ACCESS", angle: -18, radius: 45, color: "#f3bd67", value: "0.68" },
  { label: "LATERAL", angle: 54, radius: 31, color: "#fb7f76", value: "0.55" },
  { label: "C2", angle: 126, radius: 44, color: "#d17cf5", value: "0.41" },
  { label: "EXFIL", angle: 198, radius: 29, color: "#f27a7a", value: "0.24" },
];

export default function DefenderRadar({ size = "small" }: { size?: "small" | "large" }) {
  const view = useMemo(() => {
    const cx = 160;
    const cy = 160;
    return nodes.map((node) => ({ ...node, x: cx + Math.cos((node.angle * Math.PI) / 180) * node.radius * 2.4, y: cy + Math.sin((node.angle * Math.PI) / 180) * node.radius * 2.4 }));
  }, []);
  return <div className={`radar ${size === "large" ? "radar-large" : ""}`}><svg viewBox="0 0 320 320" role="img" aria-label="Defender threat horizon radar">
    <defs><radialGradient id="radarFill"><stop offset="0%" stopColor="#54d8ff" stopOpacity=".14" /><stop offset="65%" stopColor="#54d8ff" stopOpacity=".04" /><stop offset="100%" stopColor="#54d8ff" stopOpacity="0" /></radialGradient><filter id="radarGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    <circle cx="160" cy="160" r="142" fill="url(#radarFill)" />
    {[44, 78, 112, 142].map((r) => <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="rgba(123,219,255,.16)" strokeDasharray={r === 142 ? "3 6" : "1 7"} />)}
    {[0, 45, 90, 135].map((deg) => <line key={deg} x1="160" y1="18" x2="160" y2="302" transform={`rotate(${deg} 160 160)`} stroke="rgba(123,219,255,.12)" />)}
    <path className="radar-sweep" d="M160 160 L160 18 A142 142 0 0 1 285 92 Z" fill="rgba(99,220,255,.1)" />
    <circle cx="160" cy="160" r="5" fill="#e8fbff" filter="url(#radarGlow)" />
    {view.map((node) => <g key={node.label}><line x1="160" y1="160" x2={node.x} y2={node.y} stroke={node.color} strokeOpacity=".26" strokeDasharray="2 5" /><circle cx={node.x} cy={node.y} r="9" fill={node.color} fillOpacity=".16" /><circle className="radar-node" cx={node.x} cy={node.y} r="4" fill={node.color} filter="url(#radarGlow)" /><text x={node.x + (node.x > 160 ? 12 : -12)} y={node.y - 10} textAnchor={node.x > 160 ? "start" : "end"} fill={node.color} fontSize="8" fontFamily="JetBrains Mono, monospace" letterSpacing="1">{node.label}</text><text x={node.x + (node.x > 160 ? 12 : -12)} y={node.y + 3} textAnchor={node.x > 160 ? "start" : "end"} fill="rgba(235,248,255,.55)" fontSize="8" fontFamily="JetBrains Mono, monospace">{node.value}</text></g>)}
  </svg><div className="radar-center-label"><span>THREAT</span><strong>0.74</strong><small>HORIZON SCORE</small></div></div>;
}
