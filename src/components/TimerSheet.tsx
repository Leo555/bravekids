import { useEffect, useRef, useState } from 'react';
import type { DailyTask, Kid } from '../types';
import { Ring, Sheet } from './ui';
import { setBestJumpMinute, setDaily, useAppState } from '../store';
import { today } from '../lib/date';
import { sfxBeep, sfxCount, sfxDing, sfxWin } from '../lib/sound';
import { confettiBurst, flyStarFromEvent } from '../lib/celebrate';
import { praise } from '../lib/speech';

export default function TimerSheet({
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
  const state = app.kids[kid.id];
  const rec = state.daily[today()]?.[task.id];
  const total = task.seconds || 60;

  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(rec?.value || 0);
  const [finished, setFinished] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    timer.current = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer.current!);
          setRunning(false);
          setFinished(true);
          sfxWin();
          confettiBurst();
          return 0;
        }
        if (s <= 4) sfxBeep();
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [running]);

  useEffect(() => {
    if (!open) {
      setRunning(false);
      setLeft(total);
      setFinished(false);
    }
  }, [open, total]);

  const best = state.bestJumpMinute;
  const newRecord = finished && count > best && count > 0;

  function save() {
    setDaily(kid.id, task.id, { value: count, done: true });
    setBestJumpMinute(kid.id, count);
    sfxDing();
    confettiBurst(28);
    praise(kid.nick, count > best);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={`${task.emoji} ${task.title}`}>
      <div style={{ textAlign: 'center' }}>
        <Ring progress={left / total} size={176} color={left > 10 ? 'var(--c1)' : '#ef476f'}>
          <div>
            <b>{left}</b>
            <div className="muted">秒</div>
          </div>
        </Ring>

        <div className="row" style={{ justifyContent: 'center', marginTop: 14 }}>
          {!running && left > 0 && !finished && (
            <button className="btn primary big" onClick={() => setRunning(true)}>
              ▶ 开始计时
            </button>
          )}
          {running && (
            <button className="btn ghost big" onClick={() => setRunning(false)}>
              ⏸ 暂停
            </button>
          )}
          {(finished || (!running && left < total)) && (
            <button
              className="btn ghost big"
              onClick={() => {
                setLeft(total);
                setFinished(false);
                setCount(0);
              }}
            >
              ↺ 重来
            </button>
          )}
        </div>

        <div className="card tight" style={{ marginTop: 16 }}>
          <div className="muted">这一分钟跳了多少个？（跳的时候可以让爸爸妈妈帮忙点）</div>
          <div className="num" style={{ fontSize: 52, margin: '6px 0' }}>
            {count}
          </div>
          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn primary"
              onClick={(e) => {
                setCount((c) => c + 1);
                sfxCount(count);
                flyStarFromEvent(e, '🪢');
              }}
            >
              +1
            </button>
            <button className="btn" onClick={() => setCount((c) => c + 10)}>
              +10
            </button>
            <button className="btn" onClick={() => setCount((c) => c + 50)}>
              +50
            </button>
            <button className="btn ghost" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              -1
            </button>
            <button className="btn ghost" onClick={() => setCount(0)}>
              清零
            </button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            🏆 最好成绩：{best} 个{newRecord ? ' → 破纪录啦！🎉' : ''}
          </p>
        </div>

        <button className="btn primary block big" onClick={save} disabled={count <= 0}>
          保存成绩并打卡 +{task.stars} ⭐
        </button>

        {task.tip && (
          <p className="muted" style={{ marginTop: 12 }}>
            💡 {task.tip}
          </p>
        )}
      </div>
    </Sheet>
  );
}
