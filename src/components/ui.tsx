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
          stroke="rgba(51,49,59,0.08)"
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
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
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
      className="sheet-mask"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sfxTap();
          onClose();
        }
      }}
    >
      <div className="sheet">
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

export function themeStyle(color: string, color2: string): CSSProperties {
  return { ['--c1' as string]: color, ['--c2' as string]: color2 } as CSSProperties;
}
