/** 全局类型定义 */

export type KidId = 'cun' | 'heng';

export type Route =
  | 'kids'
  | 'home'
  | 'poems'
  | 'hanzi'
  | 'words'
  | 'math'
  | 'pinyin'
  | 'badges';

/** 每日任务的玩法类型 */
export type TaskKind =
  | 'counter' // 计数器：跳绳 800 个
  | 'timer' // 计时挑战：跳绳一分钟
  | 'study' // 学习任务：跳到对应学习页完成今日份
  | 'simple'; // 直接打卡

export interface DailyTask {
  id: string;
  title: string;
  emoji: string;
  kind: TaskKind;
  /** 完成可得几颗星 */
  stars: number;
  /** counter：目标数量 */
  target?: number;
  /** counter：快捷加的步长 */
  steps?: number[];
  unit?: string;
  /** timer：秒数 */
  seconds?: number;
  /** study：跳转的学习页 */
  route?: Route;
  /** study：今天需要完成几个（新词 / 新字 / 新诗句） */
  dailyGoal?: number;
  tip?: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  emoji: string;
  /** 每周需要几次 */
  timesPerWeek: number;
  stars: number;
  tip?: string;
}

export type GoalKind = 'words' | 'hanzi' | 'poems' | 'math' | 'pinyin';

export interface LongGoal {
  id: string;
  title: string;
  emoji: string;
  target: number;
  unit: string;
  kind: GoalKind;
  route: Route;
}

export interface Kid {
  id: KidId;
  name: string;
  nick: string;
  age: number;
  grade: string;
  avatar: string;
  /** 主题色 */
  color: string;
  color2: string;
  slogan: string;
  daily: DailyTask[];
  weekly: WeeklyTask[];
  goals: LongGoal[];
  /**
   * 要背哪些古诗。这里只放「规则」而不是算好的 id 列表，
   * 是为了让 data/kids.ts 不去 import 体积很大的 data/poems.ts —— 否则
   * 33KB 诗词数据会被拖进首屏 bundle。实际 id 在古诗页按规则解析。
   */
  poemPlan: {
    /** 跳过启蒙档(stage 1)的前几首 */
    skipStage1: number;
    /** 一共背几首 */
    take: number;
  };
  /** 汉字学习范围（取前 N 个） */
  hanziCount: number;
  /** 单词学习范围（取前 N 个） */
  wordCount: number;
  /** 学习页开关 */
  features: Route[];
}

/* ------------------------- 学习内容 ------------------------- */

export interface PoemLine {
  /** 一句诗 */
  text: string;
  /** 对应拼音，按字空格分隔 */
  pinyin: string;
}

export interface Poem {
  id: string;
  title: string;
  titlePinyin: string;
  author: string;
  dynasty: string;
  /** 1 = 启蒙（适合 5 岁），2 = 进阶（适合 7 岁） */
  stage: 1 | 2;
  lines: PoemLine[];
  /** 白话小故事，给孩子讲的 */
  story: string;
  emoji: string;
}

export interface Hanzi {
  char: string;
  pinyin: string;
  strokes: number;
  /** 组词 */
  words: string[];
  /** 分组主题 */
  group: string;
}

export interface Word {
  en: string;
  zh: string;
  ipa: string;
  emoji: string;
  /** 主题单元 */
  unit: string;
}

export interface PinyinItem {
  letter: string;
  /** 读法提示 */
  say: string;
  type: '声母' | '韵母' | '整体认读';
  /** 举例 */
  example: string;
}

/* ------------------------- 进度存档 ------------------------- */

export interface TaskRecord {
  done: boolean;
  value: number;
}

export interface KidState {
  /** 日期(YYYY-MM-DD) -> 任务 id -> 记录 */
  daily: Record<string, Record<string, TaskRecord>>;
  /** 周(YYYY-Www) -> 任务 id -> 完成次数 */
  weekly: Record<string, Record<string, number>>;
  learnedWords: string[];
  learnedHanzi: string[];
  learnedPoems: string[];
  mathMastered: string[];
  learnedPinyin: string[];
  /** 一分钟跳绳最好成绩 */
  bestJumpMinute: number;
  /** 小测验最好成绩 */
  quizBest: Record<string, number>;
}

export interface AppState {
  version: number;
  current: KidId | null;
  kids: Record<KidId, KidState>;
}
