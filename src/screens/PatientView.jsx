import React from 'react';
import Xray from '../components/Xray.jsx';
import { buildQuote, euro } from '../domain/quote.js';
import { ACTS } from '../domain/acts.js';

const plainWords = (p) => {
  const fam = ACTS[p.act].family;
  if (fam === 'filling') return { strong: `A small cavity (tooth ${p.tooth})`, rest: ': a filling, done in your first visit.' };
  if (fam === 'crown') return { strong: `A crown to replace (tooth ${p.tooth})`, rest: ': the old one no longer seals, which lets decay in. Two visits.' };
  return null;
};

const LATER = [
  { day: 'Day 10', text: 'Second reminder, mentions the crown risk' },
  { day: 'Day 14', text: "Added to Camille's call list with a call script" },
];

export default function PatientView({ state, patient, pms, dispatch }) {
  const q = buildQuote(patient.plan);
  const items = patient.plan.map(plainWords).filter(Boolean);
  const timeline = patient.timeline.length
    ? patient.timeline
    : [{ day: 'Mon', text: 'Quote not sent yet. Approve it in step 3.', done: false }];
  const asked = patient.status === 'call_needed';
  const decided = ['accepted', 'booked'].includes(patient.status);
  return (
    <>
      <p className="why"><b>Why this step:</b> 11 of 35 quotes are never accepted. {patient.name} gets a clear explanation she can reread at home, and the agent follows up so she does not forget.</p>
      <div className="phonewrap">
        <div className="phone" aria-label="Patient phone">
          <div className="sms"><div className="from">Mon 11:02 · Cabinet du Dr Lefèvre</div>Hello {patient.name}, here is the plan Dr Lefèvre explained this morning…</div>
          <div className="pcard">
            <b>Your treatment plan</b>
            <Xray plan={patient.plan} />
            {items.map((it) => <div key={it.strong}><b>{it.strong}</b>{it.rest}</div>)}
            <div className="note">Left for you to pay, with your mutuelle</div>
            <div className="big">{euro(q.total.patient).replace('.00', '')}</div>
            <button className="b primary" disabled={decided} onClick={() => dispatch({ type: 'ACCEPT' })}>{decided ? 'Accepted' : 'Accept and choose dates'}</button>
            <button className="b" disabled={asked || decided} onClick={() => dispatch({ type: 'ASK_QUESTION' })}>{asked ? 'Camille will call you back' : 'I have a question'}</button>
          </div>
          <div className="sms"><div className="from">Thu 18:00 · Reminder</div>Just a reminder that your plan is waiting for you. Reply STOP to opt out.</div>
        </div>

        <section className="panel">
          <div className="ptitle"><h3>Follow up, run by the agent</h3><span className="tag agent">Automatic</span></div>
          <ol className="tl">
            {timeline.map((t, i) => <li key={i} className={t.done ? 'ok' : ''}><span className="d">{t.day}</span><span className="m" /><span>{t.text}</span></li>)}
            {!decided && <li className="now"><span className="d">Now</span><span className="m" /><span><b>{asked ? 'Waiting for Camille to call back' : 'Waiting for her answer'}</b></span></li>}
            {!decided && LATER.map((t) => <li key={t.day} className="later"><span className="d">{t.day}</span><span className="m" /><span>{t.text}</span></li>)}
          </ol>
          {state.tasks.length > 0 && (
            <div className="task"><span className="tag warn">Task for Camille</span> {state.tasks.at(-1).text} · {state.tasks.at(-1).due}</div>
          )}
          <div className="hint">Follow up runs the same on any PMS: it lives in Allisone, not in {pms.name}. If she taps "I have a question", the agent does not answer clinical questions. It creates a call back task for the assistant.</div>
        </section>
      </div>
    </>
  );
}
