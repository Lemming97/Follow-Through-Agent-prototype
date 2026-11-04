import React from 'react';

export default function BehindTheScenes({ state, patient, pms }) {
  return (
    <section className="panel">
      <div className="ptitle"><h3>Behind the scenes</h3><span className="tag agent">Agent log</span></div>
      <p className="note">What the agent and the practice do while Mrs Martin uses her phone. Everything she taps lands on Camille's board.</p>
      <div className="bts-status">
        <span className="note">Case status</span>
        <b>{patient.note}</b>
        <span className={`tag ${pms.integrated ? 'good' : 'warn'}`}>{pms.name}</span>
      </div>
      {state.tasks.map((t) => <div key={t.id} className="task"><span className="tag warn">Task for Camille</span>{t.text} · {t.due}</div>)}
      <ol className="bts-log">
        {state.log.length === 0 && <li className="note">Nothing yet. Open the SMS link on the phone.</li>}
        {state.log.map((l) => <li key={l.id}><span className="mono">{l.at}</span><span>{l.text}</span></li>)}
      </ol>
    </section>
  );
}
