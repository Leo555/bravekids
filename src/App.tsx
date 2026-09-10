import { Suspense, lazy, useEffect } from 'react';
import { getKid } from './data/kids';
import { go, useAppState, useReady, useRoute } from './store';
import { themeStyle } from './components/ui';
import Boot from './components/Boot';
import CloudBanner from './components/CloudBanner';
import Kids from './pages/Kids';
import Home from './pages/Home';

/**
 * 学习页各自带着自己的内容数据（古诗 33KB、单词 26KB、汉字 10KB…），
 * 全部打进首屏没有意义 —— 孩子先看到的是选人页和今日打卡。
 * 这里按路由懒加载，点进去才下载对应的那一块。
 */
const Poems = lazy(() => import('./pages/Poems'));
const HanziPage = lazy(() => import('./pages/Hanzi'));
const WordsPage = lazy(() => import('./pages/Words'));
const MathPage = lazy(() => import('./pages/MathPage'));
const PinyinPage = lazy(() => import('./pages/Pinyin'));
const Badges = lazy(() => import('./pages/Badges'));

function PageLoading() {
  return (
    <div className="page-loading">
      <div className="wiggle" style={{ fontSize: 44 }}>
        📚
      </div>
      <p className="muted">马上就好…</p>
    </div>
  );
}

export default function App() {
  const app = useAppState();
  const ready = useReady();
  const { route } = useRoute();
  const kid = getKid(app.current);

  // 没选孩子时，任何页面都回到选人页
  useEffect(() => {
    if (ready && !kid && route !== 'kids') go('kids');
  }, [ready, kid, route]);

  // 数据只存云端，没读到就先不渲染业务页面
  if (!ready) return <Boot />;

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
      <CloudBanner />
      <Suspense fallback={<PageLoading />}>{page}</Suspense>
    </div>
  );
}
