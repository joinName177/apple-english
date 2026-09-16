export type CategoryType = 'english' | 'poetry' | 'idiom' | 'culture'

export interface Card {
  id: string
  category: CategoryType
  title: string
  subtitle?: string
  phonetic?: string
  contentLines?: string[]
  simpleExplain: string
  imageType: 'emoji' | 'local_blob' | 'remote_url'
  imageData: string
  audioSource: 'tts' | 'local_blob' | 'remote_url'
  audioData?: string
  isPreset: boolean
  createdAt: number
}

export interface BabyRecording {
  id: string
  cardId: string
  audioBlob: Blob
  durationSeconds: number
  recordedAt: number
}

export interface UserProgress {
  currentDate: string
  todayStars: number
  targetStars: number
  completedCardIds: string[]
  unlockedStickers: string[]
  totalStarsAccumulated: number
}

export interface AppSettings {
  eyeProtectionMinutes: number
  speechRate: number
  autoPlayAudioOnSwitch: boolean
}

export interface StickerItem {
  id: string
  name: string
  emoji: string
  starsRequired: number
  description: string
}
