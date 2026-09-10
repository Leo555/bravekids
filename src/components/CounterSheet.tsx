import { useState } from 'react';
import type { DailyTask, Kid } from '../types';
import { Ring, Sheet } from './ui';
import { setDaily, useAppState } from '../store';
import { today } from '../lib/date';
import { sfxCount, sfxDing, sfxWin } from '../lib/sound';
import { confettiBurst, flyStarFromEvent } from '../lib/celebrate';
import { praise } from '../lib/speech';

export default function CounterSheet({
  kid,
  task,
  open,
  onClose,
}: {
  kid: Kid;
  task: DailyTask;
  open: boolean;
  onClose: () => void;
}) {
  const app = useAppState();
  const rec = app.kids[kid.id].daily[today()]?.[task.id];
  const value = rec?.value || 0;
  const done = !!rec?.done;
  const target = task.target || 100;
  const [taps, setTaps] = useState(0);

  function add(n: number, e?: { clientX: number; clientY: number }) {
    const next = Math.max(0, value + n);
    const justDone = !done && next >= target;
    setDaily(kid.id, task.id, { value: next, done: done || justDone });
    if (n > 0) {
      setTaps((t) => t + 1);
      sfxCount(taps);
      if (e) flyStarFromEvent(e, n >= 50 ? '✨' : '🪢');
    }
    if (justDone) {
      sfxWin();
      confettiBurst();
      praise(kid.nick, true);
    }
  }

  const pct = Math.min(1, value / target);

  return (
    <Sheet open={open} onClose={onClose} title={`${task.emoji} ${task.title}`}>
      <div className="counter">
        <Ring progress={pct} size={172}>
          <div>
            <div className="num" style={{ fontSize: 44 }}>
              {value}
            </div>
            <div className="muted" style={{ marginTop: 2 }}>
              目标 {target}
              {task.unit}
            </div>
          </div>
        </Ring>
      </div>

      <button className="tapzone" onClick={(e) => add(task.steps?.[0] || 1, e)}>
        点一下 +{task.steps?.[0] || 1}
      </button>

      <div className="row wrap" style={{ marginTop: 12, justifyContent: 'center' }}>
        {(task.steps || [1]).slice(1).map((s) => (
          <button key={s} className="btn" onClick={(e) => add(s, e)}>
            +{s}
          </button>
        ))}
        <button className="btn ghost" onClick={() => add(-(task.steps?.[0] || 1))}>
          撤销
        </button>
        <button
          className="btn ghost"
          onClick={() => setDaily(kid.id, task.id, { value: 0, done: false })}
        >
          清零
        </button>
      </div>

      {task.tip && (
        <p className="muted" style={{ textAlign: 'center', marginTop: 14 }}>
          💡 {task.tip}
        </p>
      )}

      <button
        className={`btn ${done ? 'ghost' : 'primary'} block big`}
        style={{ marginTop: 6 }}
        onClick={() => {
          if (!done) {
            sfxDing();
            confettiBurst(24);
            praise(kid.nick);
          }
          setDaily(kid.id, task.id, { done: !done });
        }}
      >
        {done ? '已完成 ✓ 点这里撤销' : `完成打卡 +${task.stars} ⭐`}
      </button>
    </Sheet>
  );
}
