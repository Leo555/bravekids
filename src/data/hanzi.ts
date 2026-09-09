import type { Hanzi } from '../types';

/** 100 个常用字，按主题分 10 组，每组 10 个（适合幼儿园大班～一年级） */
export const HANZI: Hanzi[] = [
  // 1 数字宝宝
  { char: '一', pinyin: 'yī', strokes: 1, words: ['一个', '第一'], group: '数字宝宝' },
  { char: '二', pinyin: 'èr', strokes: 2, words: ['二月', '二哥'], group: '数字宝宝' },
  { char: '三', pinyin: 'sān', strokes: 3, words: ['三只', '三角'], group: '数字宝宝' },
  { char: '四', pinyin: 'sì', strokes: 5, words: ['四季', '四方'], group: '数字宝宝' },
  { char: '五', pinyin: 'wǔ', strokes: 4, words: ['五个', '五彩'], group: '数字宝宝' },
  { char: '六', pinyin: 'liù', strokes: 4, words: ['六月', '六个'], group: '数字宝宝' },
  { char: '七', pinyin: 'qī', strokes: 2, words: ['七彩', '七天'], group: '数字宝宝' },
  { char: '八', pinyin: 'bā', strokes: 2, words: ['八月', '八个'], group: '数字宝宝' },
  { char: '九', pinyin: 'jiǔ', strokes: 2, words: ['九月', '九九'], group: '数字宝宝' },
  { char: '十', pinyin: 'shí', strokes: 2, words: ['十分', '十个'], group: '数字宝宝' },

  // 2 我和家人
  { char: '人', pinyin: 'rén', strokes: 2, words: ['大人', '好人'], group: '我和家人' },
  { char: '口', pinyin: 'kǒu', strokes: 3, words: ['开口', '门口'], group: '我和家人' },
  { char: '手', pinyin: 'shǒu', strokes: 4, words: ['小手', '拍手'], group: '我和家人' },
  { char: '目', pinyin: 'mù', strokes: 5, words: ['目光', '双目'], group: '我和家人' },
  { char: '耳', pinyin: 'ěr', strokes: 6, words: ['耳朵', '木耳'], group: '我和家人' },
  { char: '爸', pinyin: 'bà', strokes: 8, words: ['爸爸', '爸妈'], group: '我和家人' },
  { char: '妈', pinyin: 'mā', strokes: 6, words: ['妈妈', '姑妈'], group: '我和家人' },
  { char: '我', pinyin: 'wǒ', strokes: 7, words: ['我们', '我的'], group: '我和家人' },
  { char: '你', pinyin: 'nǐ', strokes: 7, words: ['你好', '你们'], group: '我和家人' },
  { char: '他', pinyin: 'tā', strokes: 5, words: ['他们', '他人'], group: '我和家人' },

  // 3 天上地下
  { char: '日', pinyin: 'rì', strokes: 4, words: ['日出', '生日'], group: '天上地下' },
  { char: '月', pinyin: 'yuè', strokes: 4, words: ['月亮', '八月'], group: '天上地下' },
  { char: '星', pinyin: 'xīng', strokes: 9, words: ['星星', '星空'], group: '天上地下' },
  { char: '云', pinyin: 'yún', strokes: 4, words: ['白云', '云朵'], group: '天上地下' },
  { char: '山', pinyin: 'shān', strokes: 3, words: ['大山', '爬山'], group: '天上地下' },
  { char: '水', pinyin: 'shuǐ', strokes: 4, words: ['喝水', '水果'], group: '天上地下' },
  { char: '火', pinyin: 'huǒ', strokes: 4, words: ['火车', '火苗'], group: '天上地下' },
  { char: '土', pinyin: 'tǔ', strokes: 3, words: ['泥土', '土地'], group: '天上地下' },
  { char: '石', pinyin: 'shí', strokes: 5, words: ['石头', '石桥'], group: '天上地下' },
  { char: '田', pinyin: 'tián', strokes: 5, words: ['田地', '水田'], group: '天上地下' },

  // 4 花草树木
  { char: '木', pinyin: 'mù', strokes: 4, words: ['木头', '木马'], group: '花草树木' },
  { char: '林', pinyin: 'lín', strokes: 8, words: ['树林', '林子'], group: '花草树木' },
  { char: '花', pinyin: 'huā', strokes: 7, words: ['花朵', '花园'], group: '花草树木' },
  { char: '草', pinyin: 'cǎo', strokes: 9, words: ['小草', '草地'], group: '花草树木' },
  { char: '叶', pinyin: 'yè', strokes: 5, words: ['叶子', '树叶'], group: '花草树木' },
  { char: '竹', pinyin: 'zhú', strokes: 6, words: ['竹子', '竹林'], group: '花草树木' },
  { char: '果', pinyin: 'guǒ', strokes: 8, words: ['苹果', '果子'], group: '花草树木' },
  { char: '米', pinyin: 'mǐ', strokes: 6, words: ['大米', '米饭'], group: '花草树木' },
  { char: '禾', pinyin: 'hé', strokes: 5, words: ['禾苗', '锄禾'], group: '花草树木' },
  { char: '瓜', pinyin: 'guā', strokes: 5, words: ['西瓜', '瓜子'], group: '花草树木' },

  // 5 小动物
  { char: '牛', pinyin: 'niú', strokes: 4, words: ['黄牛', '牛奶'], group: '小动物' },
  { char: '羊', pinyin: 'yáng', strokes: 6, words: ['小羊', '山羊'], group: '小动物' },
  { char: '马', pinyin: 'mǎ', strokes: 3, words: ['小马', '马上'], group: '小动物' },
  { char: '鸟', pinyin: 'niǎo', strokes: 5, words: ['小鸟', '鸟窝'], group: '小动物' },
  { char: '鱼', pinyin: 'yú', strokes: 8, words: ['小鱼', '钓鱼'], group: '小动物' },
  { char: '虫', pinyin: 'chóng', strokes: 6, words: ['虫子', '毛虫'], group: '小动物' },
  { char: '鸡', pinyin: 'jī', strokes: 7, words: ['小鸡', '公鸡'], group: '小动物' },
  { char: '兔', pinyin: 'tù', strokes: 8, words: ['兔子', '白兔'], group: '小动物' },
  { char: '猫', pinyin: 'māo', strokes: 11, words: ['小猫', '花猫'], group: '小动物' },
  { char: '狗', pinyin: 'gǒu', strokes: 8, words: ['小狗', '狗尾'], group: '小动物' },

  // 6 方向大小
  { char: '上', pinyin: 'shàng', strokes: 3, words: ['上面', '上学'], group: '方向大小' },
  { char: '下', pinyin: 'xià', strokes: 3, words: ['下面', '下雨'], group: '方向大小' },
  { char: '左', pinyin: 'zuǒ', strokes: 5, words: ['左边', '左手'], group: '方向大小' },
  { char: '右', pinyin: 'yòu', strokes: 5, words: ['右边', '右手'], group: '方向大小' },
  { char: '中', pinyin: 'zhōng', strokes: 4, words: ['中间', '中午'], group: '方向大小' },
  { char: '大', pinyin: 'dà', strokes: 3, words: ['大小', '长大'], group: '方向大小' },
  { char: '小', pinyin: 'xiǎo', strokes: 3, words: ['小心', '小手'], group: '方向大小' },
  { char: '多', pinyin: 'duō', strokes: 6, words: ['很多', '多少'], group: '方向大小' },
  { char: '少', pinyin: 'shǎo', strokes: 4, words: ['多少', '很少'], group: '方向大小' },
  { char: '长', pinyin: 'cháng', strokes: 4, words: ['长短', '长江'], group: '方向大小' },

  // 7 天天用到
  { char: '天', pinyin: 'tiān', strokes: 4, words: ['天空', '今天'], group: '天天用到' },
  { char: '地', pinyin: 'dì', strokes: 6, words: ['大地', '地上'], group: '天天用到' },
  { char: '门', pinyin: 'mén', strokes: 3, words: ['开门', '大门'], group: '天天用到' },
  { char: '车', pinyin: 'chē', strokes: 4, words: ['汽车', '火车'], group: '天天用到' },
  { char: '家', pinyin: 'jiā', strokes: 10, words: ['回家', '家人'], group: '天天用到' },
  { char: '里', pinyin: 'lǐ', strokes: 7, words: ['里面', '哪里'], group: '天天用到' },
  { char: '来', pinyin: 'lái', strokes: 7, words: ['过来', '来吧'], group: '天天用到' },
  { char: '去', pinyin: 'qù', strokes: 5, words: ['出去', '去年'], group: '天天用到' },
  { char: '有', pinyin: 'yǒu', strokes: 6, words: ['有的', '没有'], group: '天天用到' },
  { char: '风', pinyin: 'fēng', strokes: 4, words: ['大风', '风筝'], group: '天天用到' },

  // 8 五颜六色
  { char: '红', pinyin: 'hóng', strokes: 6, words: ['红色', '红花'], group: '五颜六色' },
  { char: '黄', pinyin: 'huáng', strokes: 11, words: ['黄色', '黄牛'], group: '五颜六色' },
  { char: '白', pinyin: 'bái', strokes: 5, words: ['白色', '雪白'], group: '五颜六色' },
  { char: '黑', pinyin: 'hēi', strokes: 12, words: ['黑色', '黑夜'], group: '五颜六色' },
  { char: '绿', pinyin: 'lǜ', strokes: 11, words: ['绿色', '绿叶'], group: '五颜六色' },
  { char: '蓝', pinyin: 'lán', strokes: 13, words: ['蓝色', '蓝天'], group: '五颜六色' },
  { char: '青', pinyin: 'qīng', strokes: 8, words: ['青草', '青山'], group: '五颜六色' },
  { char: '光', pinyin: 'guāng', strokes: 6, words: ['月光', '发光'], group: '五颜六色' },
  { char: '色', pinyin: 'sè', strokes: 6, words: ['颜色', '彩色'], group: '五颜六色' },
  { char: '亮', pinyin: 'liàng', strokes: 9, words: ['明亮', '月亮'], group: '五颜六色' },

  // 9 我会做
  { char: '看', pinyin: 'kàn', strokes: 9, words: ['看书', '看见'], group: '我会做' },
  { char: '听', pinyin: 'tīng', strokes: 7, words: ['听话', '听见'], group: '我会做' },
  { char: '说', pinyin: 'shuō', strokes: 9, words: ['说话', '听说'], group: '我会做' },
  { char: '走', pinyin: 'zǒu', strokes: 7, words: ['走路', '快走'], group: '我会做' },
  { char: '跑', pinyin: 'pǎo', strokes: 12, words: ['跑步', '快跑'], group: '我会做' },
  { char: '跳', pinyin: 'tiào', strokes: 13, words: ['跳绳', '跳高'], group: '我会做' },
  { char: '吃', pinyin: 'chī', strokes: 6, words: ['吃饭', '好吃'], group: '我会做' },
  { char: '喝', pinyin: 'hē', strokes: 12, words: ['喝水', '喝汤'], group: '我会做' },
  { char: '玩', pinyin: 'wán', strokes: 8, words: ['玩具', '好玩'], group: '我会做' },
  { char: '笑', pinyin: 'xiào', strokes: 10, words: ['笑话', '大笑'], group: '我会做' },

  // 10 上学啦
  { char: '书', pinyin: 'shū', strokes: 4, words: ['看书', '书包'], group: '上学啦' },
  { char: '本', pinyin: 'běn', strokes: 5, words: ['本子', '课本'], group: '上学啦' },
  { char: '笔', pinyin: 'bǐ', strokes: 10, words: ['铅笔', '毛笔'], group: '上学啦' },
  { char: '画', pinyin: 'huà', strokes: 8, words: ['画画', '图画'], group: '上学啦' },
  { char: '文', pinyin: 'wén', strokes: 4, words: ['语文', '文字'], group: '上学啦' },
  { char: '字', pinyin: 'zì', strokes: 6, words: ['汉字', '写字'], group: '上学啦' },
  { char: '学', pinyin: 'xué', strokes: 8, words: ['学习', '上学'], group: '上学啦' },
  { char: '校', pinyin: 'xiào', strokes: 10, words: ['学校', '校门'], group: '上学啦' },
  { char: '早', pinyin: 'zǎo', strokes: 6, words: ['早上', '早安'], group: '上学啦' },
  { char: '好', pinyin: 'hǎo', strokes: 6, words: ['你好', '好人'], group: '上学啦' },
];

export const HANZI_GROUPS = Array.from(new Set(HANZI.map((h) => h.group)));
