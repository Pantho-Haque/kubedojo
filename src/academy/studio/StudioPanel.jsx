// For an AI course's page: the studio's stats (streak, XP, first-try accuracy, time left), its own pages and what you will learn.
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { markDone } from '../progress.js';
import { useStudio } from './useStudio.js';
import './frame.css';

export default function StudioPanel({ course }) {
  const host = useRef(null); const navigate = useNavigate(); const studio = useStudio(course.slug);
  useEffect(() => { if (studio) return studio.show(host.current, '#/panel', { nav: navigate, done: markDone }); }, [studio, navigate]);
  return <div className="ac-studio-host ac-studio-panel" ref={host} />;
}
