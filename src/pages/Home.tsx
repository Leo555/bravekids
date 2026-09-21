import { useState } from 'react';
import type { DailyTask, Kid } from '../types';
import {
  bumpWeekly,
  resetKid,
  setDaily,
  useAppState,
} from '../store';
import { go, goKids } from '../router';
import { AppBar, Bar, Ring, Sheet } from '../components/ui';
import CounterSheet from '../components/CounterSheet';
import TimerSheet from '../components/TimerSheet';
import { SyncLine } from '../components/SyncBadge';
import { goalDone, isDailyDone, levelOf, starsOf, statsOf, weeklyCount } from '../lib/progress';
import { WEEK_LABEL, parseKey, prettyDate, today, weekDays, weekKey } from '../lib/date';
import { sfxDing, sfxTap } from '../lib/sound';
import { confettiBurst, flyStarFromEvent } from '../lib/celebrate';
import { praise } from '../lib/speech';

export default function Home({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const stats = statsOf(kid, st);
  const lv = levelOf(stats.stars);
  const [counterTask, setCounterTask] = useState<DailyTask | null>(null);
  const [timerTask, setTimerTask] = useState<DailyTask | null>(null);
  const [tipTask, setTipTask] = useState<DailyTask | null>(null);
  const [setting, setSetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmName, setConfirmName] = useState('');

  const dayRec = st.daily[today()] || {};
  const doneCount = kid.daily.filter((t) => isDailyDone(t, dayRec[t.id])).length;
  const allDone = doneCount === kid.daily.length;

  function toggle(task: DailyTask, e: { clientX: number; clientY: number }) {
    const was = !!dayRec[task.id]?.done;
    setDaily(kid.id, task.id, { done: !was });
    if (!was) {
      const allNow = doneCount + 1 === kid.daily.length;
      sfxDing();
      flyStarFromEvent(e, '⭐');
      if (allNow) confettiBurst();
      praise(kid.nick, allNow);
    } else {
      sfxTap();
    }
  }

  function openTask(task: DailyTask) {
    sfxTap();
    if (task.kind === 'counter') setCounterTask(task);
    else if (task.kind === 'timer') setTimerTask(task);
    else if (task.kind === 'study' && task.route) go(task.route);
    else setTipTask(task);
  }

  const days = weekDays();

  return (
    <>
      <AppBar
        title={`${kid.avatar} ${kid.name}`}
        onBack={() => goKids()}
        right={
          <>
            <button className="pill" onClick={() => go('badges')}>
              ⭐ {stats.stars}
            </button>
            <button className="iconbtn" onClick={() => setSetting(true)} aria-label="设置">
              ⚙️
            </button>
          </>
        }
      />

      <div className="wrap">
        {/* 顶部总览 */}
        <div className="card hero" style={{ marginTop: 14 }}>
          <div className="row" style={{ alignItems: 'center', gap: 16 }}>
            <Ring progress={doneCount / kid.daily.length} size={116} stroke={13}>
              <div>
                <b style={{ fontSize: 26 }}>
                  {doneCount}/{kid.daily.length}
                </b>
                <div className="muted" style={{ fontSize: 11 }}>
                  今日任务
                </div>
              </div>
            </Ring>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {lv.emoji} {lv.name}
              </div>
              <p className="muted" style={{ margin: '2px 0 8px' }}>
                {prettyDate()}
              </p>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <span className="pill">🔥 连续 {stats.streak} 天</span>
                <span className="pill">🪢 {stats.ropeTotal}</span>
              </div>
              {lv.max !== Number.MAX_SAFE_INTEGER && (
                <div style={{ marginTop: 10 }}>
                  <Bar value={stats.stars - lv.min} max={lv.max - lv.min} thin />
                  <p className="muted" style={{ marginTop: 4 }}>
                    再得 {lv.max - stats.stars} ⭐ 升级
                  </p>
                </div>
              )}
            </div>
          </div>
          {allDone && (
            <p
              className="bounce"
              style={{ textAlign: 'center', margin: '12px 0 0', fontWeight: 800 }}
            >
              🎉 今天全部完成，太棒啦！
            </p>
          )}
        </div>

        {/* 每日任务 */}
        <div className="section-title">
          ☀️ 今天要做的
          <small>点卡片开始，点右边圆圈打卡</small>
        </div>
        {kid.daily.map((task) => {
          const rec = dayRec[task.id];
          // 统一用 isDailyDone 判定，保证与积分口径一致；
          // 认汉字任务 = 认了新字(value>=1) + 挑战全对(done)
          const done = isDailyDone(task, rec);
          return (
            <div key={task.id} className={`task${done ? ' done' : ''}`}>
              <button className="emoji" onClick={() => openTask(task)}>
                {task.emoji}
              </button>
              <button
                className="body"
                style={{ textAlign: 'left' }}
                onClick={() => openTask(task)}
              >
                <b>{task.title}</b>
                <span>
                  {task.kind === 'counter' &&
                    `${rec?.value || 0} / ${task.target}${task.unit || ''}`}
                  {task.kind === 'timer' &&
                    (rec?.value ? `今天 ${rec.value} 个 · 最好 ${st.bestJumpMinute} 个` : `${task.seconds} 秒挑战 · 最好 ${st.bestJumpMinute} 个`)}
                  {task.kind === 'study' &&
                    (task.route === 'hanzi'
                      ? `今天认新字 ${rec?.value || 0} 个 · 挑战${rec?.done ? '已全对 ✅' : '未通过'} · ${task.tip || ''}`
                      : task.dailyGoal
                        ? `今天 ${rec?.value || 0} / ${task.dailyGoal} 个 · ${task.tip || ''}`
                        : task.tip || '去学习页看看')}
                  {task.kind === 'simple' && (task.tip || '完成后打卡')}
                </span>
                {task.kind === 'counter' && (
                  <div style={{ marginTop: 6 }}>
                    <Bar value={rec?.value || 0} max={task.target || 1} thin />
                  </div>
                )}
              </button>
              {task.kind === 'study'
                ? done
                  ? (
                    <button
                      className="check on"
                      onClick={() => {
                        sfxTap();
                        setDaily(kid.id, task.id, { value: 0, done: false });
                      }}
                      aria-label="取消打卡"
                    >
                      ✓
                    </button>
                  )
                  : (
                    <button
                      className="check"
                      onClick={() => {
                        sfxTap();
                        if (task.route) go(task.route, 'quiz');
                      }}
                      aria-label="去挑战"
                    >
                      ▶
                    </button>
                  )
                : (
                  <button
                    className={`check${done ? ' on' : ''}`}
                    onClick={(e) => toggle(task, e)}
                    aria-label="打卡"
                  >
                    {done ? '✓' : ''}
                  </button>
                )}
            </div>
          );
        })}

        {/* 本周 */}
        <div className="section-title">
          📅 本周任务
          <small>每周至少 1 次</small>
        </div>
        {kid.weekly.map((task) => {
          const n = weeklyCount(st, task.id);
          const max = task.maxPerWeek ?? 5;
          const ok = n >= task.timesPerWeek;
          const capped = n >= max;
          return (
            <div key={task.id} className={`task${ok ? ' done' : ''}`}>
              <div className="emoji">{task.emoji}</div>
              <div className="body">
                <b>
                  {task.title} {ok ? '✅' : ''}
                </b>
                <span>
                  本周 {n} / {task.timesPerWeek} 次 · {task.tip}
                </span>
                <span style={{ display: 'block', color: 'var(--ink-3)', fontSize: 11, marginTop: 2 }}>
                  本周最多记 {max} 次
                </span>
              </div>
              <div className="row" style={{ gap: 6 }}>
                {n > 0 && (
                  <button
                    className="btn sm ghost"
                    onClick={() => {
                      sfxTap();
                      bumpWeekly(kid.id, task.id, -1, weekKey(), max);
                    }}
                  >
                    －
                  </button>
                )}
                <button
                  className="btn sm primary"
                  disabled={capped}
                  onClick={(e) => {
                    bumpWeekly(kid.id, task.id, 1, weekKey(), max);
                    sfxDing();
                    flyStarFromEvent(e, task.emoji);
                    if (n + 1 === task.timesPerWeek) confettiBurst(24);
                    praise(kid.nick);
                  }}
                >
                  {capped ? '本周已满' : '完成 1 次'}
                </button>
              </div>
            </div>
          );
        })}

        {/* 本周打卡日历 */}
        <div className="card tight">
          <div className="week">
            {days.map((d, i) => {
              const rec = st.daily[d] || {};
              const n = kid.daily.filter((t) => rec[t.id]?.done).length;
              const isToday = d === today();
              return (
                <div
                  key={d}
                  className={`d${n > 0 ? ' ok' : ''}${isToday ? ' today' : ''}`}
                  title={d}
                >
                  {WEEK_LABEL[i]}
                  <b>{n > 0 ? (n === kid.daily.length ? '🌟' : '⭐') : parseKey(d).getDate()}</b>
                </div>
              );
            })}
          </div>
        </div>

        {/* 半年目标 */}
        <div className="section-title">
          🎯 下半年大目标
          <small>点进去学习</small>
        </div>
        {kid.goals.map((g) => {
          const cur = goalDone(st, g);
          return (
            <button
              key={g.id}
              className="card tight"
              style={{ display: 'block', width: '100%', textAlign: 'left' }}
              onClick={() => {
                sfxTap();
                go(g.route);
              }}
            >
              <div className="row">
                <span style={{ fontSize: 22 }}>{g.emoji}</span>
                <b>{g.title}</b>
                <div className="spacer" />
                <span className="muted">
                  {cur} / {g.target} {g.unit}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Bar value={cur} max={g.target} />
              </div>
            </button>
          );
        })}

        <button
          className="btn ghost block"
          style={{ marginTop: 18 }}
          onClick={() => go('badges')}
        >
          🏅 查看我的勋章墙
        </button>
      </div>

      {counterTask && (
        <CounterSheet
          kid={kid}
          task={counterTask}
          open
          onClose={() => setCounterTask(null)}
        />
      )}
      {timerTask && (
        <TimerSheet kid={kid} task={timerTask} open onClose={() => setTimerTask(null)} />
      )}

      <Sheet
        open={!!tipTask}
        onClose={() => setTipTask(null)}
        title={tipTask ? `${tipTask.emoji} ${tipTask.title}` : ''}
      >
        <p className="muted" style={{ fontSize: 15 }}>
          💡 {tipTask?.tip}
        </p>
        <button
          className="btn primary block big"
          onClick={(e) => {
            if (tipTask) {
              const was = !!dayRec[tipTask.id]?.done;
              setDaily(kid.id, tipTask.id, { done: !was });
              if (!was) {
                sfxDing();
                flyStarFromEvent(e, '⭐');
                praise(kid.nick);
              }
            }
            setTipTask(null);
          }}
        >
          {tipTask && dayRec[tipTask.id]?.done ? '取消打卡' : '我做到了！打卡 ⭐'}
        </button>
      </Sheet>

      <Sheet
        open={setting}
        onClose={() => {
          setSetting(false);
          setConfirmName('');
        }}
        title="⚙️ 家长设置"
      >
        <SyncLine />
        <div className="card tight">
          <b>{kid.name} 的统计</b>
          <p className="muted" style={{ marginTop: 6 }}>
            打卡 {stats.checkinDays} 天 · 完美 {stats.perfectDays} 天 · 连续 {stats.streak} 天
            <br />
            跳绳累计 {stats.ropeTotal} 个 · 一分钟最好 {stats.bestJumpMinute} 个
            <br />
            家务 {stats.choreTotal} 次 · 星星 {starsOf(kid, st)} 颗
          </p>
        </div>
        <button
          className="btn ghost block"
          onClick={() => {
            setConfirmReset(true);
          }}
        >
          🗑️ 清空 {kid.name} 的记录
        </button>
      </Sheet>

      <Sheet
        open={confirmReset}
        onClose={() => {
          setConfirmReset(false);
          setConfirmName('');
        }}
        title="⚠️ 确认清空"
      >
        <p className="muted" style={{ fontSize: 15 }}>
          清空后会删除 {kid.name} 的全部打卡记录、星星、勋章和学习进度，且无法恢复。
        </p>
        <p className="muted" style={{ marginTop: 8 }}>
          请完整输入孩子的名字
          <b style={{ color: 'var(--ink)' }}>「{kid.name}」</b> 以确认：
        </p>
        <input
          className="text-input"
          value={confirmName}
          placeholder={`请输入 ${kid.name}`}
          onChange={(e) => setConfirmName(e.target.value)}
        />
        <button
          className="btn block big"
          style={{
            marginTop: 14,
            background: confirmName.trim() === kid.name
              ? 'linear-gradient(160deg, #ff8a96, var(--danger))'
              : 'rgba(31, 35, 48, 0.08)',
            color: confirmName.trim() === kid.name ? '#fff' : 'var(--ink-2)',
            boxShadow: confirmName.trim() === kid.name
              ? '0 6px 16px rgba(255, 93, 108, 0.3)'
              : 'none',
          }}
          disabled={confirmName.trim() !== kid.name}
          onClick={() => {
            resetKid(kid.id);
            setConfirmName('');
            setConfirmReset(false);
            setSetting(false);
          }}
        >
          🗑️ 确认清空 {kid.name} 的记录
        </button>
      </Sheet>
    </>
  );
}
