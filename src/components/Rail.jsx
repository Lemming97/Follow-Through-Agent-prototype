import React from 'react';
import { STEPS } from '../domain/cases.js';
import { has } from '../domain/versions.js';

// Who does each step depends on the version and on the practice software.
export function stepLabel(i, version, pms) {
  const ops = version === 0;
  switch (i) {
    case 0: return [STEPS[0].title, ops ? 'Dentist checks Léa\'s draft' : 'Dentist, in the chair'];
    case 1:
      if (ops) return [`Type into ${pms.name}`, 'Léa, Allisone ops, by hand'];
      return pms.integrated ? [`Write to ${pms.name}`, 'Agent, on its own'] : [`Paste into ${pms.name}`, 'Assistant, 20 seconds'];
    case 2:
      if (ops) return ['Draft the quote', 'Léa drafts, assistant sends'];
      return has(version, 'autoQuote') ? ['Quote goes out', 'Agent, assistant can hold'] : [STEPS[2].title, 'Assistant, at the desk'];
    case 3: return [STEPS[3].title, ops ? 'Reminders sent by Léa' : 'Patient, at home'];
    case 4: return has(version, 'selfBooking') ? ['Patient books', 'Patient, on her phone'] : [STEPS[4].title, 'Assistant, at the desk'];
    default: return [STEPS[5].title, has(version, 'groups') ? 'Practice and group' : 'Whole team'];
  }
}

export default function Rail({ current, pms, version, onGo }) {
  return (
    <nav className="rail" aria-label="Journey steps">
      {STEPS.map((s, i) => {
        const [title, who] = stepLabel(i, version, pms);
        return (
          <button
            key={s.title}
            className={`step ${i === current ? 'on' : ''} ${i < current ? 'done' : ''}`}
            aria-current={i === current ? 'step' : undefined}
            onClick={() => onGo(i)}
          >
            <span className="n">{i < current ? '✓' : i + 1}</span>
            <span><span className="t">{title}</span><br /><span className="w">{who}</span></span>
          </button>
        );
      })}
    </nav>
  );
}
