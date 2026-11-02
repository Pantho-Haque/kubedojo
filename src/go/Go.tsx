// gothik inside Tinkerlab: every page under /go, in gothik's own shell (top bar, status bar, dialogs) and styles (go.css,
// scoped to .gk). Built-in lessons live in the Academy (GoLesson.jsx); /go/learn/<id> forwards there.
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { usePageMeta } from '../components/usePageMeta.js';
import { IconSprite } from './components/Icon';
import { TopBar } from './components/shell/TopBar';
import { StatusBar, Toasts } from './components/shell/StatusBar';
import { Dialogs, GlobalKeys } from './components/shell/Dialogs';
import { LegacyRedirect } from './components/shell/LegacyRedirect';
import { useGothikSettings } from './lib/settings';
import { href } from './lib/routes';
import { goMeta } from './meta';
import Home from './pages/Home';
import Learn from './pages/Learn';
import LessonPage from './pages/LessonPage';
import Playground from './pages/Playground';
import Articles from './pages/Articles';
import ArticlePage from './pages/ArticlePage';
import Reading from './pages/Reading';
import DocumentPage from './pages/DocumentPage';
import GlossaryPage from './pages/GlossaryPage';
import Gotchas from './pages/Gotchas';
import Gotcha from './pages/Gotcha';
import Interview from './pages/Interview';
import Question from './pages/Question';
import PuzzlePage from './pages/PuzzlePage';
import Internals from './pages/Internals';
import ComparePage from './pages/ComparePage';
import CertificatePage from './pages/CertificatePage';
import About from './pages/About';
import EmbedPage from './pages/EmbedPage';
import NotFound from './pages/NotFound';
import './go.css';

function GoLayout() {
  usePageMeta(goMeta(useLocation().pathname));
  useGothikSettings();
  return (
    <div className="gk gk-app">
      <a className="skip" href="#main">Skip to content</a>
      <IconSprite />
      <TopBar />
      <main id="main" tabIndex={-1}><Outlet /></main>
      <StatusBar />
      <Dialogs />
      <Toasts />
      <GlobalKeys />
      <LegacyRedirect />
    </div>
  );
}

export default function Go() {
  return (
    <Routes>
      <Route element={<GoLayout />}>
        <Route index element={<Home />} />
        <Route path="learn" element={<Learn />} />
        <Route path="learn/:id" element={<LessonPage />} />
        <Route path="playground" element={<Playground />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/:id" element={<ArticlePage />} />
        <Route path="reading" element={<Reading />} />
        <Route path="reading/:id" element={<DocumentPage />} />
        <Route path="reading/:id/full" element={<DocumentPage full />} />
        <Route path="glossary" element={<GlossaryPage />} />
        <Route path="gotchas" element={<Gotchas />} />
        <Route path="gotchas/:id" element={<Gotcha />} />
        <Route path="interview" element={<Interview />} />
        <Route path="interview/:id" element={<Question />} />
        <Route path="puzzle" element={<PuzzlePage />} />
        <Route path="internals" element={<Navigate to={href.internals('strings')} replace />} />
        <Route path="internals/:tab" element={<Internals />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="certificate/:track" element={<CertificatePage />} />
        <Route path="about" element={<About />} />
        <Route path="embed" element={<EmbedPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
