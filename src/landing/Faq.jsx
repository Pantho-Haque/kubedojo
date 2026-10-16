import Section from './Section.jsx';

const FAQ = [
  ['Is it safe to run?', 'Nothing in it is real. There is no Docker and no cluster, and once the page has loaded it makes no network requests at all. The only thing it writes is a small amount of data to your browser\'s local storage.'],
  ['Do I need Docker or a cluster to use it?', 'No. You need them only if you want to run an exported script on your own computer.'],
  ['What does it save?', 'The virtual files you create (for example the Helm chart in ~/myapp) and whether you have seen the tour. The simulated clusters are not saved: each visit, and each press of Reset, starts a fresh world.'],
  ['Why does it start in a red PRODUCTION cluster?', 'On purpose. A real mistake in kubectl is usually run against the wrong context, so the first habit worth building is reading kubectl config current-context before you type.'],
  ['How close is it to real kubectl?', 'Commands, flags and output are modelled on the real tools, and pods go through the same states you would see. It is a simulation, so expect gaps: the section above lists them.'],
  ['Does it work on a phone?', 'The guides and this page do. The playground is built around a keyboard and a wide screen, so on a phone it is usable but cramped.'],
];

export default function Faq() {
  return (
    <Section id="faq" no={11} label="questions" title="before you start.">
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </Section>
  );
}
