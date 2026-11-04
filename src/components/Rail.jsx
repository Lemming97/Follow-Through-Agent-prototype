import React from 'react';
import { STEPS, PEOPLE } from '../domain/cases.js';

const whoLine = { dentist: 'Dentist, in the chair', agent: 'Agent, on its own', assistant: 'Assistant, at the desk', patient: 'Patient, at home' };

export default function Rail({ current, pms, onGo }) {
  return (
    <nav className="rail" aria-label="Journey steps">
      {STEPS.map((s, i) => (
        <button
          key={s.title}
          className={`step ${i === current ? 'on' : ''} ${i < current ? 'done' : ''}`}
          aria-current={i === current ? 'step' : undefined}
          onClick={() => onGo(i)}
        >
          <span className="n">{i < current ? '✓' : i + 1}</span>
          <span>
            <span className="t">{i === 1 && !pms.integrated ? `Paste into ${pms.name}` : i === 1 ? `Write to ${pms.name}` : s.title}</span>
            <br />
            <span className="w">{i === 5 ? 'Whole team' : i === 1 && !pms.integrated ? 'Assistant, 20 seconds' : whoLine[s.who] || PEOPLE[s.who].role}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}
