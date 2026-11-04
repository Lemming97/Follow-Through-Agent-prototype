import React, { useState } from 'react';
import { visitPlan } from '../domain/quote.js';

const SLOTS = [
  { day: 'Tue 17 Nov', time: '17:20' },
  { day: 'Thu 19 Nov', time: '17:40' },
  { day: 'Mon 23 Nov', time: '18:00' },
];

export default function Booking({ patient, pms, dispatch }) {
  const visits = visitPlan(patient.plan);
  const asked = SLOTS.findIndex((s) => `${s.day} ${s.time}` === patient.requestedSlot);
  const [sel, setSel] = useState(asked >= 0 ? asked : 1);
  if (!visits.length) return <p className="note">Nothing to book: the validated plan has no treatment.</p>;
  const first = visits[0];
  return (
    <>
      <p className="why"><b>Why this step:</b> 6 of 24 accepted quotes never become a treatment. The agent proposes slots that fit the sequence. In V1 the assistant confirms, because {pms.name} does not expose the calendar.</p>
      <section className="panel agent">
        <div className="ptitle"><h3>{patient.name} · {visits.length} visit{visits.length > 1 ? 's' : ''} to book</h3>
          <span className={`tag ${patient.status === 'accepted' || patient.status === 'booked' ? 'good' : ''}`}>{patient.status === 'booked' ? 'Booked' : patient.status === 'accepted' ? 'Quote accepted' : 'Waiting for acceptance'}</span>
        </div>
        <div className="note">{patient.requestedSlot ? `She asked for ${patient.requestedSlot} from her phone. ` : 'She asked for late afternoons. '} Visit 1: {first.label.toLowerCase()}, {first.minutes} min with Dr Lefèvre.</div>
        <div className="slots">
          {SLOTS.map((s, i) => (
            <button key={s.day} className={`slot ${i === sel ? 'sel' : ''}`} aria-pressed={i === sel} onClick={() => setSel(i)}>
              <span className="d1">{s.day}</span><span className="d2">{s.time} · {first.minutes} min · {first.label}</span>
            </button>
          ))}
        </div>
        {visits.length > 1 && (
          <ol className="visits">
            {visits.slice(1).map((v, i) => <li key={v.label}>Visit {i + 2}: {v.label}{v.weeksAfterPrevious ? `, ${v.weeksAfterPrevious} weeks after visit ${i + 1} for the lab` : ''}</li>)}
          </ol>
        )}
        <section className="panel muted">
          <div className="ptitle"><h3>Materials check</h3><span className="tag">Not in V1</span></div>
          <div className="note">Later version: the agent checks materials in stock and suggests a marketplace order. Left out of V1 on purpose.</div>
        </section>
        <div className={pms.integrated ? 'hint' : 'task'}>
          {pms.integrated
            ? `Confirming adds a booking request to ${pms.name}. Camille checks it in the calendar.`
            : `${pms.name} has no API: Camille enters the slot in the ${pms.name} calendar herself. The agent sends the patient the confirmation.`}
        </div>
        <div className="btns">
          <button className="b primary" onClick={() => dispatch({ type: 'BOOK', slot: `${SLOTS[sel].day} ${SLOTS[sel].time}` })}>Confirm visit 1</button>
          <button className="b" onClick={() => dispatch({ type: 'GO', step: 5 })}>See practice overview</button>
        </div>
      </section>
    </>
  );
}
