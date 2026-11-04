import React from 'react';

// Stylised panoramic X-ray. Positions of the three findings are fixed for the demo patient.
const MARKS = { '16': { x: 104, y: 53, kind: 'caries' }, '36': { x: 104, y: 147, kind: 'caries' }, '46': { x: 79, y: 141, kind: 'crown' } };

export default function Xray({ plan }) {
  const teeth = Array.from({ length: 14 }, (_, k) => {
    const x = 50 + k * 24.6;
    const s = Math.sin(((k + 0.5) / 14) * Math.PI);
    return { x, top: 70 - s * 34, bottom: 132 + s * 34 };
  });
  return (
    <svg className="xray" viewBox="0 0 440 200" role="img" aria-label="Panoramic X-ray with findings">
      <path d="M30 70 Q220 10 410 70" fill="none" stroke="var(--xray-fg)" strokeOpacity=".25" strokeWidth="40" />
      <path d="M30 135 Q220 195 410 135" fill="none" stroke="var(--xray-fg)" strokeOpacity=".25" strokeWidth="40" />
      {teeth.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.top - 16} width="18" height="34" rx="6" fill="var(--xray-fg)" fillOpacity=".55" />
          <rect x={t.x} y={t.bottom - 17} width="18" height="34" rx="6" fill="var(--xray-fg)" fillOpacity=".55" />
        </g>
      ))}
      {plan.map((p) => {
        const m = MARKS[p.tooth];
        if (!m) return null;
        const color = m.kind === 'crown' ? 'var(--mark-b)' : 'var(--mark-a)';
        const off = p.act === 'monitor';
        return (
          <g key={p.tooth} opacity={off ? 0.4 : 1}>
            <circle cx={m.x} cy={m.y} r="15" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={off ? '4 4' : undefined} />
            <text x={p.tooth === '46' ? 66 : m.x} y={m.y < 100 ? 27 : p.tooth === '46' ? 180 : 182} fill={color} fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono, monospace">{p.tooth}</text>
          </g>
        );
      })}
    </svg>
  );
}
