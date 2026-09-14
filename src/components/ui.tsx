import type { CSSProperties, ReactNode } from 'react';
import { useEffect } from 'react';
import { sfxTap } from '../lib/sound';

export function AppBar({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="appbar">
      {onBack && (
        <button className="iconbtn" onClick={onBack} aria-label="返回">
          ←
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}

export function Bar({ value, max, thin }: { value: number; max: number; thin?: boolean }) {
  const pct = max <= 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className={`bar${thin ? ' thin' : ''}`}>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Ring({
  progress,
  size = 190,
  stroke = 16,
  color = 'var(--c1)',
  children,
}: {
  progress: number;
  size?: number;
  stroke?: number;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(31,35,48,0.07)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - p)}
          style={{ transition: 'stroke-dashoffset .4s ease' }}
        />
      </svg>
      <div className="mid">{children}</div>
    </div>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
  center = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 居中显示（默认是底部抽屉） */
  center?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className={center ? 'sheet-mask center' : 'sheet-mask'}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sfxTap();
          onClose();
        }
      }}
    >
      <div className={center ? 'sheet center' : 'sheet'}>
        <div className="row">
          {title && <h3>{title}</h3>}
          <div className="spacer" />
          <button className="iconbtn" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Chips<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: T[];
  value: T;
  onChange: (v: T) => void;
  label?: (v: T) => string;
}) {
  return (
    <div className="chips">
      {items.map((it) => (
        <button
          key={it}
          className={`chip${it === value ? ' on' : ''}`}
          onClick={() => {
            sfxTap();
            onChange(it);
          }}
        >
          {label ? label(it) : it}
        </button>
      ))}
    </div>
  );
}

export function Empty({ text, emoji = '🐣' }: { text: string; emoji?: string }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 28 }}>
      <div style={{ fontSize: 46 }}>{emoji}</div>
      <p className="muted">{text}</p>
    </div>
  );
}

/** hex -> rgba，用于生成主题色的半透明变量 */
function alpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * 把 hex 与 #fff8f1（带轻微暖意的纸白色）按 t (0..1) 混合。
 * 暖色主题能避免粉化（直接与 #fff 混合会让 #ff7a59 变成肤色），
 * 冷色主题仍然清爽。
 */
function tint(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (v: number, w: number) => Math.round(v + (w - v) * 0.9);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(f(r, 0xff))}${toHex(f(g, 0xf8))}${toHex(f(b, 0xf1))}`;
}
function tint2(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const f = (v: number, w: number) => Math.round(v + (w - v) * 0.78);
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(f(r, 0xff))}${toHex(f(g, 0xf8))}${toHex(f(b, 0xf1))}`;
}

export function themeStyle(color: string, color2: string): CSSProperties {
  return {
    ['--c1' as string]: color,
    ['--c2' as string]: color2,
    '--c1-a14': alpha(color, 0.14),
    ['--c1-a22' as string]: alpha(color, 0.22),
    ['--c1-a36' as string]: alpha(color, 0.36),
    ['--c2-a22' as string]: alpha(color2, 0.22),
    ['--c2-a38' as string]: alpha(color2, 0.38),
    '--c-tint': tint(color),
    '--c-tint-2': tint2(color),
  } as CSSProperties;
}
