import type { Kid, Route } from '../types';
import { addLearned, getState, type ListField, setDaily } from '../store';
import { today } from './date';
import { praise } from './speech';

/**
 * 在学习页学会一项内容时，同步推进首页对应的"每日学习任务"进度。
 * 返回 true 表示这一下刚好把今天的任务完成了。
 */
export function bumpStudy(kid: Kid, route: Route, delta = 1): boolean {
  const task = kid.daily.find((t) => t.kind === 'study' && t.route === route);
  if (!task) return false;
  const rec = getState().kids[kid.id].daily[today()]?.[task.id];
  const value = Math.max(0, (rec?.value || 0) + delta);
  const goal = task.dailyGoal ?? 1;
  const done = !!rec?.done;
  setDaily(kid.id, task.id, { value, done: done || value >= goal });
  const justDone = !done && value >= goal;
  if (justDone) praise(kid.nick, true);
  return justDone;
}

/**
 * 小测验答对时使用：只有第一次学会才记一次进度，重复答对不会刷进度。
 * 返回 true 表示这是新学会的内容。
 */
export function learnOnce(
  kid: Kid,
  field: ListField,
  key: string,
  route: Route,
): boolean {
  if (getState().kids[kid.id][field].includes(key)) return false;
  addLearned(kid.id, field, key);
  bumpStudy(kid, route);
  return true;
}
