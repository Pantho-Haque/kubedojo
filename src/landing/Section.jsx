// One "sheet" of the drawing set: a framed page with a header strip (sheet number and name) and a small title block at the foot.
export default function Section({ id, no, label, title, children }) {
  return (
    <section className="sheet" id={id} aria-labelledby={id + '-h'}>
      <div className="wrap">
        <div className="sheet-frame">
          <header className="sheet-head"><span>sheet {String(no).padStart(2, '0')}</span><span>{label}</span></header>
          <div className="sheet-body"><h2 id={id + '-h'} className="statement">{title}</h2>{children}</div>
          <footer className="sheet-foot" aria-hidden="true"><span>kubedojo</span><span>dwg 001</span><span>rev {String.fromCharCode(64 + (no % 26 || 26))}</span></footer>
        </div>
      </div>
    </section>
  );
}
