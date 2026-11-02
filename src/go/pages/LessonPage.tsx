import { Navigate, useParams } from 'react-router-dom';
import { LessonWorkbench } from '../components/workbench/Workbench';
import { ACADEMY_URL, ALIAS } from '../lib/data';

// Built-in lessons live in the Academy now; /go/learn/<id> (and old aliases) forward there. Lessons from a pack
// imported in this browser are not in the Academy, so they still open in gothik's own workbench.
export default function LessonPage() {
  const { id = '' } = useParams(), to = ACADEMY_URL[ALIAS[id] || id];
  if (to) return <Navigate to={to} replace />;
  return <LessonWorkbench key={id} id={id} />;
}
