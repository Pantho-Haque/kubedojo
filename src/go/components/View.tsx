// One page's scroll container inside <main> (absolutely positioned, see .view in globals.css).
export function View({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <section className={'view enter ' + className} style={style}>{children}</section>;
}
