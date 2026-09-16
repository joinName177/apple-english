import type { Card } from '../types'
import { pinyin } from 'pinyin-pro'

// 1. 调用免费开源 Free Dictionary API 获取真实纯正发音 MP3 与音标
export async function fetchEnglishWordInfo(word: string): Promise<{
  phonetic?: string
  audioUrl?: string
  meaning?: string
} | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null

    const entry = data[0]
    let audioUrl: string | undefined = undefined

    // 寻找可用的发音 mp3
    if (entry.phonetics && Array.isArray(entry.phonetics)) {
      const pWithAudio = entry.phonetics.find((p: any) => p.audio && p.audio.endsWith('.mp3'))
      if (pWithAudio) {
        audioUrl = pWithAudio.audio
      }
    }

    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text)
    const meaning = entry.meanings?.[0]?.definitions?.[0]?.definition

    return {
      phonetic,
      audioUrl,
      meaning
    }
  } catch (e) {
    console.warn('Free Dictionary API 请求失败或处于离线状态', e)
    return null
  }
}

// 2. 汉字自动生成带音调拼音的辅助函数
export function generatePinyin(text: string): string {
  try {
    return pinyin(text, { toneType: 'symbol', type: 'string' })
  } catch (e) {
    return ''
  }
}

// 3. 预设扩展知识包（供家长在小抽屉中一键扩充题库）
export const PRESET_EXPANSION_PACKS: {
  id: string
  name: string
  description: string
  badge: string
  cards: Card[]
}[] = [
  {
    id: 'pack-animals-en',
    name: '10个超萌动物英语',
    badge: '🔤 英语',
    description: '包含 Lion, Monkey, Tiger, Elephant, Rabbit 等经典动物',
    cards: [
      {
        id: 'pack-en-1',
        category: 'english',
        title: 'Lion',
        subtitle: '狮子',
        phonetic: '[ˈlaɪən]',
        simpleExplain: '森林里威武的大狮子，头发长长的大王。',
        imageType: 'emoji',
        imageData: '🦁',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now()
      },
      {
        id: 'pack-en-2',
        category: 'english',
        title: 'Monkey',
        subtitle: '猴子',
        phonetic: '[ˈmʌŋki]',
        simpleExplain: '机灵的小猴子，喜欢在树上荡秋千吃香蕉。',
        imageType: 'emoji',
        imageData: '🐒',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 1
      },
      {
        id: 'pack-en-3',
        category: 'english',
        title: 'Tiger',
        subtitle: '老虎',
        phonetic: '[ˈtaɪɡər]',
        simpleExplain: '额头上有个王字的大老虎，威风凛凛！',
        imageType: 'emoji',
        imageData: '🐯',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 2
      },
      {
        id: 'pack-en-4',
        category: 'english',
        title: 'Elephant',
        subtitle: '大象',
        phonetic: '[ˈelɪfənt]',
        simpleExplain: '长长的大鼻子吸喷水，大象最喜欢洗澡啦！',
        imageType: 'emoji',
        imageData: '🐘',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 3
      },
      {
        id: 'pack-en-5',
        category: 'english',
        title: 'Rabbit',
        subtitle: '小兔子',
        phonetic: '[ˈræbɪt]',
        simpleExplain: '长长的耳朵竖起来，蹦蹦跳跳真可爱。',
        imageType: 'emoji',
        imageData: '🐰',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 4
      }
    ]
  },
  {
    id: 'pack-poetry-more',
    name: '5首朗朗上口启蒙唐诗',
    badge: '📜 诗词',
    description: '包含《相思》《江雪》《草/赋得古原草送别》《寻隐者不遇》等',
    cards: [
      {
        id: 'pack-po-1',
        category: 'poetry',
        title: '相思',
        subtitle: '唐 · 王维',
        phonetic: 'xiāng sī',
        contentLines: [
          '红豆生南国，',
          '春来发几枝。',
          '愿君多采撷，',
          '此物最相思。'
        ],
        simpleExplain: '红红的小豆子长出来啦，寄托着对好朋友和家人的想念。',
        imageType: 'emoji',
        imageData: '🍒',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 10
      },
      {
        id: 'pack-po-2',
        category: 'poetry',
        title: '草',
        subtitle: '唐 · 白居易',
        phonetic: 'cǎo',
        contentLines: [
          '离离原上草，',
          '一岁一枯荣。',
          '野火烧不尽，',
          '春风吹又生。'
        ],
        simpleExplain: '小草的生命力可顽强啦，春天一到又绿油油地钻出泥土！',
        imageType: 'emoji',
        imageData: '🌱',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 11
      },
      {
        id: 'pack-po-3',
        category: 'poetry',
        title: '江雪',
        subtitle: '唐 · 柳宗元',
        phonetic: 'jiāng xuě',
        contentLines: [
          '千山鸟飞绝，',
          '万径人踪灭。',
          '孤舟蓑笠翁，',
          '独钓寒江雪。'
        ],
        simpleExplain: '下大雪啦，天地间白茫茫一片，老爷爷在小船上静静钓鱼。',
        imageType: 'emoji',
        imageData: '❄️',
        audioSource: 'tts',
        isPreset: false,
        createdAt: Date.now() + 12
      }
    ]
  }
]
