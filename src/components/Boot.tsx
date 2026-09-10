import { useState, useSyncExternalStore } from 'react';
import {
  clearPasscode,
  getCloudInfo,
  getPasscode,
  setPasscode,
  subscribeCloud,
  type CloudInfo,
} from '../lib/cloud';
import { reload } from '../store';

export function useCloudInfo(): CloudInfo {
  return useSyncExternalStore(subscribeCloud, getCloudInfo, getCloudInfo);
}

/**
 * 云端存档就绪前的过渡页：加载中 / 输入家庭口令 / 出错重试。
 * 数据只存在云端，所以这一步没通过就不进业务页面。
 */
export default function Boot() {
  const info = useCloudInfo();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  async function connect() {
    setBusy(true);
    setPasscode(code.trim());
    await reload();
    setBusy(false);
    setCode('');
  }

  async function retry() {
    setBusy(true);
    await reload();
    setBusy(false);
  }

  if (info.status === 'loading') {
    return (
      <div className="boot">
        <div className="wiggle" style={{ fontSize: 56 }}>
          🏆
        </div>
        <h1>BraveKids</h1>
        <p className="muted">正在读取云端存档…</p>
      </div>
    );
  }

  const needCode = info.status === 'need-passcode' || info.status === 'unauthorized';

  return (
    <div className="boot">
      <div style={{ fontSize: 56 }}>{needCode ? '🔒' : '☁️'}</div>
      <h1>BraveKids</h1>

      {needCode ? (
        <>
          <p className="muted">
            {info.status === 'unauthorized'
              ? '口令不对，再试一次'
              : '输入家庭口令，读取云端的打卡记录'}
          </p>
          <input
            className="text-input"
            type="password"
            autoComplete="current-password"
            placeholder="家庭口令"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && code.trim()) void connect();
            }}
          />
          <button
            className="btn primary block"
            style={{ marginTop: 12 }}
            disabled={busy || code.trim().length === 0}
            onClick={() => void connect()}
          >
            {busy ? '连接中…' : '进入'}
          </button>
        </>
      ) : (
        <>
          <p className="muted">{info.message || '连不上云端存档'}</p>
          <button
            className="btn primary block"
            style={{ marginTop: 12 }}
            disabled={busy}
            onClick={() => void retry()}
          >
            {busy ? '重试中…' : '重试'}
          </button>
          {getPasscode() && (
            <button
              className="btn ghost block"
              style={{ marginTop: 10 }}
              onClick={() => {
                clearPasscode();
                void reload();
              }}
            >
              换个口令
            </button>
          )}
        </>
      )}
    </div>
  );
}
