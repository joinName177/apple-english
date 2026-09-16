import type { Card, StickerItem } from '../types'

export const SEED_CARDS: Card[] = [
  // ========== 英语启蒙 (10个) ==========
  {
    id: 'en-1',
    category: 'english',
    title: 'Apple',
    subtitle: '苹果',
    phonetic: '[ˈæpl]',
    simpleExplain: '红红的大苹果，酸酸甜甜真好吃！',
    imageType: 'emoji',
    imageData: '🍎',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000000
  },
  {
    id: 'en-2',
    category: 'english',
    title: 'Banana',
    subtitle: '香蕉',
    phonetic: '[bəˈnænə]',
    simpleExplain: '弯弯像个月亮，剥开香香甜甜。',
    imageType: 'emoji',
    imageData: '🍌',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000001
  },
  {
    id: 'en-3',
    category: 'english',
    title: 'Cat',
    subtitle: '小猫',
    phonetic: '[kæt]',
    simpleExplain: '喵喵喵，踩着软软小肉垫的小猫咪。',
    imageType: 'emoji',
    imageData: '🐱',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000002
  },
  {
    id: 'en-4',
    category: 'english',
    title: 'Dog',
    subtitle: '小狗',
    phonetic: '[dɔːɡ]',
    simpleExplain: '汪汪汪，摇着尾巴的小狗最忠诚。',
    imageType: 'emoji',
    imageData: '🐶',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000003
  },
  {
    id: 'en-5',
    category: 'english',
    title: 'Duck',
    subtitle: '小鸭子',
    phonetic: '[dʌk]',
    simpleExplain: '嘎嘎嘎，毛茸茸的小鸭子在水里游。',
    imageType: 'emoji',
    imageData: '🦆',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000004
  },
  {
    id: 'en-6',
    category: 'english',
    title: 'Sun',
    subtitle: '太阳',
    phonetic: '[sʌn]',
    simpleExplain: '红彤彤的太阳公公，暖洋洋照大地。',
    imageType: 'emoji',
    imageData: '☀️',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000005
  },
  {
    id: 'en-7',
    category: 'english',
    title: 'Car',
    subtitle: '小汽车',
    phonetic: '[kɑːr]',
    simpleExplain: '嘀嘀叭叭，四个轮子的小汽车开动啦！',
    imageType: 'emoji',
    imageData: '🚗',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000006
  },
  {
    id: 'en-8',
    category: 'english',
    title: 'Eye',
    subtitle: '眼睛',
    phonetic: '[aɪ]',
    simpleExplain: '亮闪闪的大眼睛，用来看美丽的世界。',
    imageType: 'emoji',
    imageData: '👁️',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000007
  },
  {
    id: 'en-9',
    category: 'english',
    title: 'Nose',
    subtitle: '小鼻子',
    phonetic: '[noʊz]',
    simpleExplain: '小鼻子闻一闻，闻到了甜甜的花香。',
    imageType: 'emoji',
    imageData: '👃',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000008
  },
  {
    id: 'en-10',
    category: 'english',
    title: 'Star',
    subtitle: '小星星',
    phonetic: '[stɑːr]',
    simpleExplain: '一闪一闪亮晶晶，天上的小星星在眨眼。',
    imageType: 'emoji',
    imageData: '⭐',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000009
  },

  // ========== 诗词启蒙 (5首) ==========
  {
    id: 'po-1',
    category: 'poetry',
    title: '咏鹅',
    subtitle: '唐 · 骆宾王',
    phonetic: 'yǒng é',
    contentLines: [
      '鹅，鹅，鹅，',
      '曲项向天歌。',
      '白毛浮绿水，',
      '红掌拨清波。'
    ],
    simpleExplain: '大白鹅弯着长长的脖子唱歌，红红的脚掌划着水花。',
    imageType: 'emoji',
    imageData: '🦢',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000010
  },
  {
    id: 'po-2',
    category: 'poetry',
    title: '春晓',
    subtitle: '唐 · 孟浩然',
    phonetic: 'chūn xiǎo',
    contentLines: [
      '春眠不觉晓，',
      '处处闻啼鸟。',
      '夜来风雨声，',
      '花落知多少。'
    ],
    simpleExplain: '春天睡得真香呀，醒来听到小鸟在欢快唱歌。',
    imageType: 'emoji',
    imageData: '🌸',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000011
  },
  {
    id: 'po-3',
    category: 'poetry',
    title: '静夜思',
    subtitle: '唐 · 李白',
    phonetic: 'jìng yè sī',
    contentLines: [
      '床前明月光，',
      '疑是地上霜。',
      '举头望明月，',
      '低头思故乡。'
    ],
    simpleExplain: '明亮皎洁的月光照在床前，诗人抬头看着大月亮。',
    imageType: 'emoji',
    imageData: '🌙',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000012
  },
  {
    id: 'po-4',
    category: 'poetry',
    title: '悯农',
    subtitle: '唐 · 李绅',
    phonetic: 'mǐn nóng',
    contentLines: [
      '锄禾日当午，',
      '汗滴禾下土。',
      '谁知盘中餐，',
      '粒粒皆辛苦。'
    ],
    simpleExplain: '农民伯伯在太阳下辛苦种粮食，我们要把饭菜吃得干干净净！',
    imageType: 'emoji',
    imageData: '🌾',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000013
  },
  {
    id: 'po-5',
    category: 'poetry',
    title: '登鹳雀楼',
    subtitle: '唐 · 王之涣',
    phonetic: 'dēng guàn què lóu',
    contentLines: [
      '白日依山尽，',
      '黄河入海流。',
      '欲穷千里目，',
      '更上一层楼。'
    ],
    simpleExplain: '想要看到更远更美的风景，就要努力再往上爬一层楼。',
    imageType: 'emoji',
    imageData: '🌅',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000014
  },

  // ========== 成语启蒙 (5个) ==========
  {
    id: 'id-1',
    category: 'idiom',
    title: '守株待兔',
    subtitle: '寓言故事',
    phonetic: 'shǒu zhū dài tù',
    simpleExplain: '有个农夫每天在树桩旁偷懒等兔子撞树，可不能学他哦，幸福要靠勤劳双手！',
    imageType: 'emoji',
    imageData: '🐇',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000020
  },
  {
    id: 'id-2',
    category: 'idiom',
    title: '拔苗助长',
    subtitle: '寓言故事',
    phonetic: 'bá miáo zhù zhǎng',
    simpleExplain: '小禾苗需要慢慢浇水长大，心急硬把它拔高，小禾苗就会枯萎啦。',
    imageType: 'emoji',
    imageData: '🌱',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000021
  },
  {
    id: 'id-3',
    category: 'idiom',
    title: '盲人摸象',
    subtitle: '寓言故事',
    phonetic: 'máng rén mō xiàng',
    simpleExplain: '有人摸到耳朵说大象像蒲扇，摸到腿说像柱子。看待事物要看完整哦！',
    imageType: 'emoji',
    imageData: '🐘',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000022
  },
  {
    id: 'id-4',
    category: 'idiom',
    title: '狐假虎威',
    subtitle: '寓言故事',
    phonetic: 'hú jiǎ hǔ wēi',
    simpleExplain: '狡猾的小狐狸借着老虎的威风吓跑小动物，其实小动物怕的是老虎！',
    imageType: 'emoji',
    imageData: '🦊',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000023
  },
  {
    id: 'id-5',
    category: 'idiom',
    title: '井底之蛙',
    subtitle: '寓言故事',
    phonetic: 'jǐng dǐ zhī wā',
    simpleExplain: '小青蛙天天住在井底下，以为天只有井口那么大，外面的世界其实可大啦！',
    imageType: 'emoji',
    imageData: '🐸',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000024
  },

  // ========== 传统文化 (5个) ==========
  {
    id: 'cu-1',
    category: 'culture',
    title: '中秋节',
    subtitle: '八月十五',
    phonetic: 'zhōng qiū jié',
    simpleExplain: '八月十五月儿圆，吃甜甜的月饼，听嫦娥仙子和可爱玉兔的故事。',
    imageType: 'emoji',
    imageData: '🥮',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000030
  },
  {
    id: 'cu-2',
    category: 'culture',
    title: '过大年 / 春节',
    subtitle: '正月初一',
    phonetic: 'guò dà nián',
    simpleExplain: '穿上漂亮新衣裳，贴红红的春联，放噼里啪啦的红鞭炮，热热闹闹！',
    imageType: 'emoji',
    imageData: '🏮',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000031
  },
  {
    id: 'cu-3',
    category: 'culture',
    title: '端午节',
    subtitle: '五月初五',
    phonetic: 'duān wǔ jié',
    simpleExplain: '吃香香甜甜的糯米粽子，大江上鼓声咚咚敲，龙舟比赛飞快游！',
    imageType: 'emoji',
    imageData: '🛶',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000032
  },
  {
    id: 'cu-4',
    category: 'culture',
    title: '生肖大聚会',
    subtitle: '十二生肖',
    phonetic: 'shí èr shēng xiào',
    simpleExplain: '机灵鼠、勤劳牛、威武虎、可爱兔……十二个生肖小动物排排队！',
    imageType: 'emoji',
    imageData: '🐯',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000033
  },
  {
    id: 'cu-5',
    category: 'culture',
    title: '春分与立春',
    subtitle: '二十四节气',
    phonetic: 'chūn fēn',
    simpleExplain: '暖暖的风吹过来，小草发嫩芽，柳树抽新枝，大地妈妈穿绿衣！',
    imageType: 'emoji',
    imageData: '🍃',
    audioSource: 'tts',
    isPreset: true,
    createdAt: 1700000000034
  }
]

export const SEED_STICKERS: StickerItem[] = [
  { id: 'stk-1', name: '聪明小恐龙', emoji: '🦖', starsRequired: 3, description: '完成第一次每日探险奖励' },
  { id: 'stk-2', name: '爱笑小兔子', emoji: '🐰', starsRequired: 6, description: '收集6颗星星解锁' },
  { id: 'stk-3', name: '勇敢小狮子', emoji: '🦁', starsRequired: 9, description: '收集9颗星星解锁' },
  { id: 'stk-4', name: '太空探险熊', emoji: '🐻‍❄️', starsRequired: 12, description: '收集12颗星星解锁' },
  { id: 'stk-5', name: '神奇独角兽', emoji: '🦄', starsRequired: 15, description: '收集15颗星星解锁' },
  { id: 'stk-6', name: '快乐小海豚', emoji: '🐬', starsRequired: 18, description: '收集18颗星星解锁' },
  { id: 'stk-7', name: '超级小火箭', emoji: '🚀', starsRequired: 21, description: '收集21颗星星解锁' },
  { id: 'stk-8', name: '闪耀金皇冠', emoji: '👑', starsRequired: 25, description: '启蒙小达人专属荣誉' }
]
