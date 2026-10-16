import { KindIcon, KindTag } from './kinds.jsx';

// a titled group of things of one kind, with a live count
export function VSection({ kind, title, count, hint, children, id }) {
  return (
    <section className="vsec" id={id}>
      <header className="vsec-h"><KindIcon kind={kind} size={15} /><h4>{title}</h4>{count !== undefined && <span className="vsec-n" key={count}>{count}</span>}{hint && <span className="vsec-hint">{hint}</span>}</header>
      {children}
    </section>
  );
}
export const Led = ({ tone = 'ok', pulse = false }) => <i className={'led ' + tone + (pulse ? ' pulse' : '')} aria-hidden="true" />;
// a bar that fills with a transition
export const Meter = ({ value, max, tone = 'ok', label }) => <span className="meter" role="img" aria-label={label}><i className={'fill ' + tone} style={{ width: Math.max(0, Math.min(100, (value / (max || 1)) * 100)) + '%' }} /></span>;
export { KindTag, KindIcon };
