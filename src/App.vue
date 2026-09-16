<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { CategoryType, Card, UserProgress, AppSettings } from './types'
import {
  initDb,
  getCardsByCategory,
  getTodayProgress,
  recordCardCompletion,
  saveBabyRecording,
  getSettings,
  unlockSticker
} from './services/db'
import { SEED_STICKERS } from './data/seedData'
import { playStarSuccessSound, playPopSound } from './services/audio'
import confetti from 'canvas-confetti'

import NavBar from './components/NavBar.vue'
import CategoryTabs from './components/CategoryTabs.vue'
import CardViewer from './components/CardViewer.vue'
import StickerModal from './components/StickerModal.vue'
import RewardModal from './components/RewardModal.vue'
import BedtimeModal from './components/BedtimeModal.vue'
import ParentDrawer from './components/ParentDrawer.vue'

const isReady = ref(false)
const activeCategory = ref<CategoryType>('english')
const cards = ref<Card[]>([])
const currentCardIndex = ref(0)

const progress = ref<UserProgress>({
  currentDate: '',
  todayStars: 0,
  targetStars: 3,
  completedCardIds: [],
  unlockedStickers: [],
  totalStarsAccumulated: 0
})

const settings = ref<AppSettings>({
  eyeProtectionMinutes: 15,
  speechRate: 0.85,
  autoPlayAudioOnSwitch: true
})

// 弹窗状态
const showStickerModal = ref(false)
const showRewardModal = ref(false)
const showBedtimeModal = ref(false)
const showParentDrawer = ref(false)

// 护眼计时器
let eyeTimer: number | null = null

function resetEyeProtectionTimer() {
  if (eyeTimer) clearTimeout(eyeTimer)
  if (settings.value.eyeProtectionMinutes > 0) {
    const ms = settings.value.eyeProtectionMinutes * 60 * 1000
    eyeTimer = window.setTimeout(() => {
      showBedtimeModal.value = true
    }, ms)
  }
}

// 刷新卡片列表
async function loadCards() {
  const list = await getCardsByCategory(activeCategory.value)
  cards.value = list
  if (currentCardIndex.value >= list.length) {
    currentCardIndex.value = 0
  }
}

// 刷新学习数据
async function refreshUserData() {
  progress.value = await getTodayProgress()
  settings.value = await getSettings()
}

// 初始化
onMounted(async () => {
  await initDb()
  await refreshUserData()
  await loadCards()
  resetEyeProtectionTimer()
  isReady.value = true
})

// 切换分类
async function handleCategoryChange(cat: CategoryType) {
  activeCategory.value = cat
  currentCardIndex.value = 0
  await loadCards()
}

// 上一个/下一个
function handlePrev() {
  if (currentCardIndex.value > 0) {
    playPopSound()
    currentCardIndex.value -= 1
  }
}

function handleNext() {
  if (currentCardIndex.value < cards.value.length - 1) {
    playPopSound()
    currentCardIndex.value += 1
  }
}

// 当前卡片
const currentCard = computed(() => {
  return cards.value[currentCardIndex.value] || null
})

// 当前卡片是否已跟读完成
const isCurrentCompleted = computed(() => {
  if (!currentCard.value) return false
  return progress.value.completedCardIds.includes(currentCard.value.id)
})

// 宝宝跟读录音完成
async function handleBabyRecorded(blob: Blob) {
  if (!currentCard.value) return

  // 保存录音
  await saveBabyRecording({
    id: 'rec-' + Date.now(),
    cardId: currentCard.value.id,
    audioBlob: blob,
    durationSeconds: 3,
    recordedAt: Date.now()
  })

  // 记录卡片完成
  const result = await recordCardCompletion(currentCard.value.id)
  progress.value = result.progress

  if (result.isNewStar) {
    // 播放星星音效
    playStarSuccessSound()

    // 局部微撒花动画
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.8 }
    })

    // 检查是否解锁了新贴纸
    for (const stk of SEED_STICKERS) {
      if (progress.value.totalStarsAccumulated >= stk.starsRequired) {
        await unlockSticker(stk.id)
      }
    }
    progress.value = await getTodayProgress()

    // 如果达到了今天的目标
    if (result.reachedGoal) {
      setTimeout(() => {
        showRewardModal.value = true
      }, 600)
    }
  }
}

// 家长数据变更回调
async function handleDataChanged() {
  await refreshUserData()
  await loadCards()
  resetEyeProtectionTimer()
}

// 解锁护眼
function handleUnlockBedtime() {
  showBedtimeModal.value = false
  resetEyeProtectionTimer()
}
</script>

<template>
  <div v-if="isReady" class="h-full w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-amber-50/40">
    <!-- 顶部状态栏 -->
    <NavBar
      :todayStars="progress.todayStars"
      :targetStars="progress.targetStars"
      :totalStars="progress.totalStarsAccumulated"
      @openStickers="showStickerModal = true"
      @openParentDrawer="showParentDrawer = true"
    />

    <!-- 分类切换导航 -->
    <CategoryTabs
      :activeCategory="activeCategory"
      @changeCategory="handleCategoryChange"
    />

    <!-- 卡片展示与互动核心区 -->
    <CardViewer
      v-if="currentCard"
      :card="currentCard"
      :currentIndex="currentCardIndex"
      :totalCards="cards.length"
      :isCompleted="isCurrentCompleted"
      :speechRate="settings.speechRate"
      :autoPlay="settings.autoPlayAudioOnSwitch"
      @prev="handlePrev"
      @next="handleNext"
      @recorded="handleBabyRecorded"
    />

    <!-- 空卡片兜底 -->
    <div v-else class="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
      <span class="text-6xl mb-2">📭</span>
      <p class="font-fun text-xl">该分类下暂无卡片，快让爸爸添加一些吧！</p>
    </div>

    <!-- 弹窗合集 -->
    <StickerModal
      v-if="showStickerModal"
      :totalStars="progress.totalStarsAccumulated"
      :unlockedList="progress.unlockedStickers"
      @close="showStickerModal = false"
    />

    <RewardModal
      v-if="showRewardModal"
      :todayStars="progress.todayStars"
      :targetStars="progress.targetStars"
      @close="showRewardModal = false"
    />

    <BedtimeModal
      v-if="showBedtimeModal"
      @unlock="handleUnlockBedtime"
    />

    <ParentDrawer
      v-if="showParentDrawer"
      @close="showParentDrawer = false"
      @dataChanged="handleDataChanged"
    />
  </div>

  <!-- 初始化加载态 -->
  <div v-else class="h-screen w-screen flex flex-col items-center justify-center bg-amber-50">
    <span class="text-7xl animate-bounce">🍎</span>
    <p class="font-fun text-2xl text-amber-800 mt-4">正在为宝贝准备乐园...</p>
  </div>
</template>
