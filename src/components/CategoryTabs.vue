<script setup lang="ts">
import type { CategoryType } from '../types'
import { playPopSound } from '../services/audio'

const props = defineProps<{
  activeCategory: CategoryType
}>()

const emit = defineEmits<{
  (e: 'changeCategory', cat: CategoryType): void
}>()

const categories: { id: CategoryType; name: string; emoji: string; color: string; activeColor: string }[] = [
  {
    id: 'english',
    name: '英语',
    emoji: '🔤',
    color: 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
    activeColor: 'bg-sky-500 text-white shadow-lg shadow-sky-200 border-sky-600 scale-105'
  },
  {
    id: 'poetry',
    name: '诗词',
    emoji: '📜',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
    activeColor: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-emerald-600 scale-105'
  },
  {
    id: 'idiom',
    name: '成语',
    emoji: '🦊',
    color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    activeColor: 'bg-amber-500 text-white shadow-lg shadow-amber-200 border-amber-600 scale-105'
  },
  {
    id: 'culture',
    name: '文化',
    emoji: '🏮',
    color: 'bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200',
    activeColor: 'bg-rose-500 text-white shadow-lg shadow-rose-200 border-rose-600 scale-105'
  }
]

function handleSelect(cat: CategoryType) {
  if (cat !== props.activeCategory) {
    playPopSound()
    emit('changeCategory', cat)
  }
}
</script>

<template>
  <nav class="py-2.5 px-4 flex items-center justify-center gap-2 sm:gap-4 shrink-0 overflow-x-auto no-scrollbar">
    <button
      v-for="c in categories"
      :key="c.id"
      @click="handleSelect(c.id)"
      :class="[
        'jelly-btn flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 rounded-2xl font-fun text-lg sm:text-2xl border-2 transition-all cursor-pointer whitespace-nowrap',
        activeCategory === c.id ? c.activeColor : c.color
      ]"
    >
      <span class="text-xl sm:text-2xl">{{ c.emoji }}</span>
      <span>{{ c.name }}</span>
    </button>
  </nav>
</template>
