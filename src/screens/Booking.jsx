import React, { useState } from 'react';
import { visitPlan } from '../domain/quote.js';
import { has } from '../domain/versions.js';

const SLOTS = [
  { day: 'Tue 17 Nov', time: '17:20' },
  { day: 'Thu 19 Nov', time: '17:40' },
  { day: 'Mon 23 Nov', time: '18:00' },
];

export default function Booking({ patient, pms, version, dispatch }) {
  const self = has(version, 'selfBooking');
  const materials = has(version, 'materials');
  const visits = visitPlan(patient.plan);
  const asked = SLOTS.findIndex((s) => `${s.day} ${s.time}` === patient.requestedSlot);
  const [sel, setSel] = useState(asked >= 0 ? asked : 1);
  if (!visits.length) return <p className="note">Nothing to book: the validated plan has no treatment.</p>;
  const first = visits[0];
  return (
    <>
      <p className="why"><b>Why this step:</b> 6 of 24 accepted quotes never become a treatment. {self
          ? `From V2 Mrs Martin books herself from her phone, straight into the ${pms.name} calendar. Camille only handles exceptions.`
          : `The agent proposes slots that fit the sequence. The assistant confirms, because ${pms.name} does not expose the calendar yet.`}</p>
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
        {materials ? (
          <section className="panel">
            <div className="ptitle"><h3>Materials check</h3><span className="tag good">V3</span></div>
            <div className="mat"><span>Composite A2, for teeth {patient.plan.filter((p) => p.act.startsWith('comp')).map((p) => p.tooth).join(', ') || 'none'}</span><span className="tag good">In stock</span></div>
            <div className="mat"><span>Zirconia block, for tooth 46</span><span className="tag warn">1 left</span></div>
            <div className="btns"><button className="b" onClick={() => dispatch({ type: 'TOAST', text: 'Order placed on the Allisone marketplace, arrives Thursday' })}>Order zirconia blocks from the marketplace</button></div>
          </section>
        ) : (
          <section className="panel muted">
            <div className="ptitle"><h3>Materials check</h3><span className="tag">From V3</span></div>
            <div className="note">From V3 the agent checks materials in stock and suggests a marketplace order.</div>
          </section>
        )}
        {!self && <div className={pms.integrated ? 'hint' : 'task'}>
          {pms.integrated
            ? `Confirming adds a booking request to ${pms.name}. Camille checks it in the calendar.`
            : `${pms.name} has no API: Camille enters the slot in the ${pms.name} calendar herself. The agent sends the patient the confirmation.`}
        </div>}
        <div className="btns">
          <button className="b primary" onClick={() => dispatch({ type: 'BOOK', slot: `${SLOTS[sel].day} ${SLOTS[sel].time}` })}>{self ? 'Book for her (if she calls)' : 'Confirm visit 1'}</button>
          <button className="b" onClick={() => dispatch({ type: 'GO', step: 5 })}>See practice overview</button>
        </div>
      </section>
    </>
  );
}
