import { useState } from 'react';
import { Sheet } from './ui';
import { sfxTap } from '../lib/sound';
import { clearPasscode, hasUnsaved, retrySave, type CloudInfo } from '../lib/cloud';
import { reload } from '../store';
import { useCloudInfo } from './Boot';

function meta(info: CloudInfo): { text: string; dot: string } {
  if (info.unsaved) return { text: '未保存', dot: '#e5534b' };
  if (info.saving) return { text: '保存中…', dot: '#4c9aff' };
  if (info.status === 'ready') return { text: '已存云端', dot: '#3fb98a' };
  return { text: '云端异常', dot: '#f4a261' };
}

function timeAgo(ts: number | null): string {
  if (!ts) return '本次还没有新改动';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return '刚刚保存';
  if (s < 3600) return `${Math.floor(s / 60)} 分钟前保存`;
  return `${Math.floor(s / 3600)} 小时前保存`;
}

function detail(info: CloudInfo): string {
  if (info.unsaved) return '有改动没存上云端，正在自动重试，先别关页面。';
  if (info.saving) return '正在把刚才的改动写到云端…';
  return '打卡记录都存在云端，换手机或 iPad 输入同一个家庭口令就能接着用。';
}

/** 只读的状态行，用于家长设置面板 */
export function SyncLine() {
  const info = useCloudInfo();
  const m = meta(info);
  return (
    <p className="muted">
      <i
        className="sync-dot"
        style={{ background: m.dot, display: 'inline-block', marginRight: 6 }}
      />
      云端存档：{m.text} · {info.message || timeAgo(info.lastSavedAt)}
      <br />
      {detail(info)}
      <br />
      可以把网页「添加到主屏幕」，用起来像 App 一样。
    </p>
  );
}

export default function SyncBadge() {
  const info = useCloudInfo();
  const [open, setOpen] = useState(false);
  const m = meta(info);

  return (
    <>
      <button
        className="sync-badge"
        onClick={() => {
          sfxTap();
          setOpen(true);
        }}
      >
        <i className="sync-dot" style={{ background: m.dot }} />
        {m.text}
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="云端存档">
        <p className="muted">
          {m.text} · {info.message || timeAgo(info.lastSavedAt)}
        </p>
        <p className="muted">{detail(info)}</p>

        <div className="row" style={{ gap: 10, marginTop: 12 }}>
          {(info.unsaved || info.status !== 'ready') && (
            <button className="btn primary" onClick={() => retrySave()}>
              立即重试
            </button>
          )}
          <button
            className="btn ghost"
            onClick={() => {
              if (hasUnsaved() && !window.confirm('还有改动没存上云端，确定要退出吗？')) return;
              clearPasscode();
              void reload();
            }}
          >
            退出（清除口令）
          </button>
        </div>
      </Sheet>
    </>
  );
}
