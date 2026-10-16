import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import demos from './generated/demos.json';
import Section from './Section.jsx';
import { appIntent } from '../playground/loader.js';

const runLink = run => `/app?run=${encodeURIComponent(JSON.stringify(run))}&notour=1`;

export default function Scenarios() {
  const [cur, setCur] = useState(0); const uid = useId(); const tabs = useRef([]);
  const list = demos.scenarios; const s = list[cur];
  const onKey = e => { // arrow keys move between tabs, as for any tab list
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault();
    const n = (cur + d + list.length) % list.length; setCur(n); tabs.current[n] && tabs.current[n].focus();
  };
  return (
    <Section id="break" no={7} label="case files" title="read the symptoms, then fix it.">
      <div className="tabs" role="tablist" aria-label="Failure scenarios" onKeyDown={onKey}>
        {list.map((x, i) => <button key={x.id} ref={el => { tabs.current[i] = el; }} role="tab" id={`${uid}-t${i}`} aria-selected={i === cur} aria-controls={`${uid}-p`} tabIndex={i === cur ? 0 : -1} className={i === cur ? 'on' : ''} onClick={() => setCur(i)}>{x.tab}</button>)}
      </div>
      <div className="scn" role="tabpanel" id={`${uid}-p`} aria-labelledby={`${uid}-t${cur}`}>
        <div className="scn-text">
          <h3>{s.title}</h3>
          <p>{s.lesson}</p>
          <Link className="arrow-link" to={runLink(s.run)} {...appIntent}>run it in the playground <span aria-hidden="true">→</span></Link>
        </div>
        <pre className="term scn-term" key={s.id} tabIndex={0} aria-label={`Terminal transcript: ${s.title}`}>
          {s.lines.map((l, i) => (
            <div className="scn-step" style={{ '--i': i }} key={i}>
              <div className="cmd"><span className="ps">$</span> {l.cmd}</div>
              {l.out.map((o, j) => <div className="out" key={j}>{o}</div>)}
            </div>
          ))}
        </pre>
      </div>
    </Section>
  );
}
