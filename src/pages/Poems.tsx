import { useMemo, useState } from 'react';
import type { Kid, Poem, PoemLine } from '../types';
import { POEMS } from '../data/poems';
import { AppBar, Bar, Sheet } from '../components/ui';
import { back, go, toggleLearned, useAppState } from '../store';
import { speak, stopSpeak } from '../lib/speech';
import { sfxDing, sfxRight, sfxTap, sfxWin, sfxWrong } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { bumpStudy } from '../lib/study';

type Mode = 'both' | 'char' | 'test';

const HAN = /[\u4e00-\u9fa5]/;

function Line({
  line,
  mode,
  active,
  onClick,
}: {
  line: PoemLine;
  mode: Mode;
  active: boolean;
  onClick: () => void;
}) {
  const pys = line.pinyin.split(/\s+/).filter(Boolean);
  let k = 0;
  return (
    <button className={`pline${active ? ' active' : ''}`} onClick={onClick}>
      {Array.from(line.text).map((ch, i) => {
        const isHan = HAN.test(ch);
        const py = isHan ? pys[k++] : '';
        return (
          <span
            key={i}
            className={`pchar${isHan ? '' : ' punc'}${mode === 'test' && isHan ? ' hide' : ''}`}
          >
            <span className="py">{mode === 'char' ? '' : py}</span>
            <span className="zi">{ch}</span>
          </span>
        );
      })}
    </button>
  );
}

/** 诗句排排队小游戏 */
function OrderGame({ poem, onWin }: { poem: Poem; onWin: () => void }) {
  const [pool, setPool] = useState(() =>
    poem.lines.map((l, i) => ({ i, text: l.text })).sort(() => Math.random() - 0.5),
  );
  const [answer, setAnswer] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  function pick(i: number) {
    if (i === answer.length) {
      const next = [...answer, i];
      setAnswer(next);
      setPool((p) => p.filter((x) => x.i !== i));
      sfxRight();
      if (next.length === poem.lines.length) {
        sfxWin();
        confettiBurst();
        onWin();
      }
    } else {
      sfxWrong();
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div>
      <p className="muted">把诗句按正确顺序点出来 👇</p>
      <div
        className="card tight"
        style={{ minHeight: 90, fontFamily: 'var(--font-hand)', fontSize: 20 }}
      >
        {answer.length === 0 && <span className="muted">这里显示排好的诗句</span>}
        {answer.map((i) => (
          <div key={i}>{poem.lines[i].text}</div>
        ))}
      </div>
      <div className={shake ? 'bounce' : ''}>
        {pool.map((p) => (
          <button
            key={p.i}
            className="quiz-opt"
            style={{ fontFamily: 'var(--font-hand)' }}
            onClick={() => pick(p.i)}
          >
            {p.text}
          </button>
        ))}
      </div>
      {answer.length === poem.lines.length && (
        <p style={{ textAlign: 'center', fontWeight: 800 }}>🎉 全对！你真的背下来啦</p>
      )}
    </div>
  );
}

function Detail({
  kid,
  poem,
  onBack,
  onPrev,
  onNext,
}: {
  kid: Kid;
  poem: Poem;
  onBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const app = useAppState();
  const learned = app.kids[kid.id].learnedPoems.includes(poem.id);
  const [mode, setMode] = useState<Mode>('both');
  const [active, setActive] = useState(-1);
  const [story, setStory] = useState(false);
  const [game, setGame] = useState(false);

  function readAll() {
    setActive(-1);
    stopSpeak();
    speak(`${poem.title}。${poem.author}。${poem.lines.map((l) => l.text).join('')}`, {
      lang: 'zh-CN',
      rate: 0.72,
    });
  }

  return (
    <>
      <AppBar
        title={poem.title}
        onBack={onBack}
        right={
          <button className="pill" onClick={readAll}>
            🔊 朗读
          </button>
        }
      />
      <div className="wrap fadein">
        <div className="scroll-paper" style={{ marginTop: 14 }}>
          <div className="poem-title">
            <div style={{ fontSize: 34 }}>{poem.emoji}</div>
            <h2>{poem.title}</h2>
            <p>
              {poem.titlePinyin} · {poem.dynasty} · {poem.author}
            </p>
          </div>
          <div style={{ marginTop: 10 }}>
            {poem.lines.map((l, i) => (
              <Line
                key={i}
                line={l}
                mode={mode}
                active={active === i}
                onClick={() => {
                  setActive(i);
                  stopSpeak();
                  speak(l.text, { lang: 'zh-CN', rate: 0.7 });
                }}
              />
            ))}
          </div>
          <p className="muted" style={{ textAlign: 'center', marginTop: 6 }}>
            👆 点一句，跟着读一句
          </p>
        </div>

        <div className="row wrap" style={{ marginTop: 14, justifyContent: 'center' }}>
          <button
            className={`btn ${mode === 'both' ? 'primary' : 'ghost'} sm`}
            onClick={() => {
              sfxTap();
              setMode('both');
            }}
          >
            拼音版
          </button>
          <button
            className={`btn ${mode === 'char' ? 'primary' : 'ghost'} sm`}
            onClick={() => {
              sfxTap();
              setMode('char');
            }}
          >
            大字版
          </button>
          <button
            className={`btn ${mode === 'test' ? 'primary' : 'ghost'} sm`}
            onClick={() => {
              sfxTap();
              setMode('test');
            }}
          >
            挖空考考我
          </button>
          <button className="btn sm" onClick={() => setStory(true)}>
            📖 讲故事
          </button>
          <button className="btn sm" onClick={() => setGame(true)}>
            🎮 排排队
          </button>
        </div>

        <button
          className={`btn ${learned ? 'ghost' : 'primary'} block big`}
          style={{ marginTop: 16 }}
          onClick={() => {
            toggleLearned(kid.id, 'learnedPoems', poem.id);
            if (!learned) {
              sfxDing();
              confettiBurst(24);
              bumpStudy(kid, 'poems');
            }
          }}
        >
          {learned ? '已背会 ✓ 点这里取消' : '我背会这首啦！+3 ⭐'}
        </button>

        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn ghost" onClick={onPrev} disabled={!onPrev}>
            ← 上一首
          </button>
          <div className="spacer" />
          <button className="btn ghost" onClick={onNext} disabled={!onNext}>
            下一首 →
          </button>
        </div>
      </div>

      <Sheet open={story} onClose={() => setStory(false)} title={`📖 ${poem.title} 讲了什么`}>
        <p style={{ fontSize: 16, lineHeight: 1.9 }}>{poem.story}</p>
        <button
          className="btn primary block"
          onClick={() => speak(poem.story, { lang: 'zh-CN', rate: 0.85 })}
        >
          🔊 读给我听
        </button>
      </Sheet>

      <Sheet open={game} onClose={() => setGame(false)} title="🎮 诗句排排队">
        {game && <OrderGame poem={poem} onWin={() => undefined} />}
      </Sheet>
    </>
  );
}

export default function Poems({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  // 按 poemPlan 解析出这个孩子要背的诗：启蒙档跳过前 skipStage1 首，
  // 接上进阶档，一共取 take 首。等价于以前写死在 kids.ts 里的那份清单。
  const list = useMemo(() => {
    const stage1 = POEMS.filter((p) => p.stage === 1);
    const stage2 = POEMS.filter((p) => p.stage === 2);
    return [...stage1.slice(kid.poemPlan.skipStage1), ...stage2].slice(0, kid.poemPlan.take);
  }, [kid.poemPlan]);

  const extra = useMemo(() => {
    const chosen = new Set(list.map((p) => p.id));
    return POEMS.filter((p) => !chosen.has(p.id));
  }, [list]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showExtra, setShowExtra] = useState(false);

  const all = showExtra ? [...list, ...extra] : list;
  const idx = all.findIndex((p) => p.id === openId);
  const current = idx >= 0 ? all[idx] : null;

  if (current) {
    return (
      <Detail
        kid={kid}
        poem={current}
        onBack={() => setOpenId(null)}
        onPrev={idx > 0 ? () => setOpenId(all[idx - 1].id) : undefined}
        onNext={idx < all.length - 1 ? () => setOpenId(all[idx + 1].id) : undefined}
      />
    );
  }

  const done = list.filter((p) => st.learnedPoems.includes(p.id)).length;
  const target = kid.goals.find((g) => g.kind === 'poems')?.target ?? list.length;

  return (
    <>
      <AppBar title="📜 古诗小书房" onBack={() => back()} right={<span className="pill">{done}/{target}</span>} />
      <div className="wrap">
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row">
            <b>背会 {done} 首</b>
            <div className="spacer" />
            <span className="muted">目标 {target} 首</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Bar value={done} max={target} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            点一首古诗，可以听朗读、看拼音、听故事，还能玩排排队游戏。
          </p>
        </div>

        <div className="poem-list">
          {list.map((p) => {
            const ok = st.learnedPoems.includes(p.id);
            return (
              <button
                key={p.id}
                className={`poem-item${ok ? ' ok' : ''}`}
                onClick={() => {
                  sfxTap();
                  setOpenId(p.id);
                }}
              >
                <div className="e">{ok ? '✅' : p.emoji}</div>
                <div className="t">{p.title}</div>
                <div className="a">
                  {p.dynasty} · {p.author}
                </div>
              </button>
            );
          })}
        </div>

        {!showExtra ? (
          <button
            className="btn ghost block"
            style={{ marginTop: 16 }}
            onClick={() => {
              sfxTap();
              setShowExtra(true);
            }}
          >
            📚 还想再多背几首？打开加分诗库（{extra.length} 首）
          </button>
        ) : (
          <>
            <div className="section-title">✨ 加分诗库</div>
            <div className="poem-list">
              {extra.map((p) => {
                const ok = st.learnedPoems.includes(p.id);
                return (
                  <button
                    key={p.id}
                    className={`poem-item${ok ? ' ok' : ''}`}
                    onClick={() => setOpenId(p.id)}
                  >
                    <div className="e">{ok ? '✅' : p.emoji}</div>
                    <div className="t">{p.title}</div>
                    <div className="a">
                      {p.dynasty} · {p.author}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        <button className="btn ghost block" style={{ marginTop: 18 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>
    </>
  );
}
