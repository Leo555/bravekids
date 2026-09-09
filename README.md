# BraveKids · 小勇士打卡乐园

> 给自家两个小朋友做的「运动 + 学习」每日打卡应用 —— 李一存（7 岁）& 李一珩（5 岁），2026 下半年计划。

纯前端、无后端、无账号，数据全部保存在浏览器本地，打开即用。手机竖屏体验优先。

---

## 特性

- **双人档案**：兄弟俩各自独立的任务清单、主题色、学习范围与进度存档。
- **每日任务**：支持 4 种玩法
  - `counter` 计数器（跳绳 800 个，支持 +10/+50/+100 快捷加）
  - `timer` 计时挑战（一分钟跳绳，自动记录最好成绩）
  - `study` 学习任务（跳转到对应学习页完成今日份）
  - `simple` 直接打卡
- **每周任务**：按「每周 N 次」累计，如家务、户外运动。
- **长期目标**：半年目标进度条（背 30 首古诗 / 认 300 个单词 / 识 100 个汉字等）。
- **五个学习模块**
  | 模块 | 内容 | 面向 |
  |---|---|---|
  | 古诗 📜 | 46 首，逐句注音 + 白话小故事 | 分启蒙/进阶两档（弟弟 10 首 / 哥哥 30 首） |
  | 英语单词 🔤 | 300 词，主题分单元，含音标 | 哥哥 |
  | 乘法口诀 ✖️ | 九九表 45 条，按列闯关 | 哥哥 |
  | 汉字 🀄 | 100 字，含拼音、笔画数、组词 | 弟弟 |
  | 拼音 🔠 | 63 个声母/韵母/整体认读 | 弟弟 |
- **激励系统**：星星积分 → 6 级成长等级（🌱 小树苗 → 🌟 闪耀星球），每人 14 枚成就徽章（按开启的学习模块动态生成），连续打卡 streak 统计。
- **儿童向交互**：Web Speech 朗读（古诗/单词/汉字发音）、Web Audio 音效、彩带撒花与飞星动画。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5180
```

其他命令：

```bash
npm run build    # tsc -b && vite build  →  dist/
npm run preview  # 本地预览产物
```

Vite 已配置 `server.host = true`，同一 Wi-Fi 下用手机访问终端打印的局域网地址即可真机体验。
`base: './'` 为相对路径，构建产物可直接扔到任意静态托管（GitHub Pages / 对象存储 / 本地文件）。

## 技术栈

React 18 + TypeScript 5 + Vite 5，零 UI 库、零状态管理库、零路由库。

- **状态管理**：`useSyncExternalStore` + 手写 store（`src/store.ts`），localStorage 持久化
- **路由**：`hashchange` 手写 hash 路由，共 8 个路由（`kids` / `home` / `poems` / `hanzi` / `words` / `math` / `pinyin` / `badges`）
- **样式**：单文件原生 CSS
- **依赖**：运行时依赖只有 `react` / `react-dom`

## 目录结构

```
src/
├── components/          # CounterSheet 计数面板、TimerSheet 计时面板、Quiz 小测、ui 基础组件
├── data/                # 静态学习内容（古诗/单词/汉字/拼音/乘法）与两个孩子的任务配置
│   └── kids.ts          # ★ 想改任务、目标、学习量，改这里
├── lib/
│   ├── date.ts          # 日期 / 周 key / 连续天数辅助
│   ├── progress.ts      # 星星、等级、徽章、统计计算
│   ├── speech.ts        # Web Speech 朗读
│   ├── sound.ts         # Web Audio 音效
│   └── celebrate.ts     # 撒花 / 飞星动画
├── pages/               # Kids 选人、Home 首页、Badges 勋章、Poems、Words、Hanzi、Pinyin、MathPage
├── styles/global.css    # 全部样式
├── App.tsx              # 路由分发
├── main.tsx             # 入口
├── store.ts             # 全局 store + hash 路由
└── types.ts             # 全部类型定义
```

## 数据存储

所有进度存在 localStorage，key 为 `kids-center-v1`，结构见 `src/types.ts` 的 `AppState`。

- 不上传任何数据，不联网，无第三方统计。
- 清浏览器数据 / 换设备 / 换浏览器 = 进度丢失，目前没有导出与同步功能。
- 隐私模式下写入失败会被静默忽略，不影响使用。

## 自定义

改成自己家孩子的计划，只需要动 `src/data/kids.ts`：

```ts
export const KIDS: Kid[] = [
  {
    id: 'cun',
    name: '李一存',
    nick: '存哥',
    age: 7,
    avatar: '🦁',
    color: '#ff8c42',
    slogan: '一天不断，越跳越强！',
    features: ['words', 'math', 'poems'], // 开启哪些学习页
    wordCount: 300,                        // 单词学习范围
    hanziCount: 0,
    daily: [ /* 每日任务 */ ],
    weekly: [ /* 每周任务 */ ],
    goals: [ /* 长期目标 */ ],
  },
  // ...
];
```

- 新增孩子需要同步扩展 `src/types.ts` 里的 `KidId` 与 `store.ts` 的初始 state。
- 等级阈值、徽章列表在 `src/lib/progress.ts` 的 `LEVELS` 与 `badgesOf()`。

## 浏览器支持

现代浏览器即可。朗读依赖 `speechSynthesis`（不支持时自动隐藏发音按钮），音效依赖 `AudioContext`（需用户先交互一次）。iOS Safari / Android Chrome 已实测。

## License

私人项目，仅供自用与参考。
