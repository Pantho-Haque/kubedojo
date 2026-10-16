import { metaFor } from '../site/meta.js';
import { usePageMeta } from '../components/usePageMeta.js';
import Story from '../landing/Story.jsx';
import Section from '../landing/Section.jsx';
import HeroDemo from '../landing/HeroDemo.jsx';
import Scenarios from '../landing/Scenarios.jsx';
import TakeItHome from '../landing/TakeItHome.jsx';
import Course from '../landing/Course.jsx';
import Limits from '../landing/Limits.jsx';
import Faq from '../landing/Faq.jsx';

export default function Home() {
  usePageMeta(metaFor('/'));
  return (
    <>
      <Story />
      <Section id="bench" no={6} label="the bench" title="now type your own.">
        <p className="after">Below is a recorded session. Press the link under it and the same window becomes the real simulator: kind, k3d, docker, kubectl and helm 2, running in your browser.</p>
        <HeroDemo />
      </Section>
      <Scenarios />
      <TakeItHome />
      <Course />
      <Limits />
      <Faq />
    </>
  );
}
