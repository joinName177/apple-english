import Dexie, { type EntityTable } from 'dexie'
import type { Card, BabyRecording, UserProgress, AppSettings, CategoryType } from '../types'
import { SEED_CARDS } from '../data/seedData'

class LearningDatabase extends Dexie {
  cards!: EntityTable<Card, 'id'>
  recordings!: EntityTable<BabyRecording, 'id'>
  progress!: EntityTable<UserProgress, 'currentDate'>
  settings!: EntityTable<AppSettings & { id: string }, 'id'>

  constructor() {
    super('ToddlerJoyLearningDB')
    this.version(1).stores({
      cards: 'id, category, isPreset, createdAt',
      recordings: 'id, cardId, recordedAt',
      progress: 'currentDate',
      settings: 'id'
    })
  }
}

export const db = new LearningDatabase()

const TODAY_KEY = new Date().toISOString().split('T')[0]

// 初始化数据库种子
export async function initDb(): Promise<void> {
  const count = await db.cards.count()
  if (count === 0) {
    await db.cards.bulkAdd(SEED_CARDS)
  }

  // 初始化进度
  const progress = await db.progress.get(TODAY_KEY)
  if (!progress) {
    await db.progress.add({
      currentDate: TODAY_KEY,
      todayStars: 0,
      targetStars: 3,
      completedCardIds: [],
      unlockedStickers: [],
      totalStarsAccumulated: 0
    })
  }

  // 初始化设置
  const settings = await db.settings.get('global')
  if (!settings) {
    await db.settings.add({
      id: 'global',
      eyeProtectionMinutes: 15,
      speechRate: 0.85,
      autoPlayAudioOnSwitch: true
    })
  }
}

// 获取卡片列表
export async function getCardsByCategory(category: CategoryType): Promise<Card[]> {
  return await db.cards.where('category').equals(category).toArray()
}

// 添加新卡片
export async function addCustomCard(card: Card): Promise<void> {
  await db.cards.put(card)
}

// 批量添加卡片
export async function addCardsBatch(newCards: Card[]): Promise<void> {
  await db.cards.bulkPut(newCards)
}

// 记录宝宝声音
export async function saveBabyRecording(rec: BabyRecording): Promise<void> {
  await db.recordings.put(rec)
}

// 获取某卡片最新的宝宝录音
export async function getLatestRecordingForCard(cardId: string): Promise<BabyRecording | undefined> {
  const list = await db.recordings.where('cardId').equals(cardId).reverse().sortBy('recordedAt')
  return list[0]
}

// 获取今日学习进度
export async function getTodayProgress(): Promise<UserProgress> {
  let progress = await db.progress.get(TODAY_KEY)
  if (!progress) {
    // 继承历史总星星数
    const all = await db.progress.toArray()
    const totalStars = all.reduce((acc, cur) => acc + cur.todayStars, 0)
    const allStickers = Array.from(new Set(all.flatMap(p => p.unlockedStickers)))

    progress = {
      currentDate: TODAY_KEY,
      todayStars: 0,
      targetStars: 3,
      completedCardIds: [],
      unlockedStickers: allStickers,
      totalStarsAccumulated: totalStars
    }
    await db.progress.put(progress)
  }
  return progress
}

// 宝宝完成一次跟读加星
export async function recordCardCompletion(cardId: string): Promise<{
  progress: UserProgress
  isNewStar: boolean
  reachedGoal: boolean
}> {
  const prog = await getTodayProgress()
  const isAlreadyCompleted = prog.completedCardIds.includes(cardId)

  let isNewStar = false
  if (!isAlreadyCompleted) {
    prog.completedCardIds.push(cardId)
    prog.todayStars += 1
    prog.totalStarsAccumulated += 1
    isNewStar = true
  }

  const reachedGoal = prog.todayStars >= prog.targetStars

  await db.progress.put(prog)
  return { progress: prog, isNewStar, reachedGoal }
}

// 解锁贴纸
export async function unlockSticker(stickerId: string): Promise<void> {
  const prog = await getTodayProgress()
  if (!prog.unlockedStickers.includes(stickerId)) {
    prog.unlockedStickers.push(stickerId)
    await db.progress.put(prog)
  }
}

// 获取存储占用详情
export async function getStorageStats(): Promise<{
  totalSizeBytes: number
  recordingCount: number
  recordingSizeBytes: number
  customCardCount: number
}> {
  const recordings = await db.recordings.toArray()
  let recordingSizeBytes = 0
  for (const r of recordings) {
    recordingSizeBytes += r.audioBlob ? r.audioBlob.size : 0
  }

  const customCards = await db.cards.where('isPreset').equals(0 as any).toArray()
  let customCardBytes = 0
  for (const c of customCards) {
    customCardBytes += JSON.stringify(c).length * 2
  }

  return {
    totalSizeBytes: recordingSizeBytes + customCardBytes,
    recordingCount: recordings.length,
    recordingSizeBytes,
    customCardCount: customCards.length
  }
}

// 一键清理所有宝宝录音
export async function clearAllRecordings(): Promise<number> {
  const count = await db.recordings.count()
  await db.recordings.clear()
  return count
}

// 重置今日进度
export async function resetTodayProgress(): Promise<void> {
  const prog = await getTodayProgress()
  prog.todayStars = 0
  prog.completedCardIds = []
  await db.progress.put(prog)
}

// 恢复出厂设置（清空所有录音和自定义卡片，重新灌入内置卡片）
export async function factoryReset(): Promise<void> {
  await db.recordings.clear()
  await db.cards.clear()
  await db.cards.bulkAdd(SEED_CARDS)
  await resetTodayProgress()
}

// 设置读写
export async function getSettings(): Promise<AppSettings> {
  const s = await db.settings.get('global')
  if (s) return s
  return {
    eyeProtectionMinutes: 15,
    speechRate: 0.85,
    autoPlayAudioOnSwitch: true
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({
    ...current,
    ...settings,
    id: 'global'
  })
}
