import React, { useEffect, useReducer } from 'react';
import { initialState, reducer, STEPS, PEOPLE, getMartin } from './domain/cases.js';
import { PMS } from './pms/adapters.js';
import Rail, { stepLabel } from './components/Rail.jsx';
import ValidatePlan from './screens/ValidatePlan.jsx';
import WriteToPms from './screens/WriteToPms.jsx';
import ApproveQuote from './screens/ApproveQuote.jsx';
import PatientView from './screens/PatientView.jsx';
import Booking from './screens/Booking.jsx';
import PracticeBoard from './screens/PracticeBoard.jsx';
import PatientApp from './patient/PatientApp.jsx';
import BehindTheScenes from './components/BehindTheScenes.jsx';
import VersionBar from './components/VersionBar.jsx';

const VIEWS = [
  { id: 'practice', label: 'Practice' },
  { id: 'patient', label: 'Patient' },
  { id: 'split', label: 'Side by side' },
];

const SCREENS = [ValidatePlan, WriteToPms, ApproveQuote, PatientView, Booking, PracticeBoard];

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const step = STEPS[state.step];
  const person = PEOPLE[state.version === 0 && step.who === 'agent' ? 'ops' : step.who];
  const patient = getMartin(state);
  const Screen = SCREENS[state.step];

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => dispatch({ type: 'TOAST_CLEAR' }), 2800);
    return () => clearTimeout(t);
  }, [state.toast]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [state.step]);

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>Follow-Through Agent</h1>
          <div className="note">Concept prototype for a product case study. Fictional patient and practice, 2026 French fees.</div>
        </div>
        <div className="controls">
        <div className="seg" role="group" aria-label="View">
          {VIEWS.map((v) => (
            <button key={v.id} className={state.view === v.id ? 'on' : ''} aria-pressed={state.view === v.id} onClick={() => dispatch({ type: 'SET_VIEW', view: v.id })}>{v.label}</button>
          ))}
        </div>
        <label className="pms-switch">
          <span className="note">Practice software</span>
          <select id="pms" value={state.pms} onChange={(e) => dispatch({ type: 'SET_PMS', pms: e.target.value })}>
            {Object.values(PMS).filter((p) => p.since <= state.version).map((p) => (
              <option key={p.id} value={p.id}>{p.name} · {p.tagline}</option>
            ))}
          </select>
        </label>
        </div>
      </header>

      <VersionBar version={state.version} onPick={(v) => dispatch({ type: 'SET_VERSION', version: v })} />
      {PMS[state.pms].note && <div className="task pms-note"><span className="tag good">{PMS[state.pms].name}</span>{PMS[state.pms].note}</div>}

      {state.view === 'patient' && (
        <div className="patient-layout">
          <PatientApp patient={patient} pms={PMS[state.pms]} version={state.version} dispatch={dispatch} />
          <BehindTheScenes state={state} patient={patient} pms={PMS[state.pms]} />
        </div>
      )}

      {state.view === 'split' && (
        <div className="split-layout">
          <main className="stage">
            <div className="bar">
              <div className="crumbs"><b>Practice · Treatment follow up</b></div>
              <div className="who"><span className="avatar">CA</span><span><b>Camille</b> <span className="note">· Dental assistant</span></span></div>
            </div>
            <div className="screen">
              <PracticeBoard state={state} patient={patient} pms={PMS[state.pms]} version={state.version} dispatch={dispatch} compact />
            </div>
          </main>
          <PatientApp patient={patient} pms={PMS[state.pms]} version={state.version} dispatch={dispatch} />
        </div>
      )}


      {state.view === 'practice' && <div className="layout">
        <Rail current={state.step} pms={PMS[state.pms]} version={state.version} onGo={(i) => dispatch({ type: 'GO', step: i })} />
        <main className="stage">
          <div className="bar">
            <div className="crumbs">
              <b>{state.step === 5 ? 'Practice' : patient.name} · {step.crumb}</b>
              <span className={`tag ${PMS[state.pms].integrated ? 'good' : 'warn'} inline`}>{PMS[state.pms].name} · {PMS[state.pms].integrated ? 'integrated' : 'no API'}</span>
            </div>
            <div className="who">
              <span className="avatar">{person.initials}</span>
              <span><b>{person.name}</b> <span className="note">· {person.role}</span></span>
            </div>
          </div>
          <div className="screen">
            <h2>{stepLabel(state.step, state.version, PMS[state.pms])[0]}</h2>
            <Screen state={state} patient={patient} pms={PMS[state.pms]} version={state.version} dispatch={dispatch} />
          </div>
        </main>
      </div>}

      <footer>Built with React. The quote engine, visit sequence and PMS adapters are real code; PMS writes and messages are simulated.</footer>
      {state.toast && <div className="toast" role="status">{state.toast}</div>}
    </div>
  );
}
