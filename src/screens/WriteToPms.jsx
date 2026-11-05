import React, { useEffect, useState } from 'react';

export default function WriteToPms({ patient, pms, version, dispatch }) {
  if (version === 0) return <ByHand patient={patient} pms={pms} dispatch={dispatch} />;
  return pms.integrated
    ? <Integrated patient={patient} pms={pms} dispatch={dispatch} />
    : <CopyPack patient={patient} pms={pms} dispatch={dispatch} />;
}

function Integrated({ patient, pms, dispatch }) {
  const steps = pms.writeSteps(patient);
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= steps.length) { dispatch({ type: 'PMS_DONE' }); return; }
    const fast = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setDone((d) => d + 1), fast ? 120 : 600);
    return () => clearTimeout(t);
  }, [done]);
  const finished = done >= steps.length;
  return (
    <>
      <p className="why"><b>Why this step:</b> no one retypes the plan. The agent writes the approved content into the fields {pms.name} supports, then reads it back to check it landed correctly. If the patient match or the write is uncertain, nothing goes to the patient and a person takes over.</p>
      <div className="cols">
        <section className="panel">
          <div className="ptitle"><h3>Writing to {pms.name}</h3><span className={`tag ${finished ? 'good' : 'agent'}`}>{finished ? 'Verified' : 'In progress'}</span></div>
          <ul className="checks">
            {steps.map((s, i) => (
              <li key={s} className={i < done ? 'ok' : i === done ? 'run' : ''}>
                <span className="dot">{i < done ? '✓' : ''}</span><span>{s}</span>
                <span className="mono">{i < done ? `09:42:0${i + 1}` : ''}</span>
              </li>
            ))}
          </ul>
          <div className="hint">Every action is logged in the case history and can be undone for 24 hours.</div>
        </section>
        <section className="panel">
          <div className="ptitle"><h3>What the PMS now shows</h3><span className="tag">Read back</span></div>
          <pre className="pms">{finished ? pms.readBack(patient).join('\n') : 'Waiting for write…'}</pre>
          <div className="btns"><button className="b primary" disabled={!finished} onClick={() => dispatch({ type: 'GO', step: 2 })}>Continue to quote</button></div>
        </section>
      </div>
    </>
  );
}

function CopyPack({ patient, pms, dispatch }) {
  const text = pms.copyPack(patient);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch { setCopied(false); document.getElementById('copy-pack')?.select?.(); }
  };
  return (
    <>
      <p className="why"><b>Why this step:</b> {pms.name} has no API, so the agent cannot write into it. It prepares the plan in the right order to paste, then still runs quote and follow up on its own.</p>
      <div className="cols">
        <section className="panel agent">
          <div className="ptitle"><h3>Copy pack for {pms.name}</h3><span className="tag agent">Agent prepared</span></div>
          <textarea id="copy-pack" className="pms" readOnly rows={6} value={text} />
          <div className="btns">
            <button className="b primary" onClick={copy}>{copied ? 'Copied' : 'Copy plan'}</button>
            <span className="hint">About 20 seconds to paste, instead of 4 minutes to type.</span>
          </div>
        </section>
        <section className="panel">
          <div className="ptitle"><h3>Confirm in {pms.name}</h3><span className="tag warn">Not verified</span></div>
          <label className="check">
            <input id="pasted" type="checkbox" checked={pasted} onChange={(e) => setPasted(e.target.checked)} />
            Camille pasted the plan into {pms.name}
          </label>
          <div className="hint">Without an API the agent cannot read back. This is why the PMS A integration spike matters.</div>
          <div className="btns">
            <button className="b primary" disabled={!pasted} onClick={() => { dispatch({ type: 'PMS_DONE' }); dispatch({ type: 'GO', step: 2 }); }}>Continue to quote</button>
          </div>
        </section>
      </div>
    </>
  );
}

function ByHand({ patient, pms, dispatch }) {
  const steps = ['Open the patient file in ' + pms.name, 'Type the dental chart and the 3 acts', 'Attach the Allisone report', 'Note the time it took for the pilot log'];
  const [done, setDone] = useState([]);
  const toggle = (s) => setDone((d) => (d.includes(s) ? d.filter((x) => x !== s) : [...d, s]));
  return (
    <>
      <p className="why"><b>Why this step:</b> in V0 there is no code yet. Léa from Allisone ops types the plan into {pms.name} for the pilot practice. If treatments go up by 30%, it is worth building the agent.</p>
      <section className="panel">
        <div className="ptitle"><h3>Léa's checklist</h3><span className="tag">By hand · about 4 min</span></div>
        {steps.map((s) => (
          <label key={s} className="check"><input type="checkbox" id={'v0-' + s.slice(0, 12).replace(/\s/g, '-')} checked={done.includes(s)} onChange={() => toggle(s)} />{s}</label>
        ))}
        <div className="btns"><button className="b primary" disabled={done.length < steps.length} onClick={() => { dispatch({ type: 'PMS_DONE' }); dispatch({ type: 'GO', step: 2 }); }}>Continue to quote</button></div>
      </section>
    </>
  );
}
