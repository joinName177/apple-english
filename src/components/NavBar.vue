<script setup lang="ts">
import { ref } from 'vue'
import { Gift, Lock } from 'lucide-vue-next'
import { playPopSound } from '../services/audio'

const props = defineProps<{
  todayStars: number
  targetStars: number
  totalStars: number
}>()

const emit = defineEmits<{
  (e: 'openStickers'): void
  (e: 'openParentDrawer'): void
}>()

// 3秒长按逻辑
const isHolding = ref(false)
const holdProgress = ref(0) // 0 - 100
let holdTimer: number | null = null
let animationFrameId: number | null = null
let holdStartTime = 0
const HOLD_DURATION = 3000 // 3秒

function startHold(e: Event) {
  e.preventDefault()
  isHolding.value = true
  holdStartTime = Date.now()

  const updateProgress = () => {
    if (!isHolding.value) return
    const elapsed = Date.now() - holdStartTime
    holdProgress.value = Math.min(100, (elapsed / HOLD_DURATION) * 100)

    if (elapsed >= HOLD_DURATION) {
      // 达到3秒，成功唤出
      cancelHold()
      emit('openParentDrawer')
    } else {
      animationFrameId = requestAnimationFrame(updateProgress)
    }
  }

  animationFrameId = requestAnimationFrame(updateProgress)
}

function cancelHold() {
  isHolding.value = false
  holdProgress.value = 0
  if (holdTimer) clearTimeout(holdTimer)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
}

function handleStickerClick() {
  playPopSound()
  emit('openStickers')
}
</script>

<template>
  <header class="h-16 px-4 md:px-8 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-amber-100 shadow-sm shrink-0 z-20">
    <!-- 左侧：贴纸宝箱 -->
    <button
      @click="handleStickerClick"
      class="jelly-btn flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white font-fun text-lg md:text-xl px-3.5 py-1.5 rounded-full shadow-md shadow-orange-200 cursor-pointer"
      title="贴纸宝箱"
    >
      <Gift class="w-5 h-5 animate-bounce" />
      <span>宝箱</span>
    </button>

    <!-- 中间：今日星星打卡进度 -->
    <div class="flex items-center gap-2 bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-200">
      <span class="text-xl md:text-2xl animate-spin-slow">⭐</span>
      <span class="font-fun text-xl md:text-2xl text-amber-900 tracking-wide">
        {{ props.todayStars }} / {{ props.targetStars }}
      </span>
      <span class="text-xs md:text-sm text-amber-700 ml-1 hidden sm:inline">今日任务</span>
    </div>

    <!-- 右侧：家长长按解锁入口 -->
    <div class="relative">
      <button
        @mousedown="startHold"
        @mouseup="cancelHold"
        @mouseleave="cancelHold"
        @touchstart="startHold"
        @touchend="cancelHold"
        @touchcancel="cancelHold"
        class="relative w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shadow-inner cursor-pointer select-none transition-transform active:scale-95"
        title="长按3秒打开家长设置"
      >
        <!-- 进度环SVG -->
        <svg v-if="isHolding" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="22" cy="22" r="19"
            class="stroke-amber-400 fill-none"
            stroke-width="3"
            stroke-dasharray="119.38"
            :stroke-dashoffset="119.38 - (119.38 * holdProgress) / 100"
            stroke-linecap="round"
          />
        </svg>

        <Lock :class="['w-5 h-5 transition-colors', isHolding ? 'text-amber-500 scale-110' : 'text-slate-500']" />
      </button>

      <!-- 长按提示浮层 -->
      <div
        v-if="isHolding"
        class="absolute right-0 top-13 bg-slate-800 text-white text-xs px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg animate-fade-in pointer-events-none font-bold"
      >
        按住不要松开... {{ Math.ceil((HOLD_DURATION - (holdProgress * HOLD_DURATION) / 100) / 1000) }}s
      </div>
    </div>
  </header>
</template>
