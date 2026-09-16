<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { SEED_STICKERS } from '../data/seedData'
import { playPopSound } from '../services/audio'

defineProps<{
  totalStars: number
  unlockedList: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

function handleClose() {
  playPopSound()
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
    <div class="bg-white border-4 border-amber-300 rounded-3xl p-5 sm:p-7 max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl relative">
      <!-- 弹窗标题 -->
      <div class="flex items-center justify-between pb-3 border-b border-amber-100 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-3xl">🎁</span>
          <h3 class="font-fun text-2xl sm:text-3xl text-amber-900">贴纸小宝箱</h3>
        </div>
        <button
          @click="handleClose"
          class="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- 累计成就横幅 -->
      <div class="my-3 bg-amber-50 p-3 rounded-2xl flex items-center justify-between border border-amber-200 shrink-0">
        <span class="text-slate-600 font-medium text-sm sm:text-base">历史累计星星：</span>
        <div class="flex items-center gap-1 font-fun text-xl sm:text-2xl text-amber-600">
          <span>⭐</span>
          <span>{{ totalStars }} 颗</span>
        </div>
      </div>

      <!-- 贴纸网格 -->
      <div class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 pr-1">
        <div
          v-for="stk in SEED_STICKERS"
          :key="stk.id"
          :class="[
            'flex flex-col items-center p-3 rounded-2xl border-2 transition-all select-none',
            totalStars >= stk.starsRequired
              ? 'bg-amber-50/60 border-amber-300 shadow-sm'
              : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
          ]"
        >
          <span class="text-5xl my-2 block">
            {{ stk.emoji }}
          </span>
          <span class="font-fun text-base text-slate-800 text-center">
            {{ stk.name }}
          </span>
          <span class="text-xs text-amber-700 mt-1">
            {{ totalStars >= stk.starsRequired ? '✨ 已点亮' : `需 ${stk.starsRequired} 颗⭐` }}
          </span>
        </div>
      </div>

      <!-- 底部关闭 -->
      <div class="pt-3 border-t border-slate-100 mt-2 shrink-0">
        <button
          @click="handleClose"
          class="jelly-btn w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-white font-fun text-xl cursor-pointer"
        >
          继续去探险
        </button>
      </div>
    </div>
  </div>
</template>
