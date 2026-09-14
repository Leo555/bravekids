import { useMemo, useState } from 'react';
import type { Kid } from '../types';
import { MULTI } from '../data/math';
import { AppBar, Bar, Sheet } from '../components/ui';
import Quiz, { type QuizQuestion, shuffle } from '../components/Quiz';
import { addLearned, useAppState } from '../store';
import { back, go } from '../router';
import { sfxTap } from '../lib/sound';
import { speak } from '../lib/speech';
import { bumpStudy } from '../lib/study';

export default function MathPage({ kid, autoQuiz }: { kid: Kid; autoQuiz?: boolean }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [quiz, setQuiz] = useState(!!autoQuiz);

  const done = st.mathMastered.length;

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
            <div style={{ fontSize: 46, fontWeight: 900 }}>
              {m.a} × {m.b} = ?
            </div>
          ),
          options: shuffle([m.result, ...Array.from(wrongs)]).map(String),
          answer: String(m.result),
          renderOption: (o: string) => <span style={{ fontSize: 28 }}>{o}</span>,
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

      <Sheet open={quiz} onClose={() => setQuiz(false)} title="🎯 口诀闯关" center>
        {quiz && (
          <Quiz
            questions={questions}
            gridOptions
            onCorrect={(q) => addLearned(kid.id, 'mathMastered', q.id)}
            onDone={() => {
              // 完成 10 道闯关题才算今日打卡
              bumpStudy(kid, 'math');
              setQuiz(false);
            }}
          />
        )}
      </Sheet>
    </>
  );
}
