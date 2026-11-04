import React from 'react';
import Xray from '../components/Xray.jsx';
import { ACTS, OPTIONS } from '../domain/acts.js';
import { visitPlan } from '../domain/quote.js';

export default function ValidatePlan({ patient, dispatch }) {
  const visits = visitPlan(patient.plan);
  const changed = (p) => (p.kind === 'caries' ? !p.act.startsWith('comp') : p.act !== 'crownZr');
  return (
    <>
      <p className="why"><b>Why this step:</b> today 55 of 100 detected lesions never reach the PMS. The agent drafts the plan so the dentist only has to check it.</p>
      <div className="cols">
        <section className="panel">
          <div className="ptitle"><h3>Allisone findings</h3><span className="tag">X-ray 09:31</span></div>
          <Xray plan={patient.plan} />
          <ul className="find">
            {patient.findings.map((f) => (
              <li key={f.tooth}><span className="tooth">{f.tooth}</span>{f.text}<span className="conf">{f.confidence}%</span></li>
            ))}
          </ul>
          <div className="src">From the voice report: <q>{patient.voiceReport}</q></div>
        </section>

        <section className="panel agent">
          <div className="ptitle"><h3>Draft treatment plan</h3><span className="tag agent">Agent draft</span></div>
          <div className="rows">
            {patient.plan.map((p) => (
              <div className="row" key={p.tooth}>
                <span className="tooth">{p.tooth}</span>
                <div style={{ minWidth: 0 }}>
                  <select
                    id={`act-${p.tooth}`}
                    aria-label={`Act for tooth ${p.tooth}`}
                    value={p.act}
                    onChange={(e) => dispatch({ type: 'SET_ACT', tooth: p.tooth, act: e.target.value })}
                  >
                    {OPTIONS[p.kind].map((id) => <option key={id} value={id}>{ACTS[id].label}</option>)}
                  </select>
                  <div className="sub">{patient.findings.find((f) => f.tooth === p.tooth).text}</div>
                </div>
                {p.act === 'monitor'
                  ? <span className="tag">Monitor</span>
                  : changed(p) ? <span className="tag warn">Edited</span> : <span className="tag good">Matches report</span>}
              </div>
            ))}
          </div>
          <div className="hint">
            {visits.length
              ? <>Sequence: {visits.map((v, i) => `visit ${i + 1} ${v.label.toLowerCase()}`).join(', ')}.</>
              : 'Nothing to treat. The patient will be added to recall.'}
          </div>
          <div className="btns">
            <button className="b primary" onClick={() => dispatch({ type: 'VALIDATE' })}>Validate plan</button>
            <button className="b" onClick={() => dispatch({ type: 'GO', step: 5 })}>Later</button>
          </div>
          <div className="hint">The agent never adds an act the dentist did not see. Change any act: the quote and the patient's price update on their own.</div>
        </section>
      </div>
    </>
  );
}
