import { type ReactNode, useState } from 'react';
import { Bar } from './ui';
import { sfxRight, sfxWin, sfxWrong } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';

export interface QuizQuestion {
  id: string;
  /** 题干 */
  prompt: ReactNode;
  /** 点喇叭时读什么 */
  onSpeak?: () => void;
  options: string[];
  answer: string;
  /** 选项怎么显示 */
  renderOption?: (o: string) => ReactNode;
}

export default function Quiz({
  questions,
  onDone,
  onCorrect,
}: {
  questions: QuizQuestion[];
  onDone: (score: number) => void;
  onCorrect?: (q: QuizQuestion) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = questions[i];

  if (finished) {
    const full = score === questions.length;
    return (
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <div style={{ fontSize: 60 }}>{full ? '🏆' : score >= questions.length * 0.6 ? '🎉' : '💪'}</div>
        <h3 style={{ margin: '6px 0' }}>
          答对 {score} / {questions.length}
        </h3>
        <p className="muted">{full ? '全对！太厉害了！' : '继续练习，下次更棒！'}</p>
        <button className="btn primary block big" onClick={() => onDone(score)}>
          好的
        </button>
      </div>
    );
  }

  if (!q) return null;

  function pick(o: string) {
    if (picked) return;
    setPicked(o);
    const right = o === q.answer;
    if (right) {
      setScore((s) => s + 1);
      sfxRight();
      onCorrect?.(q);
    } else {
      sfxWrong();
    }
    window.setTimeout(() => {
      setPicked(null);
      if (i + 1 >= questions.length) {
        const finalScore = score + (right ? 1 : 0);
        setFinished(true);
        if (finalScore === questions.length) {
          sfxWin();
          confettiBurst();
        }
      } else {
        setI(i + 1);
      }
    }, right ? 650 : 1100);
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="muted">
          第 {i + 1} / {questions.length} 题
        </span>
        <div className="spacer" />
        <span className="pill">✅ {score}</span>
      </div>
      <Bar value={i} max={questions.length} thin />

      <div className="card" style={{ textAlign: 'center' }}>
        {q.prompt}
        {q.onSpeak && (
          <button className="btn block" style={{ marginTop: 10 }} onClick={q.onSpeak}>
            🔊 再听一次
          </button>
        )}
      </div>

      {q.options.map((o) => {
        let cls = 'quiz-opt';
        if (picked) {
          if (o === q.answer) cls += ' right';
          else if (o === picked) cls += ' wrong';
        }
        return (
          <button key={o} className={cls} onClick={() => pick(o)}>
            {q.renderOption ? q.renderOption(o) : o}
          </button>
        );
      })}
    </div>
  );
}

/** 洗牌 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
