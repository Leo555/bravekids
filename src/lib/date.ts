/** 日期工具：全部使用本地时区 */

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toKey(new Date());
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const d = parseKey(key);
  d.setDate(d.getDate() + delta);
  return toKey(d);
}

/** 周一为一周的开始，返回如 2026-W37 */
export function weekKey(dateKey: string = today()): string {
  const d = parseKey(dateKey);
  const day = (d.getDay() + 6) % 7; // 周一 -> 0
  d.setDate(d.getDate() - day);
  const monday = d;
  const firstDay = new Date(monday.getFullYear(), 0, 1);
  const diff = Math.floor((monday.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.floor((diff + ((firstDay.getDay() + 6) % 7)) / 7) + 1;
  return `${monday.getFullYear()}-W${`${week}`.padStart(2, '0')}`;
}

/** 本周的 7 天 key（周一 ~ 周日） */
export function weekDays(dateKey: string = today()): string[] {
  const d = parseKey(dateKey);
  const day = (d.getDay() + 6) % 7;
  const monday = addDays(dateKey, -day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export const WEEK_LABEL = ['一', '二', '三', '四', '五', '六', '日'];

export function prettyDate(key: string = today()): string {
  const d = parseKey(key);
  const w = WEEK_LABEL[(d.getDay() + 6) % 7];
  return `${d.getMonth() + 1}月${d.getDate()}日 星期${w}`;
}

/** 最近 n 天（含今天），从早到晚 */
export function lastDays(n: number, from: string = today()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(from, i - n + 1));
}
