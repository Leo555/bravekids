import { useMemo, useState } from 'react';
import type { Hanzi, Kid } from '../types';
import { HANZI, HANZI_GROUPS } from '../data/hanzi';
import { AppBar, Bar, Chips, Sheet } from '../components/ui';
import Quiz, { type QuizQuestion, shuffle } from '../components/Quiz';
import { useAppState } from '../store';
import { back, go } from '../router';
import { speak } from '../lib/speech';
import { sfxDing, sfxTap, sfxWin } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { markHanziChallenge, markNewHanzi } from '../lib/study';

export default function HanziPage({ kid, autoQuiz }: { kid: Kid; autoQuiz?: boolean }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [group, setGroup] = useState<string>(HANZI_GROUPS[0]);
  const [open, setOpen] = useState<Hanzi | null>(null);
  const [quiz, setQuiz] = useState(!!autoQuiz);

  const list = useMemo(() => HANZI.filter((h) => h.group === group), [group]);
  const done = st.learnedHanzi.length;
  const target = kid.hanziCount || HANZI.length;

  const questions: QuizQuestion[] = useMemo(() => {
    if (!quiz) return [];
    // 按学习进度出题：只考「已经认识」的字，孩子没学过的不出现。
    // 认识的字按课本顺序（HANZI 数组原始顺序）排，取最靠前、最早学的那些，
    // 让孩子先复习最熟悉的字，不会一上来就遇到后面的生字。
    const learnedSet = new Set(st.learnedHanzi);
    const known = HANZI.filter((h) => learnedSet.has(h.char));

    // 认识的字太少（不足 4 个）时，从当前选中的分组里抽字，够数但更简单
    const source = known.length >= 4 ? known : list;
    const count = Math.min(10, Math.max(4, source.length));
    const pool = shuffle(source).slice(0, count);

    return pool.map((h) => {
      // 干扰项也只在「已认识」的字里挑，避免用生字吓到孩子
      const distractors = shuffle(known.filter((x) => x.char !== h.char)).slice(0, 3);
      const fill = shuffle(list.filter((x) => x.char !== h.char)).slice(0, 3 - distractors.length);
      const options = shuffle([h.char, ...distractors.map((o) => o.char), ...fill.map((o) => o.char)]);
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
        options,
        answer: h.char,
        renderOption: (o) => (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 32 }}>{o}</span>
        ),
      };
    });
  }, [quiz, st.learnedHanzi, list]);

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
          <button
            className="btn primary block"
            style={{ marginTop: 10 }}
            disabled={done < 4}
            onClick={() => setQuiz(true)}
          >
            {done < 4
              ? '🎯 先认识 4 个字，再来挑战吧'
              : `🎯 听音认字挑战（只考你认识的 ${Math.min(10, done)} 个字）`}
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
          部编版一、二年级《写字表》{HANZI.length} 个会写字，按课本分 {HANZI_GROUPS.length} 组
        </p>

        <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && <CharCard kid={kid} h={open} learned={st.learnedHanzi.includes(open.char)} />}
      </Sheet>

      <Sheet open={quiz} onClose={() => setQuiz(false)} title="🎯 听音认字挑战" center>
        {quiz && (
          <Quiz
            questions={questions}
            gridOptions
            onDone={(score) => {
              // 挑战全对才算「完成挑战」，配合当天认的新字一起完成积分
              const perfect = score === questions.length;
              if (perfect) {
                if (markHanziChallenge(kid)) {
                  sfxWin();
                  confettiBurst(40);
                }
              }
              setQuiz(false);
            }}
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
          // 只有「当天新认的字」才算进度；复习旧字不重复加积分。
          // 认新字 + 挑战全对，两项都满足才算完成「认汉字」任务拿到积分。
          const { isNew, justDone } = markNewHanzi(kid, h.char);
          if (isNew) {
            sfxDing();
            if (justDone) {
              sfxWin();
              confettiBurst(40);
            } else {
              confettiBurst(18);
            }
          }
        }}
      >
        {learned ? '再复习一遍' : '我认识啦！'}
      </button>
    </div>
  );
}
