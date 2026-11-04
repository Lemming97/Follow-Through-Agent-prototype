import React, { useState } from 'react';
import Xray from '../components/Xray.jsx';
import { ACTS } from '../domain/acts.js';
import { buildQuote, visitPlan, euro } from '../domain/quote.js';
import { REASONS } from '../domain/cases.js';

// What Mrs Martin sees on her phone after tapping the SMS link.
// Every action dispatches to the same state as the practice side, so the board updates live.

const SLOTS = [
  { day: 'Tue 17 Nov', time: '17:20' },
  { day: 'Thu 19 Nov', time: '17:40' },
  { day: 'Mon 23 Nov', time: '18:00' },
];

const EXPLAIN = {
  filling: {
    title: (t) => `A cavity on tooth ${t}`,
    seen: 'The X-ray shows decay that has gone through the enamel.',
    wait: 'If you wait, it can grow toward the nerve and need a root canal instead of a filling.',
    what: 'Numbing, cleaning the decay, then a tooth coloured filling. You can eat normally the same day.',
  },
  crown: {
    title: (t) => `Your crown on tooth ${t}`,
    seen: 'The edge of your old crown no longer seals, so bacteria can get underneath.',
    wait: 'If you wait, decay under the crown can reach the root and the tooth may be lost.',
    what: 'Visit 1: the old crown is removed and an impression taken. Two weeks later, the new crown is fitted.',
  },
};

const fmt = (c) => euro(c).replace('.00', '');

export default function PatientApp({ patient, pms, dispatch }) {
  const [screen, setScreen] = useState('sms');
  const [tooth, setTooth] = useState(null);
  const [slot, setSlot] = useState(0);
  const [topic, setTopic] = useState('the cost');
  const [reason, setReason] = useState('cost');

  const sent = !['to_validate', 'to_approve'].includes(patient.status) || patient.timeline.length > 0;
  const q = buildQuote(patient.plan);
  const treated = patient.plan.filter((p) => ACTS[p.act].family !== 'none');
  const visits = visitPlan(patient.plan);
  const booked = patient.status === 'booked';
  const requested = patient.requestedSlot;

  const go = (s) => { setScreen(s); document.getElementById('phone-scroll')?.scrollTo?.({ top: 0 }); };

  return (
    <div className="device" aria-label="Mrs Martin's phone">
      <div className="device-bar"><span>09:41</span><span className="device-notch" /><span>5G</span></div>
      <div className="device-screen" id="phone-scroll">
        {screen === 'sms' && (
          <div className="pt-pad">
            <div className="pt-thread-head"><span className="avatar">DL</span><b>Cabinet du Dr Lefèvre</b></div>
            {!sent ? (
              <div className="pt-empty">
                <p>No message yet. The practice has not sent the quote.</p>
                <button className="b primary" onClick={() => dispatch({ type: 'SEND_QUOTE', from: 'patient' })}>Skip ahead: the practice sends it</button>
              </div>
            ) : (
              <>
                <div className="bubble">Hello Mrs Martin, here is the plan Dr Lefèvre explained this morning, with your X-ray and your quote. <button className="linklike" onClick={() => go('plan')}>allisone.care/p/7KQ2</button></div>
                <div className="pt-time">Mon 11:02</div>
                {patient.timeline.some((t) => t.day === 'Day 3') && (
                  <>
                    <div className="bubble">Just a reminder that your plan is waiting for you. Reply STOP to opt out.</div>
                    <div className="pt-time">Thu 18:00</div>
                  </>
                )}
                {booked && (
                  <>
                    <div className="bubble ok">Your appointment is confirmed: {patient.slot} with Dr Lefèvre. We will remind you the day before.</div>
                    <div className="pt-time">Just now</div>
                  </>
                )}
                <button className="b primary full" onClick={() => go('plan')}>Open my treatment plan</button>
              </>
            )}
          </div>
        )}

        {screen === 'plan' && (
          <div className="pt-pad">
            <p className="pt-kicker">Your treatment plan</p>
            <h3 className="pt-h">Hello Mrs Martin</h3>
            <p className="pt-p">Dr Lefèvre found {treated.length} thing{treated.length > 1 ? 's' : ''} to treat. Tap a tooth to see what we saw.</p>
            <Xray plan={patient.plan} />
            <div className="pt-chips">
              {treated.map((p) => (
                <button key={p.tooth} className="pt-chip" onClick={() => { setTooth(p); go('tooth'); }}>
                  <span className="tooth">{p.tooth}</span>{ACTS[p.act].family === 'filling' ? 'A cavity' : 'Crown to replace'}
                  <span className="chev">›</span>
                </button>
              ))}
            </div>

            <div className="pt-card">
              <b>{visits.length} visit{visits.length > 1 ? 's' : ''}</b>
              <ol className="pt-visits">{visits.map((v) => <li key={v.label}>{v.label} · {v.minutes} min</li>)}</ol>
            </div>

            <div className="pt-card">
              <b>What it costs</b>
              <div className="pt-row"><span>Treatment</span><span>{fmt(q.total.fee)}</span></div>
              <div className="pt-row"><span>Social security pays</span><span>−{fmt(q.total.secu)}</span></div>
              <div className="pt-row"><span>Your mutuelle pays (estimate)</span><span>−{fmt(q.total.mutuelle)}</span></div>
              <div className="pt-row total"><span>You pay</span><span>{fmt(q.total.patient)}</span></div>
              {q.total.patient > 0
                ? <p className="pt-note">You can pay in 3 instalments of {fmt(Math.ceil(q.total.patient / 3))}.</p>
                : <p className="pt-note">Your crown is in the 100% Santé basket, so your mutuelle covers the rest.</p>}
            </div>

            {booked ? (
              <div className="pt-card ok"><b>Booked</b><span>{patient.slot}. See you then.</span></div>
            ) : requested ? (
              <div className="pt-card ok"><b>Thank you, plan accepted</b><span>You asked for {requested}. Camille will confirm by SMS within the hour.</span></div>
            ) : (
              <div className="pt-actions">
                <button className="b primary full" onClick={() => go('slots')}>Accept and choose a date</button>
                <button className="b full" onClick={() => go('question')}>I have a question</button>
                <button className="linklike center" onClick={() => go('notnow')}>Not now</button>
              </div>
            )}
          </div>
        )}

        {screen === 'tooth' && tooth && (
          <div className="pt-pad">
            <button className="linklike" onClick={() => go('plan')}>‹ Back to my plan</button>
            <p className="pt-kicker">Tooth {tooth.tooth}</p>
            <h3 className="pt-h">{EXPLAIN[ACTS[tooth.act].family].title(tooth.tooth)}</h3>
            <Xray plan={patient.plan.map((p) => (p.tooth === tooth.tooth ? p : { ...p, act: 'monitor' }))} />
            {['seen', 'wait', 'what'].map((k) => (
              <div className="pt-card" key={k}>
                <b>{{ seen: 'What we saw', wait: 'If you wait', what: 'What the treatment involves' }[k]}</b>
                <span>{EXPLAIN[ACTS[tooth.act].family][k]}</span>
              </div>
            ))}
            <p className="pt-note">Written by the practice from Dr Lefèvre's diagnosis. For anything else, ask a question and Camille will call you.</p>
          </div>
        )}

        {screen === 'slots' && (
          <div className="pt-pad">
            <button className="linklike" onClick={() => go('plan')}>‹ Back</button>
            <h3 className="pt-h">Choose your first visit</h3>
            <p className="pt-p">{visits[0]?.label}, {visits[0]?.minutes} minutes with Dr Lefèvre. Late afternoon, as you asked.</p>
            <div className="pt-slots">
              {SLOTS.map((s, i) => (
                <button key={s.day} className={`slot ${i === slot ? 'sel' : ''}`} aria-pressed={i === slot} onClick={() => setSlot(i)}>
                  <span className="d1">{s.day}</span><span className="d2">{s.time}</span>
                </button>
              ))}
            </div>
            <p className="pt-note">We will plan the crown visits with you after this one.</p>
            <button className="b primary full" onClick={() => { dispatch({ type: 'PATIENT_REQUEST_SLOT', slot: `${SLOTS[slot].day} ${SLOTS[slot].time}`, pms: pms.name }); go('done'); }}>
              Accept the quote and ask for this date
            </button>
          </div>
        )}

        {screen === 'done' && (
          <div className="pt-pad pt-center">
            <div className="pt-big-check">✓</div>
            <h3 className="pt-h">Thank you, Mrs Martin</h3>
            <p className="pt-p">You asked for {requested}. Camille will confirm by SMS within the hour.</p>
            <button className="b full" onClick={() => go('plan')}>Back to my plan</button>
          </div>
        )}

        {screen === 'question' && (
          <div className="pt-pad">
            <button className="linklike" onClick={() => go('plan')}>‹ Back</button>
            <h3 className="pt-h">Ask the practice</h3>
            <p className="pt-p">Camille will call you back today. What is it about?</p>
            <div className="pt-radios">
              {['the cost', 'pain or numbing', 'the timing', 'something else'].map((t) => (
                <label key={t} className={`pt-radio ${topic === t ? 'sel' : ''}`}>
                  <input type="radio" name="topic" id={`topic-${t.replace(/\s/g, '-')}`} checked={topic === t} onChange={() => setTopic(t)} />{t[0].toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
            <button className="b primary full" onClick={() => { dispatch({ type: 'ASK_QUESTION', topic }); go('asked'); }}>Ask for a call back</button>
          </div>
        )}

        {screen === 'asked' && (
          <div className="pt-pad pt-center">
            <div className="pt-big-check">✓</div>
            <h3 className="pt-h">Camille will call you</h3>
            <p className="pt-p">Today between 14:00 and 16:00, about {topic}.</p>
            <button className="b full" onClick={() => go('plan')}>Back to my plan</button>
          </div>
        )}

        {screen === 'notnow' && (
          <div className="pt-pad">
            <button className="linklike" onClick={() => go('plan')}>‹ Back</button>
            <h3 className="pt-h">No problem</h3>
            <p className="pt-p">Can you tell us why? It helps the practice help you.</p>
            <div className="pt-radios">
              {Object.entries(REASONS).map(([id, label]) => (
                <label key={id} className={`pt-radio ${reason === id ? 'sel' : ''}`}>
                  <input type="radio" name="reason" id={`reason-${id}`} checked={reason === id} onChange={() => setReason(id)} />{label}
                </label>
              ))}
            </div>
            <button className="b primary full" onClick={() => { dispatch({ type: 'PATIENT_NOT_NOW', reason, patientShare: q.total.patient }); go('later'); }}>Send</button>
          </div>
        )}

        {screen === 'later' && (
          <div className="pt-pad pt-center">
            <div className="pt-big-check soft">✓</div>
            <h3 className="pt-h">Thank you</h3>
            <p className="pt-p">
              {reason === 'cost' && (q.total.patient > 0 ? `We will send you the payment options. You can pay in 3 instalments of ${fmt(Math.ceil(q.total.patient / 3))}.` : 'Good news: with your mutuelle there is nothing left for you to pay. Camille will call to go through it with you.')}
              {reason === 'second' && 'We will send you your X-ray and report so you can share them.'}
              {(reason === 'think' || reason === 'timing') && 'Your plan stays here. We will check in with you in a few days.'}
            </p>
            <button className="b full" onClick={() => go('plan')}>Back to my plan</button>
          </div>
        )}
      </div>
    </div>
  );
}
