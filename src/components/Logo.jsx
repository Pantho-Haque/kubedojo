// A hexagon (the Kubernetes nod) with a belt across it (the dojo nod). Pure SVG, no image request.
export default function Logo({ size = 26 }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 2.5 27.7 9.25v13.5L16 29.5 4.3 22.75V9.25z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M4.3 13.4h23.4v5.2H4.3z" fill="var(--accent)" />
    </svg>
  );
}
