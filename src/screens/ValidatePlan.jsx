import React from 'react';
import Xray from '../components/Xray.jsx';
import { ACTS, OPTIONS } from '../domain/acts.js';
import { visitPlan } from '../domain/quote.js';
import { has } from '../domain/versions.js';

export default function ValidatePlan({ patient, pms, version, dispatch }) {
  const agent = has(version, 'agent');
  const monitored = patient.plan.filter((p) => p.act === 'monitor');
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
          <div className="ptitle"><h3>Draft treatment plan</h3><span className={`tag ${agent ? 'agent' : ''}`}>{agent ? 'Agent draft' : 'Drafted by Léa, by hand'}</span></div>
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
          {monitored.length > 0 && (
            <div className={has(version, 'recall') ? 'task' : 'hint'}>
              {has(version, 'recall')
                ? `Recall set: the agent will invite Mrs Martin back in 6 months to check tooth ${monitored.map((p) => p.tooth).join(', ')}.`
                : `Monitored teeth are not followed up yet. Recall arrives in V3.`}
            </div>
          )}
          <div className="hint">
            {!agent ? 'In V0 there is no agent: Léa from Allisone ops drafts this from the report, by hand, to test the value first. '
            : pms.integrated
              ? `Once validated, the agent writes the plan into ${pms.name} and checks it. Nobody retypes it.`
              : `${pms.name} has no API: once validated, the agent prepares the plan for Camille to paste in 20 seconds.`}
            {' '}Change any act and the quote updates on its own.
          </div>
        </section>
      </div>
    </>
  );
}
