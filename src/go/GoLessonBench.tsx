// The gothik workbench for one built-in lesson, inside the Academy (loaded by GoLesson.jsx on the client).
import { IconSprite } from './components/Icon';
import { StatusBar, Toasts } from './components/shell/StatusBar';
import { Dialogs, GlobalKeys } from './components/shell/Dialogs';
import { LessonWorkbench } from './components/workbench/Workbench';
import { useGothikSettings } from './lib/settings';
import './go.css';

export default function GoLessonBench({ id }: { id: string }) {
  useGothikSettings();
  return (
    <div className="gk gk-lesson">
      <IconSprite />
      <div className="gk-main"><LessonWorkbench key={id} id={id} /></div>
      <StatusBar />
      <Dialogs />
      <Toasts />
      <GlobalKeys />
    </div>
  );
}
