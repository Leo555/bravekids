import { useMemo, useState } from 'react';
import type { Kid, Word } from '../types';
import { WORDS, WORD_UNITS, wordKey } from '../data/words';
import { AppBar, Bar, Chips, Sheet } from '../components/ui';
import Quiz, { type QuizQuestion, shuffle } from '../components/Quiz';
import { toggleLearned, useAppState } from '../store';
import { back, go } from '../router';
import { speak } from '../lib/speech';
import { sfxDing, sfxTap, sfxWin } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { bumpStudy, learnOnce } from '../lib/study';

export default function WordsPage({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [unit, setUnit] = useState(WORD_UNITS[0]);
  const [tab, setTab] = useState<'card' | 'list'>('card');
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quiz, setQuiz] = useState<'zh2en' | 'listen' | null>(null);

  const list = useMemo(() => WORDS.filter((w) => w.unit === unit), [unit]);
  const cur = list[Math.min(idx, list.length - 1)];
  const done = st.learnedWords.length;
  const target = kid.wordCount || WORDS.length;
  const unitDone = list.filter((w) => st.learnedWords.includes(wordKey(w))).length;

  function say(w: Word) {
    speak(w.en, { lang: 'en-US', rate: 0.75 });
  }

  function move(delta: number) {
    setFlipped(false);
    setIdx((i) => (i + delta + list.length) % list.length);
    sfxTap();
  }

  const questions: QuizQuestion[] = useMemo(() => {
    if (!quiz) return [];
    const pool = shuffle(list).slice(0, Math.min(10, list.length));
    return pool.map((w) => {
      const others = shuffle(WORDS.filter((x) => x.en !== w.en)).slice(0, 3);
      if (quiz === 'zh2en') {
        return {
          id: wordKey(w),
          prompt: (
            <div>
              <div className="pic" style={{ fontSize: 64 }}>
                {w.emoji}
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{w.zh}</div>
              <p className="muted">选出正确的英语单词</p>
            </div>
          ),
          options: shuffle([w.en, ...others.map((o) => o.en)]),
          answer: w.en,
          renderOption: (o: string) => <span style={{ fontSize: 22 }}>{o}</span>,
        };
      }
      return {
        id: wordKey(w),
        prompt: (
          <div>
            <div style={{ fontSize: 54 }}>🎧</div>
            <p className="muted">听单词，选出对应的中文意思</p>
          </div>
        ),
        onSpeak: () => speak(w.en, { lang: 'en-US', rate: 0.7 }),
        options: shuffle([w.zh, ...others.map((o) => o.zh)]),
        answer: w.zh,
      };
    });
  }, [quiz, list]);

  return (
    <>
      <AppBar
        title="🔤 单词闪卡屋"
        onBack={() => back()}
        right={
          <span className="pill">
            {done}/{target}
          </span>
        }
      />
      <div className="wrap">
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row">
            <b>已记住 {done} 个单词</b>
            <div className="spacer" />
            <span className="muted">目标 {target} 个</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Bar value={done} max={target} />
          </div>
          <div className="row wrap" style={{ marginTop: 10 }}>
            <button className="btn primary sm" onClick={() => setQuiz('zh2en')}>
              🎯 看图选词
            </button>
            <button className="btn primary sm" onClick={() => setQuiz('listen')}>
              🎧 听音选意思
            </button>
            <button
              className="btn ghost sm"
              onClick={() => setTab(tab === 'card' ? 'list' : 'card')}
            >
              {tab === 'card' ? '📋 列表模式' : '🃏 闪卡模式'}
            </button>
          </div>
        </div>

        <Chips
          items={WORD_UNITS}
          value={unit}
          onChange={(u) => {
            setUnit(u);
            setIdx(0);
            setFlipped(false);
          }}
        />

        <p className="muted" style={{ margin: '0 4px 6px' }}>
          {unit}单元：{unitDone} / {list.length} 已记住
        </p>

        {tab === 'card' && cur && (
          <>
            <div
              className={`flash${flipped ? ' flipped' : ''}`}
              onClick={() => {
                setFlipped((f) => !f);
                if (!flipped) say(cur);
                sfxTap();
              }}
            >
              <div className="flash-inner">
                <div className="flash-face">
                  <div className="pic">{cur.emoji}</div>
                  <div className="big-en">{cur.en}</div>
                  <div className="ipa">{cur.ipa}</div>
                  <p className="muted">点卡片看中文 👆</p>
                </div>
                <div className="flash-face back">
                  <div className="zh">{cur.zh}</div>
                  <div className="big-en" style={{ fontSize: 28 }}>
                    {cur.en}
                  </div>
                  <div className="ipa">{cur.ipa}</div>
                  <div className="pic" style={{ fontSize: 46 }}>
                    {cur.emoji}
                  </div>
                </div>
              </div>
            </div>

            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn ghost" onClick={() => move(-1)}>
                ←
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  say(cur);
                }}
              >
                🔊 读一读
              </button>
              <button className="btn ghost" onClick={() => move(1)}>
                →
              </button>
            </div>

            <button
              className={`btn ${st.learnedWords.includes(wordKey(cur)) ? 'ghost' : 'primary'} block big`}
              style={{ marginTop: 10 }}
              onClick={() => {
                const was = st.learnedWords.includes(wordKey(cur));
                toggleLearned(kid.id, 'learnedWords', wordKey(cur));
                if (!was) {
                  sfxDing();
                  confettiBurst(14);
                  if (bumpStudy(kid, 'words')) {
                    sfxWin();
                    confettiBurst(40);
                  }
                  window.setTimeout(() => move(1), 350);
                }
              }}
            >
              {st.learnedWords.includes(wordKey(cur))
                ? '已记住 ✓ 点这里取消'
                : '我记住啦！+1 ⭐'}
            </button>

            <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
              第 {idx + 1} / {list.length} 张
            </p>
          </>
        )}

        {tab === 'list' && (
          <div className="card tight">
            {list.map((w, i) => {
              const ok = st.learnedWords.includes(wordKey(w));
              return (
                <div
                  key={wordKey(w)}
                  className="row"
                  style={{
                    padding: '10px 4px',
                    borderBottom: i === list.length - 1 ? 'none' : '1px solid var(--line)',
                  }}
                >
                  <span style={{ fontSize: 26 }}>{w.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b>{w.en}</b>
                    <div className="muted">
                      {w.ipa} {w.zh}
                    </div>
                  </div>
                  <button className="btn sm ghost" onClick={() => say(w)}>
                    🔊
                  </button>
                  <button
                    className={`check${ok ? ' on' : ''}`}
                    style={{ width: 34, height: 34, flex: '0 0 34px', fontSize: 16 }}
                    onClick={() => {
                      toggleLearned(kid.id, 'learnedWords', wordKey(w));
                      if (!ok) {
                        sfxDing();
                        bumpStudy(kid, 'words');
                      }
                    }}
                  >
                    {ok ? '✓' : ''}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <button className="btn ghost block" style={{ marginTop: 16 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>

      <Sheet
        open={!!quiz}
        onClose={() => setQuiz(null)}
        title={quiz === 'zh2en' ? '🎯 看图选词' : '🎧 听音选意思'}
      >
        {quiz && (
          <Quiz
            questions={questions}
            onCorrect={(q) => learnOnce(kid, 'learnedWords', q.id, 'words')}
            onDone={() => setQuiz(null)}
          />
        )}
      </Sheet>
    </>
  );
}
