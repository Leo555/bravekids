import { KIDS } from '../data/kids';
import { useAppState } from '../store';
import { goKid } from '../router';
import { levelOf, starsOf } from '../lib/progress';
import { sfxDing } from '../lib/sound';
import { prettyDate } from '../lib/date';
import SyncBadge from '../components/SyncBadge';

export default function Kids() {
  const app = useAppState();

  return (
    <div className="wrap" style={{ paddingTop: 28 }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div className="wiggle" style={{ fontSize: 56 }}>
          🏆
        </div>
        <h1 style={{ margin: '6px 0 2px', fontSize: 28 }}>BraveKids</h1>
        <p className="muted" style={{ margin: '0 0 2px' }}>
          小勇士打卡乐园
        </p>
        <p className="muted">{prettyDate()} · 2026 下半年运动学习计划</p>
        <div style={{ marginTop: 10 }}>
          <SyncBadge />
        </div>
      </div>

      <div className="kid-grid">
        {KIDS.map((kid) => {
          const stars = starsOf(kid, app.kids[kid.id]);
          const lv = levelOf(stars);
          return (
            <button
              key={kid.id}
              className="kid-card"
              style={{
                background: `linear-gradient(160deg, ${kid.color2}, ${kid.color})`,
              }}
              onClick={() => {
                sfxDing();
                goKid(kid.id);
              }}
            >
              <span className="blob" style={{ width: 140, height: 140, right: -40, top: -40 }} />
              <span className="blob" style={{ width: 80, height: 80, right: 30, bottom: -30 }} />
              <div className="avatar">{kid.avatar}</div>
              <h2>{kid.name}</h2>
              <p>
                {kid.age} 岁 · {kid.grade}
              </p>
              <p style={{ marginTop: 10, fontWeight: 800 }}>
                {lv.emoji} {lv.name} · ⭐ {stars}
              </p>
              <p style={{ marginTop: 8, fontSize: 13, opacity: 0.9 }}>{kid.slogan}</p>
            </button>
          );
        })}
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <b>🎯 计划说明</b>
        <p className="muted" style={{ marginTop: 6 }}>
          每天完成任务可以拿星星 ⭐，星星越多等级越高，还能解锁勋章。
          点自己的头像卡片开始今天的打卡吧！
        </p>
      </div>
    </div>
  );
}
