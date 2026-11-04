import React from 'react';
import { VERSIONS } from '../domain/versions.js';

export default function VersionBar({ version, onPick }) {
  const v = VERSIONS[version];
  return (
    <section className="versions" aria-label="Roadmap version">
      <div className="vtrack" role="group" aria-label="Pick a version">
        {VERSIONS.map((x) => (
          <button key={x.id} className={`vstep ${x.id === version ? 'on' : ''} ${x.id < version ? 'past' : ''}`} aria-pressed={x.id === version} onClick={() => onPick(x.id)}>
            <span className="vname">{x.name}</span>
            <span className="vtitle">{x.title}</span>
            <span className="vwhen">{x.when}</span>
          </button>
        ))}
      </div>
      <div className="vdetail">
        <p><b>{v.name} · {v.title}.</b> {v.summary}</p>
        <ul>{v.adds.map((a) => <li key={a}>{a}</li>)}</ul>
        <p className="vgate"><span className="tag">Gate to next version</span> {v.gate}</p>
      </div>
    </section>
  );
}
