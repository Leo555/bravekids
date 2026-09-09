/** 九九乘法口诀（45 句） */

export interface MultiItem {
  id: string; // '3x4'
  a: number;
  b: number;
  result: number;
  /** 口诀，如 三四十二 */
  chant: string;
}

const CN = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function cnNumber(n: number): string {
  if (n < 10) return CN[n];
  const shi = Math.floor(n / 10);
  const ge = n % 10;
  return `${shi > 1 ? CN[shi] : ''}十${ge ? CN[ge] : ''}`;
}

function makeChant(a: number, b: number): string {
  const r = a * b;
  const head = `${CN[a]}${CN[b]}`;
  return r < 10 ? `${head}得${cnNumber(r)}` : `${head}${cnNumber(r)}`;
}

export const MULTI: MultiItem[] = (() => {
  const list: MultiItem[] = [];
  for (let b = 1; b <= 9; b++) {
    for (let a = 1; a <= b; a++) {
      list.push({ id: `${a}x${b}`, a, b, result: a * b, chant: makeChant(a, b) });
    }
  }
  return list;
})();

/** 按被乘数分列，方便展示成口诀表 */
export const MULTI_COLUMNS: MultiItem[][] = Array.from({ length: 9 }, (_, i) =>
  MULTI.filter((m) => m.b === i + 1),
);
