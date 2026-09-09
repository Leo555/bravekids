import type { Kid } from '../types';
import { AppBar, Bar } from '../components/ui';
import { back, useAppState } from '../store';
import { badgesOf, goalDone, levelOf, statsOf } from '../lib/progress';
import { lastDays, parseKey } from '../lib/date';

export default function Badges({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const stats = statsOf(kid, st);
  const lv = levelOf(stats.stars);
  const badges = badgesOf(kid, st);
  const got = badges.filter((b) => b.got).length;
  const days = lastDays(14);

  return (
    <>
      <AppBar title="🏅 我的勋章墙" onBack={() => back()} right={<span className="pill">⭐ {stats.stars}</span>} />
      <div className="wrap">
        <div
          className="card"
          style={{
            marginTop: 14,
            textAlign: 'center',
            background: `linear-gradient(160deg, ${kid.color2}, ${kid.color})`,
            color: '#fff',
          }}
        >
          <div className="bounce" style={{ fontSize: 64 }}>
            {lv.emoji}
          </div>
          <h2 style={{ margin: '4px 0' }}>
            {kid.name} · {lv.name}
          </h2>
          <p style={{ margin: 0, opacity: 0.92 }}>
            ⭐ {stats.stars} 颗星星 · 🏅 {got}/{badges.length} 枚勋章
          </p>
        </div>

        <div className="card tight">
          <div className="row wrap" style={{ gap: 8 }}>
            <span className="pill">🔥 连续 {stats.streak} 天</span>
            <span className="pill">📅 打卡 {stats.checkinDays} 天</span>
            <span className="pill">🌟 完美 {stats.perfectDays} 天</span>
            <span className="pill">🪢 跳绳 {stats.ropeTotal}</span>
            <span className="pill">⚡ 一分钟 {stats.bestJumpMinute}</span>
            <span className="pill">🍽️ 家务 {stats.choreTotal} 次</span>
          </div>
        </div>

        <div className="section-title">📈 最近两周</div>
        <div className="card tight">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {days.map((d) => {
              const rec = st.daily[d] || {};
              const n = kid.daily.filter((t) => rec[t.id]?.done).length;
              const ratio = n / kid.daily.length;
              return (
                <div
                  key={d}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: ratio > 0.5 ? '#fff' : 'var(--ink-2)',
                    background:
                      ratio === 0
                        ? 'rgba(51,49,59,.06)'
                        : `linear-gradient(180deg, ${kid.color2}, ${kid.color})`,
                    opacity: ratio === 0 ? 1 : 0.45 + ratio * 0.55,
                  }}
                  title={`${d} 完成 ${n} 项`}
                >
                  {parseKey(d).getDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div className="section-title">🎯 大目标进度</div>
        {kid.goals.map((g) => {
          const cur = goalDone(st, g);
          return (
            <div key={g.id} className="card tight">
              <div className="row">
                <span style={{ fontSize: 20 }}>{g.emoji}</span>
                <b>{g.title}</b>
                <div className="spacer" />
                <span className="muted">
                  {cur}/{g.target} {g.unit}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Bar value={cur} max={g.target} thin />
              </div>
            </div>
          );
        })}

        <div className="section-title">
          🏅 勋章
          <small>
            已解锁 {got}/{badges.length}
          </small>
        </div>
        <div className="badges">
          {badges.map((b) => (
            <div key={b.id} className={`badge${b.got ? ' on' : ''}`}>
              <div className="ic">{b.emoji}</div>
              <b>{b.name}</b>
              <span>{b.desc}</span>
              {!b.got && (
                <div style={{ marginTop: 6 }}>
                  <Bar value={b.progress * 100} max={100} thin />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
