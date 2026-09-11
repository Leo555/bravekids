import type { Hanzi } from '../types';

/**
 * 100 个「会写字」，按部编版（统编版）语文一年级上册《写字表》整理，分 8 组。
 * 每组对应教材的识字单元 / 课文单元，字均标注规范拼音、笔画数与课本常用组词，
 * 比启蒙字更强调书写规范，适合即将进入/正在读一年级的孩子。
 */
export const HANZI: Hanzi[] = [
  // 第 1 单元 · 天地人 / 金木水火土
  { char: '天', pinyin: 'tiān', strokes: 4, words: ['蓝天', '天空'], group: '识字一' },
  { char: '地', pinyin: 'dì', strokes: 6, words: ['大地', '地球'], group: '识字一' },
  { char: '人', pinyin: 'rén', strokes: 2, words: ['大人', '人们'], group: '识字一' },
  { char: '你', pinyin: 'nǐ', strokes: 7, words: ['你好', '你们'], group: '识字一' },
  { char: '我', pinyin: 'wǒ', strokes: 7, words: ['我们', '我的'], group: '识字一' },
  { char: '他', pinyin: 'tā', strokes: 5, words: ['他们', '他的'], group: '识字一' },
  { char: '一', pinyin: 'yī', strokes: 1, words: ['一个', '一天'], group: '识字一' },
  { char: '二', pinyin: 'èr', strokes: 2, words: ['二月', '二只'], group: '识字一' },
  { char: '三', pinyin: 'sān', strokes: 3, words: ['三个', '三月'], group: '识字一' },
  { char: '四', pinyin: 'sì', strokes: 5, words: ['四个', '四季'], group: '识字一' },
  { char: '五', pinyin: 'wǔ', strokes: 4, words: ['五个', '五月'], group: '识字一' },
  { char: '上', pinyin: 'shàng', strokes: 3, words: ['上下', '上面'], group: '识字一' },
  { char: '下', pinyin: 'xià', strokes: 3, words: ['下雨', '下面'], group: '识字一' },

  // 第 2 单元 · 口耳目 / 日月水火
  { char: '口', pinyin: 'kǒu', strokes: 3, words: ['开口', '门口'], group: '识字二' },
  { char: '耳', pinyin: 'ěr', strokes: 6, words: ['耳朵', '木耳'], group: '识字二' },
  { char: '目', pinyin: 'mù', strokes: 5, words: ['目光', '双目'], group: '识字二' },
  { char: '手', pinyin: 'shǒu', strokes: 4, words: ['小手', '手心'], group: '识字二' },
  { char: '足', pinyin: 'zú', strokes: 7, words: ['足球', '手足'], group: '识字二' },
  { char: '日', pinyin: 'rì', strokes: 4, words: ['日出', '生日'], group: '识字二' },
  { char: '月', pinyin: 'yuè', strokes: 4, words: ['月亮', '明月'], group: '识字二' },
  { char: '水', pinyin: 'shuǐ', strokes: 4, words: ['河水', '开水'], group: '识字二' },
  { char: '火', pinyin: 'huǒ', strokes: 4, words: ['火车', '大火'], group: '识字二' },
  { char: '山', pinyin: 'shān', strokes: 3, words: ['大山', '山坡'], group: '识字二' },
  { char: '石', pinyin: 'shí', strokes: 5, words: ['石头', '石子'], group: '识字二' },
  { char: '田', pinyin: 'tián', strokes: 5, words: ['田地', '水田'], group: '识字二' },
  { char: '禾', pinyin: 'hé', strokes: 5, words: ['禾苗', '锄禾'], group: '识字二' },

  // 第 3 单元 · 对韵歌 / 画
  { char: '云', pinyin: 'yún', strokes: 4, words: ['白云', '云朵'], group: '识字三' },
  { char: '雨', pinyin: 'yǔ', strokes: 8, words: ['下雨', '雨点'], group: '识字三' },
  { char: '风', pinyin: 'fēng', strokes: 4, words: ['大风', '风雨'], group: '识字三' },
  { char: '花', pinyin: 'huā', strokes: 7, words: ['花朵', '开花'], group: '识字三' },
  { char: '鸟', pinyin: 'niǎo', strokes: 5, words: ['小鸟', '鸟儿'], group: '识字三' },
  { char: '虫', pinyin: 'chóng', strokes: 6, words: ['虫子', '昆虫'], group: '识字三' },
  { char: '去', pinyin: 'qù', strokes: 5, words: ['回去', '过去'], group: '识字三' },
  { char: '来', pinyin: 'lái', strokes: 7, words: ['回来', '来了'], group: '识字三' },
  { char: '不', pinyin: 'bù', strokes: 4, words: ['不好', '不是'], group: '识字三' },
  { char: '小', pinyin: 'xiǎo', strokes: 3, words: ['大小', '小心'], group: '识字三' },
  { char: '少', pinyin: 'shǎo', strokes: 4, words: ['多少', '少见'], group: '识字三' },
  { char: '牛', pinyin: 'niú', strokes: 4, words: ['黄牛', '牛奶'], group: '识字三' },
  { char: '果', pinyin: 'guǒ', strokes: 8, words: ['苹果', '果子'], group: '识字三' },

  // 第 4 单元 · 小书包 / 日月明 / 升国旗
  { char: '早', pinyin: 'zǎo', strokes: 6, words: ['早上', '早安'], group: '识字四' },
  { char: '书', pinyin: 'shū', strokes: 4, words: ['看书', '书包'], group: '识字四' },
  { char: '刀', pinyin: 'dāo', strokes: 2, words: ['小刀', '刀子'], group: '识字四' },
  { char: '尺', pinyin: 'chǐ', strokes: 4, words: ['尺子', '直尺'], group: '识字四' },
  { char: '本', pinyin: 'běn', strokes: 5, words: ['本子', '课本'], group: '识字四' },
  { char: '木', pinyin: 'mù', strokes: 4, words: ['木头', '树木'], group: '识字四' },
  { char: '林', pinyin: 'lín', strokes: 8, words: ['树林', '竹林'], group: '识字四' },
  { char: '土', pinyin: 'tǔ', strokes: 3, words: ['泥土', '土地'], group: '识字四' },
  { char: '力', pinyin: 'lì', strokes: 2, words: ['力气', '用力'], group: '识字四' },
  { char: '心', pinyin: 'xīn', strokes: 4, words: ['开心', '心里'], group: '识字四' },
  { char: '中', pinyin: 'zhōng', strokes: 4, words: ['中国', '中间'], group: '识字四' },
  { char: '立', pinyin: 'lì', strokes: 5, words: ['立正', '站立'], group: '识字四' },
  { char: '正', pinyin: 'zhèng', strokes: 5, words: ['立正', '正好'], group: '识字四' },

  // 第 5 单元 · 秋天 / 小小的船 / 江南
  { char: '了', pinyin: 'le', strokes: 2, words: ['好了', '来了'], group: '课文一' },
  { char: '子', pinyin: 'zǐ', strokes: 3, words: ['孩子', '儿子'], group: '课文一' },
  { char: '大', pinyin: 'dà', strokes: 3, words: ['大人', '大小'], group: '课文一' },
  { char: '儿', pinyin: 'ér', strokes: 2, words: ['儿子', '月儿'], group: '课文一' },
  { char: '头', pinyin: 'tóu', strokes: 5, words: ['头发', '点头'], group: '课文一' },
  { char: '里', pinyin: 'lǐ', strokes: 7, words: ['里面', '这里'], group: '课文一' },
  { char: '可', pinyin: 'kě', strokes: 5, words: ['可以', '可是'], group: '课文一' },
  { char: '东', pinyin: 'dōng', strokes: 5, words: ['东方', '东西'], group: '课文一' },
  { char: '西', pinyin: 'xī', strokes: 6, words: ['西方', '东西'], group: '课文一' },
  { char: '是', pinyin: 'shì', strokes: 9, words: ['可是', '不是'], group: '课文一' },
  { char: '在', pinyin: 'zài', strokes: 6, words: ['现在', '正在'], group: '课文一' },
  { char: '后', pinyin: 'hòu', strokes: 6, words: ['后面', '以后'], group: '课文一' },
  { char: '好', pinyin: 'hǎo', strokes: 6, words: ['你好', '好人'], group: '课文一' },

  // 第 6 单元 · 四季 / 影子 / 比尾巴
  { char: '长', pinyin: 'cháng', strokes: 4, words: ['长短', '长大'], group: '课文二' },
  { char: '比', pinyin: 'bǐ', strokes: 4, words: ['比一比', '比如'], group: '课文二' },
  { char: '巴', pinyin: 'bā', strokes: 4, words: ['尾巴', '嘴巴'], group: '课文二' },
  { char: '把', pinyin: 'bǎ', strokes: 7, words: ['把手', '一把'], group: '课文二' },
  { char: '个', pinyin: 'gè', strokes: 3, words: ['一个', '个子'], group: '课文二' },
  { char: '星', pinyin: 'xīng', strokes: 9, words: ['星星', '星空'], group: '课文二' },
  { char: '们', pinyin: 'men', strokes: 5, words: ['我们', '他们'], group: '课文二' },
  { char: '问', pinyin: 'wèn', strokes: 6, words: ['问好', '问题'], group: '课文二' },
  { char: '有', pinyin: 'yǒu', strokes: 6, words: ['没有', '有的'], group: '课文二' },
  { char: '半', pinyin: 'bàn', strokes: 5, words: ['一半', '半天'], group: '课文二' },
  { char: '从', pinyin: 'cóng', strokes: 4, words: ['从前', '从来'], group: '课文二' },
  { char: '才', pinyin: 'cái', strokes: 3, words: ['刚才', '才能'], group: '课文二' },
  { char: '明', pinyin: 'míng', strokes: 8, words: ['明天', '明亮'], group: '课文二' },

  // 第 7 单元 · 明天要远足 / 大还是小
  { char: '同', pinyin: 'tóng', strokes: 6, words: ['同学', '一同'], group: '课文三' },
  { char: '学', pinyin: 'xué', strokes: 8, words: ['学习', '上学'], group: '课文三' },
  { char: '自', pinyin: 'zì', strokes: 6, words: ['自己', '自从'], group: '课文三' },
  { char: '己', pinyin: 'jǐ', strokes: 3, words: ['自己', '知己'], group: '课文三' },
  { char: '衣', pinyin: 'yī', strokes: 6, words: ['衣服', '毛衣'], group: '课文三' },
  { char: '白', pinyin: 'bái', strokes: 5, words: ['白色', '雪白'], group: '课文三' },
  { char: '的', pinyin: 'de', strokes: 8, words: ['我的', '好的'], group: '课文三' },
  { char: '又', pinyin: 'yòu', strokes: 2, words: ['又大', '又高'], group: '课文三' },
  { char: '和', pinyin: 'hé', strokes: 8, words: ['和平', '我和你'], group: '课文三' },
  { char: '车', pinyin: 'chē', strokes: 4, words: ['汽车', '火车'], group: '课文三' },
  { char: '家', pinyin: 'jiā', strokes: 10, words: ['回家', '大家'], group: '课文三' },

  // 第 8 单元 · 常用字巩固
  { char: '字', pinyin: 'zì', strokes: 6, words: ['汉字', '写字'], group: '课文四' },
  { char: '画', pinyin: 'huà', strokes: 8, words: ['画画', '图画'], group: '课文四' },
  { char: '文', pinyin: 'wén', strokes: 4, words: ['语文', '文字'], group: '课文四' },
  { char: '校', pinyin: 'xiào', strokes: 10, words: ['学校', '校园'], group: '课文四' },
  { char: '老', pinyin: 'lǎo', strokes: 6, words: ['老师', '老人'], group: '课文四' },
  { char: '师', pinyin: 'shī', strokes: 6, words: ['老师', '师父'], group: '课文四' },
  { char: '生', pinyin: 'shēng', strokes: 5, words: ['学生', '生日'], group: '课文四' },
  { char: '说', pinyin: 'shuō', strokes: 9, words: ['说话', '听说'], group: '课文四' },
  { char: '看', pinyin: 'kàn', strokes: 9, words: ['看书', '看见'], group: '课文四' },
  { char: '听', pinyin: 'tīng', strokes: 7, words: ['听话', '听见'], group: '课文四' },
  { char: '走', pinyin: 'zǒu', strokes: 7, words: ['走路', '快走'], group: '课文四' },
];

export const HANZI_GROUPS = Array.from(new Set(HANZI.map((h) => h.group)));
