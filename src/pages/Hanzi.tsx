import { useMemo, useState } from 'react';
import type { Hanzi, Kid } from '../types';
import { HANZI, HANZI_GROUPS } from '../data/hanzi';
import { AppBar, Bar, Chips, Sheet } from '../components/ui';
import Quiz, { type QuizQuestion, shuffle } from '../components/Quiz';
import { toggleLearned, useAppState } from '../store';
import { back, go } from '../router';
import { speak } from '../lib/speech';
import { sfxDing, sfxTap, sfxWin } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { bumpStudy, learnOnce } from '../lib/study';

export default function HanziPage({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [group, setGroup] = useState<string>(HANZI_GROUPS[0]);
  const [open, setOpen] = useState<Hanzi | null>(null);
  const [quiz, setQuiz] = useState(false);

  const list = useMemo(() => HANZI.filter((h) => h.group === group), [group]);
  const done = st.learnedHanzi.length;
  const target = kid.hanziCount || HANZI.length;

  const questions: QuizQuestion[] = useMemo(() => {
    if (!quiz) return [];
    const pool = shuffle(HANZI).slice(0, 10);
    return pool.map((h) => {
      const others = shuffle(HANZI.filter((x) => x.char !== h.char)).slice(0, 3);
      return {
        id: h.char,
        prompt: (
          <div>
            <div style={{ fontSize: 44 }}>🔊</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{h.pinyin}</div>
            <p className="muted">听读音，选出正确的字（{h.words[0]}）</p>
          </div>
        ),
        onSpeak: () => speak(`${h.char}。${h.words[0]}`, { lang: 'zh-CN', rate: 0.7 }),
        options: shuffle([h.char, ...others.map((o) => o.char)]),
        answer: h.char,
        renderOption: (o) => (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 32 }}>{o}</span>
        ),
      };
    });
  }, [quiz]);

  return (
    <>
      <AppBar
        title="🀄 认字小课堂"
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
            <b>已经认识 {done} 个字</b>
            <div className="spacer" />
            <span className="muted">目标 {target} 个</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Bar value={done} max={target} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            点一个字看大字卡，听读音、看组词，会了就点"我认识啦"。
          </p>
          <button className="btn primary block" style={{ marginTop: 10 }} onClick={() => setQuiz(true)}>
            🎯 听音认字挑战（10 题）
          </button>
        </div>

        <Chips items={HANZI_GROUPS} value={group} onChange={setGroup} />

        <div className="hz-grid">
          {list.map((h) => {
            const ok = st.learnedHanzi.includes(h.char);
            return (
              <button
                key={h.char}
                className={`hz-cell${ok ? ' ok' : ''}`}
                onClick={() => {
                  sfxTap();
                  speak(h.char, { lang: 'zh-CN', rate: 0.7 });
                  setOpen(h);
                }}
              >
                {h.char}
              </button>
            );
          })}
        </div>

        <p className="muted" style={{ textAlign: 'center', marginTop: 14 }}>
          共 {HANZI.length} 个常用字，分成 {HANZI_GROUPS.length} 组
        </p>

        <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && <CharCard kid={kid} h={open} learned={st.learnedHanzi.includes(open.char)} />}
      </Sheet>

      <Sheet open={quiz} onClose={() => setQuiz(false)} title="🎯 听音认字挑战">
        {quiz && (
          <Quiz
            questions={questions}
            onCorrect={(q) => learnOnce(kid, 'learnedHanzi', q.id, 'hanzi')}
            onDone={() => setQuiz(false)}
          />
        )}
      </Sheet>
    </>
  );
}

function CharCard({ kid, h, learned }: { kid: Kid; h: Hanzi; learned: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="tianzi">
        <span>{h.char}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>{h.pinyin}</div>
      <p className="muted">
        {h.strokes} 画 · {h.group}
      </p>
      <div className="row wrap" style={{ justifyContent: 'center', marginTop: 6 }}>
        {h.words.map((w) => (
          <button
            key={w}
            className="chip"
            onClick={() => speak(w, { lang: 'zh-CN', rate: 0.7 })}
          >
            {w}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button
          className="btn block"
          onClick={() => speak(`${h.char}。${h.words.join('，')}`, { lang: 'zh-CN', rate: 0.68 })}
        >
          🔊 读一读
        </button>
      </div>
      <button
        className={`btn ${learned ? 'ghost' : 'primary'} block big`}
        style={{ marginTop: 10 }}
        onClick={() => {
          toggleLearned(kid.id, 'learnedHanzi', h.char);
          if (!learned) {
            sfxDing();
            confettiBurst(18);
            if (bumpStudy(kid, 'hanzi')) {
              sfxWin();
              confettiBurst(40);
            }
          }
        }}
      >
        {learned ? '已认识 ✓ 点这里取消' : '我认识啦！+1 ⭐'}
      </button>
    </div>
  );
}
