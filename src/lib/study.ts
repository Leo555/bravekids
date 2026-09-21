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
  // 已认识的内容答对也计一次当日进度（复习算数），但列表不重复加
  const known = getState().kids[kid.id][field].includes(key);
  if (!known) addLearned(kid.id, field, key);
  bumpStudy(kid, route);
  return !known;
}

/**
 * 认汉字任务专用：需要「当天认了新字」+「挑战全对通过」两项都满足才算完成。
 * 用 daily[date][taskId] 的两个字段分别表达这两个条件：
 *   - value = 当天新认的字数（认字卡点新字时 +1，复习不重复加）
 *   - done  = 挑战是否已全对通过
 * 返回 { isNew, justDone }：
 *   - isNew    = 这次是不是真认了一个新字（复习旧字为 false）
 *   - justDone = 这一步是否刚好让任务第一次变成完成状态
 */
export function markNewHanzi(
  kid: Kid,
  key: string,
): { isNew: boolean; justDone: boolean } {
  const task = kid.daily.find((t) => t.kind === 'study' && t.route === 'hanzi');
  if (!task) return { isNew: false, justDone: false };
  const st = getState().kids[kid.id];
  // 只统计真正的新字：已认识列表里没有才算新字
  if (st.learnedHanzi.includes(key)) return { isNew: false, justDone: false };
  addLearned(kid.id, 'learnedHanzi', key);

  const rec = st.daily[today()]?.[task.id];
  const value = (rec?.value || 0) + 1;
  const challengeDone = !!rec?.done;
  // 任务完成 = 挑战已通过(challengeDone) 且 认了至少一个新字(value>=1)。
  // 「这一步刚好完成」= 挑战已通过 + 之前还没认过新字（value 从 0 -> 1）
  const justDone = challengeDone && (rec?.value || 0) === 0;
  setDaily(kid.id, task.id, { value, done: challengeDone });
  if (justDone) praise(kid.nick, true);
  return { isNew: true, justDone };
}

/**
 * 认汉字挑战全对通过时调用：把「挑战通过」标记置 true，
 * 若当天也已经认了新字（value >= 1），则任务完成。
 * 返回 true 表示任务就此完成（拿到积分）。
 */
export function markHanziChallenge(kid: Kid): boolean {
  const task = kid.daily.find((t) => t.kind === 'study' && t.route === 'hanzi');
  if (!task) return false;
  const rec = getState().kids[kid.id].daily[today()]?.[task.id];
  const value = rec?.value || 0;
  const wasDone = !!rec?.done;
  setDaily(kid.id, task.id, { value, done: true });
  const justDone = !wasDone && value >= 1;
  if (justDone) praise(kid.nick, true);
  return justDone;
}
