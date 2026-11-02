import { Link } from '../lib/router';
import { Navigate, useParams } from 'react-router-dom';
import sample from '../data/trace-sample.txt?raw';
import { View } from '../components/View';
import { SectionTabs } from '../components/practice/SectionTabs';
import { Lab } from '../components/labs/Labs';
import { href } from '../lib/routes';
import { INTERNALS_TABS } from '../lib/data';

const TABS = INTERNALS_TABS;

// the sample trace (a real Go 1.27 trace dump) is part of this page's chunk
export default function InternalsTab() {
  const { tab = '' } = useParams();
  if (!TABS[tab]) return <Navigate to={href.internals('strings')} replace />;
  return (
    <View>
      <div className="page lab">
        <header className="page-head"><p className="mono faint">{'// internals'}</p><h1 className="mono">look inside the runtime.</h1><p>Small interactive models of what Go does underneath: how strings store text, how maps find keys, how stacks grow, and how the scheduler shares CPUs. Each one is a simplified teaching model and says where it differs from the real runtime. The last tab reads a trace from a real Go program.</p></header>
        <SectionTabs section="reference" active="internals" />
        <div className="seg lab-tabs" role="tablist" aria-label="Models">
          {Object.entries(TABS).map(([k, label]) => <Link key={k} role="tab" href={href.internals(k)} aria-selected={k === tab}>{label}</Link>)}
        </div>
        <div id="lab-body" className="lab-body"><Lab key={tab} tab={tab} sample={tab === 'trace' ? sample : ''} /></div>
      </div>
    </View>
  );
}
