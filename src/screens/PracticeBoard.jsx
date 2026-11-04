import React from 'react';
import { BOARD_COLUMNS, REASONS } from '../domain/cases.js';
import { has } from '../domain/versions.js';

// Fictional practices in one dental group, for the V4 view.
const GROUP = [
  { name: 'Paris 11e (this practice)', pms: 'PMS B', entered: 85, treated: 27 },
  { name: 'Lyon Part-Dieu', pms: 'PMS C', entered: 82, treated: 26 },
  { name: 'Bordeaux Centre', pms: 'PMS A', entered: 74, treated: 23 },
  { name: 'Lille Vauban', pms: 'PMS E', entered: 88, treated: 29 },
];

export default function PracticeBoard({ state, pms, version, dispatch, compact }) {
  const totalReasons = Object.values(state.reasons).reduce((a, b) => a + b, 0);
  return (
    <>
      {!compact && <p className="why"><b>Why this step:</b> the team sees every open treatment in one place, and the practice owner sees the value. This is also the data Allisone needs to prove impact and retention.</p>}
      <div className="kpis">
        <div className="kpi"><div className="v">{pms.integrated ? '85%' : '75%'} <small>from 45%</small></div><div className="l">Lesions entered in {pms.name}, last 30 days</div></div>
        <div className="kpi"><div className="v">{pms.integrated ? '27' : '24'} <small>from 18</small></div><div className="l">Treatments started per 100 lesions</div></div>
        <div className="kpi"><div className="v">{pms.integrated ? '€1,420' : '€945'}</div><div className="l">Extra treatment fees this month, per dentist</div></div>
        <div className="kpi"><div className="v">{pms.integrated ? '55 min' : '1 h 05'}</div><div className="l">Assistant time a day on follow up, from 2 h</div></div>
      </div>
      <div className="note">{version === 0 ? 'V0 concierge target on 5 practices, measured by hand' : pms.integrated ? `${pms.name} pilot targets` : 'PMS A estimate: lower than PMS B because pasting still depends on the assistant'}, shown as example results, not real data. The board below is live: Mrs Martin moves as you go through the journey.</div>
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
      {has(version, 'groups') && (
        <section className="panel">
          <div className="ptitle"><h3>Across the group</h3><span className="tag good">V4</span></div>
          <div className="tbl"><table>
            <thead><tr><th>Practice</th><th>Software</th><th className="r">Entered in PMS</th><th className="r">Treated per 100</th></tr></thead>
            <tbody>{GROUP.map((g) => (
              <tr key={g.name}><td>{g.name}</td><td>{g.pms}</td><td className="r">{g.entered}%</td><td className="r">{g.treated}</td></tr>
            ))}</tbody>
          </table></div>
          <div className="hint">Example figures. The group sees which practices convert best and why, and Bordeaux on PMS A shows the gap an integration closes.</div>
        </section>
      )}
      {has(version, 'reasons') && <section className="panel">
        <div className="ptitle"><h3>Why patients wait</h3><span className="tag">Last 30 days · {totalReasons} answers</span></div>
        <div className="reasons">
          {Object.entries(REASONS).map(([id, label]) => (
            <div className="reason" key={id}>
              <span>{label}</span>
              <span className="reason-bar"><span style={{ width: `${(state.reasons[id] / totalReasons) * 100}%` }} /></span>
              <b>{state.reasons[id]}</b>
            </div>
          ))}
        </div>
        <div className="hint">Collected from the "Not now" button on the patient's phone. This fills the "reasons behind each drop" gap in today's data.</div>
      </section>}
      {state.tasks.length > 0 && (
        <section className="panel">
          <div className="ptitle"><h3>Camille's tasks</h3><span className="tag warn">{state.tasks.length} open</span></div>
          {state.tasks.map((t) => <div key={t.id} className="task">{t.text} · {t.due}</div>)}
        </section>
      )}
      {!compact && <div className="btns"><button className="b" onClick={() => dispatch({ type: 'RESET' })}>Replay the journey</button></div>}
    </>
  );
}
