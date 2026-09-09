import { useMemo, useState } from 'react';
import type { Kid } from '../types';
import { MULTI, MULTI_COLUMNS } from '../data/math';
import { AppBar, Bar, Chips, Sheet } from '../components/ui';
import Quiz, { type QuizQuestion, shuffle } from '../components/Quiz';
import { back, go, toggleLearned, useAppState } from '../store';
import { speak } from '../lib/speech';
import { sfxDing, sfxTap } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { bumpStudy, learnOnce } from '../lib/study';

const COLS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

export default function MathPage({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [col, setCol] = useState('2');
  const [quiz, setQuiz] = useState(false);

  const done = st.mathMastered.length;
  const list = MULTI_COLUMNS[Number(col) - 1];

  const questions: QuizQuestion[] = useMemo(() => {
    if (!quiz) return [];
    return shuffle(MULTI)
      .slice(0, 10)
      .map((m) => {
        const wrongs = new Set<number>();
        while (wrongs.size < 3) {
          const delta = Math.floor(Math.random() * 12) - 6;
          const v = m.result + (delta === 0 ? 3 : delta);
          if (v > 0 && v !== m.result) wrongs.add(v);
        }
        return {
          id: m.id,
          prompt: (
            <div>
              <div style={{ fontSize: 46, fontWeight: 900 }}>
                {m.a} × {m.b} = ?
              </div>
              <p className="muted">想一想口诀：{m.a <= m.b ? `${m.a}${m.b}...` : `${m.b}${m.a}...`}</p>
            </div>
          ),
          onSpeak: () => speak(`${m.a}乘${m.b}等于几`, { lang: 'zh-CN', rate: 0.85 }),
          options: shuffle([m.result, ...Array.from(wrongs)]).map(String),
          answer: String(m.result),
          renderOption: (o: string) => <span style={{ fontSize: 26 }}>{o}</span>,
        };
      });
  }, [quiz]);

  return (
    <>
      <AppBar
        title="✖️ 乘法口诀"
        onBack={() => back()}
        right={<span className="pill">{done}/45</span>}
      />
      <div className="wrap">
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row">
            <b>会背 {done} 句口诀</b>
            <div className="spacer" />
            <span className="muted">共 45 句</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Bar value={done} max={45} />
          </div>
          <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => setQuiz(true)}>
            🎯 口诀闯关（10 题）
          </button>
        </div>

        <Chips items={COLS} value={col} onChange={setCol} label={(c) => `${c} 的乘法`} />

        <div className="card tight">
          <div className="row" style={{ marginBottom: 6 }}>
            <b>{col} 的乘法口诀</b>
            <div className="spacer" />
            <button
              className="btn sm"
              onClick={() =>
                speak(list.map((m) => m.chant).join('，'), { lang: 'zh-CN', rate: 0.8 })
              }
            >
              🔊 整列读一遍
            </button>
          </div>
          {list.map((m) => {
            const ok = st.mathMastered.includes(m.id);
            return (
              <div
                key={m.id}
                className="row"
                style={{ padding: '10px 2px', borderTop: '1px solid var(--line)' }}
              >
                <b style={{ width: 90, fontSize: 17 }}>
                  {m.a} × {m.b} = {m.result}
                </b>
                <span style={{ flex: 1, fontFamily: 'var(--font-hand)', fontSize: 20 }}>
                  {m.chant}
                </span>
                <button
                  className="btn sm ghost"
                  onClick={() => speak(m.chant, { lang: 'zh-CN', rate: 0.75 })}
                >
                  🔊
                </button>
                <button
                  className={`check${ok ? ' on' : ''}`}
                  style={{ width: 34, height: 34, flex: '0 0 34px', fontSize: 16 }}
                  onClick={() => {
                    toggleLearned(kid.id, 'mathMastered', m.id);
                    if (!ok) {
                      sfxDing();
                      bumpStudy(kid, 'math');
                      if (done + 1 === 45) confettiBurst();
                    }
                  }}
                >
                  {ok ? '✓' : ''}
                </button>
              </div>
            );
          })}
        </div>

        <div className="section-title">📋 完整口诀表</div>
        <div className="card tight">
          <div className="mt">
            {Array.from({ length: 9 }).map((_, row) =>
              Array.from({ length: 9 }).map((__, c) => {
                const a = row + 1;
                const b = c + 1;
                if (a > b) return <div key={`${a}-${b}`} className="cell empty" />;
                const m = MULTI.find((x) => x.a === a && x.b === b)!;
                const ok = st.mathMastered.includes(m.id);
                return (
                  <button
                    key={m.id}
                    className={`cell${ok ? ' ok' : ''}`}
                    onClick={() => {
                      sfxTap();
                      speak(m.chant, { lang: 'zh-CN', rate: 0.75 });
                      setCol(String(b));
                    }}
                  >
                    {m.a}×{m.b}
                    <b>{m.result}</b>
                  </button>
                );
              }),
            )}
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            点格子会读口诀，绿色表示已经会背啦。
          </p>
        </div>

        <button className="btn ghost block" style={{ marginTop: 16 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>

      <Sheet open={quiz} onClose={() => setQuiz(false)} title="🎯 口诀闯关">
        {quiz && (
          <Quiz
            questions={questions}
            onCorrect={(q) => learnOnce(kid, 'mathMastered', q.id, 'math')}
            onDone={() => setQuiz(false)}
          />
        )}
      </Sheet>
    </>
  );
}
