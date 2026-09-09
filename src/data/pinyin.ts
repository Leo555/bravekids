import type { PinyinItem } from '../types';

/** 声母 23 + 韵母 24 + 整体认读 16 = 63 */
export const PINYIN: PinyinItem[] = [
  // 声母 23
  { letter: 'b', say: 'bō', type: '声母', example: '爸爸 bà ba' },
  { letter: 'p', say: 'pō', type: '声母', example: '婆婆 pó po' },
  { letter: 'm', say: 'mō', type: '声母', example: '妈妈 mā ma' },
  { letter: 'f', say: 'fō', type: '声母', example: '佛 fó' },
  { letter: 'd', say: 'dē', type: '声母', example: '大 dà' },
  { letter: 't', say: 'tē', type: '声母', example: '天 tiān' },
  { letter: 'n', say: 'nē', type: '声母', example: '牛 niú' },
  { letter: 'l', say: 'lē', type: '声母', example: '路 lù' },
  { letter: 'g', say: 'gē', type: '声母', example: '哥哥 gē ge' },
  { letter: 'k', say: 'kē', type: '声母', example: '看 kàn' },
  { letter: 'h', say: 'hē', type: '声母', example: '喝 hē' },
  { letter: 'j', say: 'jī', type: '声母', example: '鸡 jī' },
  { letter: 'q', say: 'qī', type: '声母', example: '七 qī' },
  { letter: 'x', say: 'xī', type: '声母', example: '西 xī' },
  { letter: 'zh', say: 'zhī', type: '声母', example: '知 zhī' },
  { letter: 'ch', say: 'chī', type: '声母', example: '吃 chī' },
  { letter: 'sh', say: 'shī', type: '声母', example: '狮 shī' },
  { letter: 'r', say: 'rī', type: '声母', example: '日 rì' },
  { letter: 'z', say: 'zī', type: '声母', example: '字 zì' },
  { letter: 'c', say: 'cī', type: '声母', example: '草 cǎo' },
  { letter: 's', say: 'sī', type: '声母', example: '四 sì' },
  { letter: 'y', say: 'yī', type: '声母', example: '衣 yī' },
  { letter: 'w', say: 'wū', type: '声母', example: '屋 wū' },

  // 单韵母 6
  { letter: 'a', say: 'ā', type: '韵母', example: '啊 ā' },
  { letter: 'o', say: 'ō', type: '韵母', example: '哦 ó' },
  { letter: 'e', say: 'ē', type: '韵母', example: '鹅 é' },
  { letter: 'i', say: 'ī', type: '韵母', example: '衣 yī' },
  { letter: 'u', say: 'ū', type: '韵母', example: '乌 wū' },
  { letter: 'ü', say: 'ǖ', type: '韵母', example: '鱼 yú' },

  // 复韵母 9
  { letter: 'ai', say: 'āi', type: '韵母', example: '爱 ài' },
  { letter: 'ei', say: 'ēi', type: '韵母', example: '飞 fēi' },
  { letter: 'ui', say: 'uī', type: '韵母', example: '水 shuǐ' },
  { letter: 'ao', say: 'āo', type: '韵母', example: '猫 māo' },
  { letter: 'ou', say: 'ōu', type: '韵母', example: '手 shǒu' },
  { letter: 'iu', say: 'iū', type: '韵母', example: '牛 niú' },
  { letter: 'ie', say: 'iē', type: '韵母', example: '叶 yè' },
  { letter: 'üe', say: 'üē', type: '韵母', example: '月 yuè' },
  { letter: 'er', say: 'ēr', type: '韵母', example: '耳 ěr' },

  // 前后鼻韵母 9
  { letter: 'an', say: 'ān', type: '韵母', example: '山 shān' },
  { letter: 'en', say: 'ēn', type: '韵母', example: '门 mén' },
  { letter: 'in', say: 'īn', type: '韵母', example: '心 xīn' },
  { letter: 'un', say: 'ūn', type: '韵母', example: '春 chūn' },
  { letter: 'ün', say: 'ǖn', type: '韵母', example: '云 yún' },
  { letter: 'ang', say: 'āng', type: '韵母', example: '羊 yáng' },
  { letter: 'eng', say: 'ēng', type: '韵母', example: '灯 dēng' },
  { letter: 'ing', say: 'īng', type: '韵母', example: '星 xīng' },
  { letter: 'ong', say: 'ōng', type: '韵母', example: '红 hóng' },

  // 整体认读音节 16
  { letter: 'zhi', say: 'zhī', type: '整体认读', example: '纸 zhǐ' },
  { letter: 'chi', say: 'chī', type: '整体认读', example: '吃 chī' },
  { letter: 'shi', say: 'shī', type: '整体认读', example: '十 shí' },
  { letter: 'ri', say: 'rì', type: '整体认读', example: '日 rì' },
  { letter: 'zi', say: 'zī', type: '整体认读', example: '字 zì' },
  { letter: 'ci', say: 'cī', type: '整体认读', example: '词 cí' },
  { letter: 'si', say: 'sī', type: '整体认读', example: '四 sì' },
  { letter: 'yi', say: 'yī', type: '整体认读', example: '一 yī' },
  { letter: 'wu', say: 'wū', type: '整体认读', example: '五 wǔ' },
  { letter: 'yu', say: 'yū', type: '整体认读', example: '鱼 yú' },
  { letter: 'ye', say: 'yē', type: '整体认读', example: '叶 yè' },
  { letter: 'yue', say: 'yuē', type: '整体认读', example: '月 yuè' },
  { letter: 'yin', say: 'yīn', type: '整体认读', example: '音乐 yīn yuè' },
  { letter: 'yun', say: 'yūn', type: '整体认读', example: '云 yún' },
  { letter: 'yuan', say: 'yuān', type: '整体认读', example: '圆 yuán' },
  { letter: 'ying', say: 'yīng', type: '整体认读', example: '莺 yīng' },
];

export const PINYIN_TYPES: PinyinItem['type'][] = ['声母', '韵母', '整体认读'];
