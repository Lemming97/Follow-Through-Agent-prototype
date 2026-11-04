import React from 'react';
import { BOARD_COLUMNS } from '../domain/cases.js';

export default function PracticeBoard({ state, dispatch }) {
  return (
    <>
      <p className="why"><b>Why this step:</b> the team sees every open treatment in one place, and the practice owner sees the value. This is also the data Allisone needs to prove impact and retention.</p>
      <div className="kpis">
        <div className="kpi"><div className="v">85% <small>from 45%</small></div><div className="l">Lesions entered in the PMS, last 30 days</div></div>
        <div className="kpi"><div className="v">27 <small>from 18</small></div><div className="l">Treatments started per 100 lesions</div></div>
        <div className="kpi"><div className="v">€1,420</div><div className="l">Extra treatment fees this month, per dentist</div></div>
        <div className="kpi"><div className="v">55 min</div><div className="l">Assistant time a day on follow up, from 2 h</div></div>
      </div>
      <div className="note">Pilot targets shown as example results, not real data. The board below is live: Mrs Martin moves as you go through the journey.</div>
      <div className="board">
        {BOARD_COLUMNS.map((col) => {
          const cs = state.cases.filter((c) => c.status === col.id);
          return (
            <div className="colk" key={col.id}>
              <h4><span>{col.title}</span><span>{cs.length}</span></h4>
              {cs.map((c) => (
                <div key={c.id} className={`case ${c.id === 'martin' ? 'me' : ''}`}>
                  <b>{c.name}</b><span className={`s ${c.warn ? 'w' : ''}`}>{c.note}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {state.tasks.length > 0 && (
        <section className="panel">
          <div className="ptitle"><h3>Camille's tasks</h3><span className="tag warn">{state.tasks.length} open</span></div>
          {state.tasks.map((t) => <div key={t.id} className="task">{t.text} · {t.due}</div>)}
        </section>
      )}
      <div className="btns"><button className="b" onClick={() => dispatch({ type: 'RESET' })}>Replay the journey</button></div>
    </>
  );
}
