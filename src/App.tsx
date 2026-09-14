import { Suspense, lazy, useEffect } from 'react';
import { getKid } from './data/kids';
import { useReady } from './store';
import { goKids, go, useRoute } from './router';
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

/** 勋章页两个孩子都有，其余学习页要看 kid.features 是否开启 */
const ALWAYS_ON = ['home', 'badges'];

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
  const ready = useReady();
  const { kid: kidId, route, param } = useRoute();
  const kid = kidId ? getKid(kidId) : null;

  /**
   * 路由守卫：URL 是可以被随意修改的（家长手输、旧书签、分享链接），
   * 所以进页面前要确认这个孩子确实有这一项。
   * 比如 5 岁的弟弟没有英语单词任务，就不该能打开 300 词的单词页。
   */
  const allowed = kid ? ALWAYS_ON.includes(route) || kid.features.includes(route) : false;

  useEffect(() => {
    if (!ready) return;
    if (!kid) {
      // 地址里没有合法的孩子 → 回选人页
      if (route !== 'kids') goKids();
      return;
    }
    // 这个孩子没开这一项 → 退回他自己的今日打卡页
    if (!allowed) go('home');
  }, [ready, kid, route, allowed]);

  // 数据只存云端，没读到就先不渲染业务页面
  if (!ready) return <Boot />;

  const style = kid ? themeStyle(kid.color, kid.color2) : undefined;

  let page = <Kids />;
  if (kid && allowed) {
    switch (route) {
      case 'home':
        page = <Home kid={kid} />;
        break;
      case 'poems':
        page = <Poems kid={kid} openId={param} />;
        break;
      case 'hanzi':
        page = <HanziPage kid={kid} autoQuiz={param === 'quiz'} />;
        break;
      case 'words':
        page = <WordsPage kid={kid} autoQuiz={param === 'quiz'} />;
        break;
      case 'math':
        page = <MathPage kid={kid} autoQuiz={param === 'quiz'} />;
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
