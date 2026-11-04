import React from 'react';
import { buildQuote, euro } from '../domain/quote.js';
import { ACTS } from '../domain/acts.js';
import { has } from '../domain/versions.js';

export default function ApproveQuote({ patient, pms, version, dispatch }) {
  const auto = has(version, 'autoQuote');
  const crown = patient.plan.some((p) => ACTS[p.act].family === 'crown');
  const q = buildQuote(patient.plan);
  return (
    <>
      <p className="why"><b>Why this step:</b> 10 of 45 entered plans never get a quote. The agent drafts it from the validated plan at 2026 fees. The assistant approves the first sends until the practice trusts it.</p>
      <section className="panel agent">
        <div className="ptitle"><h3>Quote for {patient.name}</h3><span className={`tag ${version === 0 ? '' : 'agent'}`}>{version === 0 ? 'Drafted by Léa' : auto ? 'Auto-send on' : 'Ready to approve'}</span></div>
        {q.lines.length === 0 ? <p className="note">No treatment in the validated plan, so there is no quote to send.</p> : (
          <div className="tbl">
            <table>
              <thead><tr><th>Tooth</th><th>Act</th><th className="r">Fee</th><th className="r">Social security</th><th className="r">Mutuelle (est.)</th><th className="r">Patient</th></tr></thead>
              <tbody>
                {q.lines.map((l) => (
                  <tr key={l.tooth}>
                    <td><span className="tooth">{l.tooth}</span></td>
                    <td>{l.label}{ACTS[l.act].pricing === 'sante100' && <span className="tag good inline">100% Santé</span>}</td>
                    <td className="r">{euro(l.fee)}</td><td className="r">{euro(l.secu)}</td><td className="r">{euro(l.mutuelle)}</td><td className="r">{euro(l.patient)}</td>
                  </tr>
                ))}
                <tr className="tot"><td /><td>Total</td><td className="r">{euro(q.total.fee)}</td><td className="r">{euro(q.total.secu)}</td><td className="r">{euro(q.total.mutuelle)}</td><td className="r">{euro(q.total.patient)}</td></tr>
                <tr className="rest"><td /><td colSpan={4}>Left for {patient.name} to pay</td><td className="r">{euro(q.total.patient)}</td></tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="hint">Fillings at the national rate (60% social security). Crowns on a €120 base. Mutuelle share assumes a standard contrat responsable, up to 250% of the base on free price crowns.</div>
        {has(version, 'preApproval') && crown && (
          <div className="task"><span className="tag good">Sent</span>Mutuelle pre-approval request for the crown sent automatically. Answer usually within 48 hours.</div>
        )}
        {auto && (
          <div className="hint">This practice earned auto-send after 4 weeks with no quote corrections. Camille sees every quote and can hold any of them.</div>
        )}
        <div className="ptitle"><h3>Message to the patient</h3><span className="tag">SMS and email</span></div>
        <div className="sms"><div className="from">Cabinet du Dr Lefèvre</div>Hello {patient.name}, here is the plan Dr Lefèvre explained this morning, with your X-ray and your quote. You can accept it and pick your appointments from this link.</div>
        <div className="btns">
          <button className="b primary" disabled={!q.lines.length} onClick={() => dispatch({ type: 'SEND_QUOTE' })}>{auto ? 'Sent automatically · open' : 'Approve and send'}</button>
          <button className="b" onClick={() => dispatch({ type: 'GO', step: 0 })}>Back to the plan</button>
          <span className="hint">Quote {pms.integrated ? `also saved in ${pms.name}` : 'kept in Allisone, PMS A has no API'}</span>
        </div>
      </section>
    </>
  );
}
