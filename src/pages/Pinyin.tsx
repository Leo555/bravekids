import { useMemo, useState } from 'react';
import type { Kid, PinyinItem } from '../types';
import { PINYIN, PINYIN_TYPES } from '../data/pinyin';
import { AppBar, Bar, Chips, Sheet } from '../components/ui';
import { toggleLearned, useAppState } from '../store';
import { back, go } from '../router';
import { speak } from '../lib/speech';
import { sfxDing, sfxTap } from '../lib/sound';
import { confettiBurst } from '../lib/celebrate';
import { bumpStudy } from '../lib/study';

const HAN = /[\u4e00-\u9fa5]+/g;

/** 用例句里的汉字发音，比直接读字母准确 */
function sayItem(p: PinyinItem) {
  const han = p.example.match(HAN);
  const text = han ? han.join('') : p.letter;
  speak(text, { lang: 'zh-CN', rate: 0.7 });
}

export default function PinyinPage({ kid }: { kid: Kid }) {
  const app = useAppState();
  const st = app.kids[kid.id];
  const [type, setType] = useState<PinyinItem['type']>(PINYIN_TYPES[0]);
  const [open, setOpen] = useState<PinyinItem | null>(null);

  const list = useMemo(() => PINYIN.filter((p) => p.type === type), [type]);
  const done = st.learnedPinyin.length;

  return (
    <>
      <AppBar
        title="🔠 拼音字母表"
        onBack={() => back()}
        right={<span className="pill">{done}/{PINYIN.length}</span>}
      />
      <div className="wrap">
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row">
            <b>会读 {done} 个</b>
            <div className="spacer" />
            <span className="muted">共 {PINYIN.length} 个</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Bar value={done} max={PINYIN.length} />
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            点字母听例词，会读的点一下卡片右上角变绿 ✓。
          </p>
          <button
            className="btn primary block"
            style={{ marginTop: 10 }}
            onClick={() =>
              speak(list.map((p) => p.example.replace(/[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ ]/g, '')).join('，'), {
                lang: 'zh-CN',
                rate: 0.8,
              })
            }
          >
            🔊 整组例词读一遍
          </button>
        </div>

        <Chips
          items={PINYIN_TYPES}
          value={type}
          onChange={setType}
          label={(t) => `${t}（${PINYIN.filter((p) => p.type === t).length}）`}
        />

        <div className="py-grid">
          {list.map((p) => {
            const ok = st.learnedPinyin.includes(p.letter);
            return (
              <button
                key={p.letter}
                className={`py-cell${ok ? ' ok' : ''}`}
                onClick={() => {
                  sfxTap();
                  sayItem(p);
                  setOpen(p);
                }}
              >
                <b>{p.letter}</b>
                <span>{p.say}</span>
              </button>
            );
          })}
        </div>

        <button className="btn ghost block" style={{ marginTop: 18 }} onClick={() => go('home')}>
          ← 回到今天的打卡
        </button>
      </div>

      <Sheet open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.1 }}>{open.letter}</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>读作 {open.say}</div>
            <p className="muted">
              {open.type} · 例：{open.example}
            </p>
            <button className="btn block" onClick={() => sayItem(open)}>
              🔊 听例词
            </button>
            <button
              className={`btn ${st.learnedPinyin.includes(open.letter) ? 'ghost' : 'primary'} block big`}
              style={{ marginTop: 10 }}
              onClick={() => {
                const was = st.learnedPinyin.includes(open.letter);
                toggleLearned(kid.id, 'learnedPinyin', open.letter);
                if (!was) {
                  sfxDing();
                  confettiBurst(14);
                  bumpStudy(kid, 'pinyin');
                }
              }}
            >
              {st.learnedPinyin.includes(open.letter) ? '已会读 ✓ 取消' : '我会读啦！+1 ⭐'}
            </button>
          </div>
        )}
      </Sheet>
    </>
  );
}
