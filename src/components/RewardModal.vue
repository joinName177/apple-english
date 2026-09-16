<script setup lang="ts">
import { onMounted } from 'vue'
import confetti from 'canvas-confetti'
import { playTrophyVictorySound, playPopSound } from '../services/audio'

defineProps<{
  todayStars: number
  targetStars: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

onMounted(() => {
  // 播放胜利庆祝旋律
  playTrophyVictorySound()

  // 撒彩带特效
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    })
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      })
    }, 250)
  } catch (e) {
    console.warn('confetti error', e)
  }
})

function handleClose() {
  playPopSound()
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
    <div class="bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl p-6 sm:p-10 max-w-sm w-full text-center shadow-2xl relative flex flex-col items-center animate-scale-up">
      <!-- 闪耀金奖杯 -->
      <div class="text-8xl sm:text-9xl mb-3 animate-bounce select-none">
        🏆
      </div>

      <h2 class="font-fun text-3xl sm:text-4xl text-amber-900 mb-2">
        太棒啦，通关啦！
      </h2>

      <p class="text-slate-600 text-base sm:text-lg mb-6 leading-relaxed">
        宝贝今天收集了 <span class="font-bold text-amber-600 font-fun text-2xl">{{ todayStars }}</span> 颗小星星！<br/>
        今天的学习探险顺利完成！
      </p>

      <button
        @click="handleClose"
        class="jelly-btn w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-fun text-2xl shadow-lg shadow-orange-300 cursor-pointer"
      >
        开心地继续玩 🎈
      </button>
    </div>
  </div>
</template>
