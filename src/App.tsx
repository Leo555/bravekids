import { useEffect } from 'react';
import { getKid } from './data/kids';
import { go, useAppState, useRoute } from './store';
import { themeStyle } from './components/ui';
import Kids from './pages/Kids';
import Home from './pages/Home';
import Poems from './pages/Poems';
import HanziPage from './pages/Hanzi';
import WordsPage from './pages/Words';
import MathPage from './pages/MathPage';
import PinyinPage from './pages/Pinyin';
import Badges from './pages/Badges';

export default function App() {
  const app = useAppState();
  const { route } = useRoute();
  const kid = getKid(app.current);

  // 没选孩子时，任何页面都回到选人页
  useEffect(() => {
    if (!kid && route !== 'kids') go('kids');
  }, [kid, route]);

  const style = kid ? themeStyle(kid.color, kid.color2) : undefined;

  let page = <Kids />;
  if (kid) {
    switch (route) {
      case 'home':
        page = <Home kid={kid} />;
        break;
      case 'poems':
        page = <Poems kid={kid} />;
        break;
      case 'hanzi':
        page = <HanziPage kid={kid} />;
        break;
      case 'words':
        page = <WordsPage kid={kid} />;
        break;
      case 'math':
        page = <MathPage kid={kid} />;
        break;
      case 'pinyin':
        page = <PinyinPage kid={kid} />;
        break;
      case 'badges':
        page = <Badges kid={kid} />;
        break;
      default:
        page = <Kids />;
    }
  }

  return (
    <div className="app" style={style}>
      {page}
    </div>
  );
}
