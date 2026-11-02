import { View } from '../components/View';
import { SectionTabs } from '../components/practice/SectionTabs';
import { Puzzle } from '../components/practice/Puzzle';

export default function PuzzlePage() {
  return <View><article className="article"><SectionTabs section="practice" active="puzzle" /><Puzzle /></article></View>;
}
