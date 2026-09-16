<script setup lang="ts">
import { ref } from 'vue'
import { Moon, Sparkles } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'unlock'): void
}>()

const isHolding = ref(false)
const holdProgress = ref(0)
let holdStartTime = 0
let animationFrameId: number | null = null
const HOLD_DURATION = 3000

function startHold(e: Event) {
  e.preventDefault()
  isHolding.value = true
  holdStartTime = Date.now()

  const update = () => {
    if (!isHolding.value) return
    const elapsed = Date.now() - holdStartTime
    holdProgress.value = Math.min(100, (elapsed / HOLD_DURATION) * 100)

    if (elapsed >= HOLD_DURATION) {
      cancelHold()
      emit('unlock')
    } else {
      animationFrameId = requestAnimationFrame(update)
    }
  }

  animationFrameId = requestAnimationFrame(update)
}

function cancelHold() {
  isHolding.value = false
  holdProgress.value = 0
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-slate-950 text-white select-none animate-fade-in">
    <!-- 月亮与星星夜空背景 -->
    <div class="flex items-center gap-2 mb-4 text-amber-200">
      <Moon class="w-12 h-12 animate-pulse text-amber-300" />
      <Sparkles class="w-6 h-6 text-yellow-200" />
    </div>

    <!-- 睡觉的小动物 -->
    <div class="text-9xl mb-4 animate-float select-none">
      🐻💤
    </div>

    <h2 class="font-fun text-4xl sm:text-5xl text-amber-200 mb-3 text-center">
      小熊打哈欠啦
    </h2>

    <p class="text-slate-300 text-lg sm:text-2xl text-center max-w-sm mb-12 font-medium leading-relaxed">
      眼睛看屏幕累啦～<br/>
      让眼睛休息一会儿，我们待会儿再来玩吧！
    </p>

    <!-- 底部家长解锁通道 -->
    <div class="absolute bottom-6 right-6">
      <button
        @mousedown="startHold"
        @mouseup="cancelHold"
        @mouseleave="cancelHold"
        @touchstart="startHold"
        @touchend="cancelHold"
        @touchcancel="cancelHold"
        class="text-xs text-slate-500 hover:text-slate-300 border border-slate-800 rounded-full px-4 py-2 cursor-pointer transition-colors"
      >
        <span>{{ isHolding ? `松开取消 (${Math.ceil((HOLD_DURATION - (holdProgress * HOLD_DURATION) / 100) / 1000)}s)...` : '家长解锁 (按住3秒)' }}</span>
      </button>
    </div>
  </div>
</template>
