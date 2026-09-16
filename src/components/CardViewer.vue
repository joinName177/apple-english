<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import type { Card } from '../types'
import {
  Volume2,
  Mic,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw
} from 'lucide-vue-next'
import {
  speakText,
  playAudioBlob,
  playAudioUrl,
  stopAllAudio,
  playPopSound,
  recorder
} from '../services/audio'
import { getLatestRecordingForCard } from '../services/db'

const props = defineProps<{
  card: Card
  currentIndex: number
  totalCards: number
  isCompleted: boolean
  speechRate: number
  autoPlay: boolean
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'recorded', blob: Blob): void
}>()

const isSpeaking = ref(false)
const isRecording = ref(false)
const countdown = ref(3)
const babyAudio = ref<Blob | null>(null)
const isPlayingBaby = ref(false)
const permissionError = ref(false)

// 加载历史录音
async function loadRecording() {
  babyAudio.value = null
  const rec = await getLatestRecordingForCard(props.card.id)
  if (rec && rec.audioBlob) {
    babyAudio.value = rec.audioBlob
  }
}

// 播放标准示范音
async function playStandardAudio() {
  if (isRecording.value) return
  playPopSound()
  isSpeaking.value = true

  try {
    if (props.card.audioSource === 'local_blob' && props.card.audioData) {
      // 爸爸录制的声音
      await playAudioUrl(props.card.audioData)
    } else if (props.card.audioSource === 'remote_url' && props.card.audioData) {
      // 远程真人发音MP3
      await playAudioUrl(props.card.audioData)
    } else {
      // TTS 朗读
      if (props.card.category === 'english') {
        // 先播放纯正英文发音
        await speakText(props.card.title, 'en', props.speechRate)
        // 稍作停顿，接着播报中文翻译
        if (props.card.subtitle) {
          await new Promise((r) => setTimeout(r, 400))
          await speakText(props.card.subtitle, 'zh', props.speechRate)
        }
      } else if (props.card.category === 'poetry' && props.card.contentLines) {
        const textToSpeak = `${props.card.title}。${props.card.subtitle || ''}。` + props.card.contentLines.join('')
        await speakText(textToSpeak, 'zh', props.speechRate)
      } else {
        const textToSpeak = `${props.card.title}。${props.card.simpleExplain}`
        await speakText(textToSpeak, 'zh', props.speechRate)
      }
    }
  } catch (e) {
    console.error('播放标准音失败', e)
  } finally {
    isSpeaking.value = false
  }
}

// 播放宝宝自己的声音
async function playBabyVoice() {
  if (!babyAudio.value || isRecording.value) return
  isPlayingBaby.value = true
  playPopSound()
  try {
    await playAudioBlob(babyAudio.value)
  } catch (e) {
    console.error('播放宝宝声音失败', e)
  } finally {
    isPlayingBaby.value = false
  }
}

// 开始3秒录音
async function handleRecord() {
  if (isRecording.value) {
    recorder.stop()
    return
  }

  permissionError.value = false
  stopAllAudio()
  isSpeaking.value = false
  isPlayingBaby.value = false

  try {
    isRecording.value = true
    countdown.value = 3

    const blob = await recorder.startRecording(3, (sec) => {
      countdown.value = sec
    })

    babyAudio.value = blob
    emit('recorded', blob)

    // 录完立刻自动回放宝宝声音
    setTimeout(() => {
      playBabyVoice()
    }, 300)

  } catch (err: any) {
    if (err?.message === 'PERMISSION_DENIED') {
      permissionError.value = true
    } else {
      console.error('录音出错', err)
    }
  } finally {
    isRecording.value = false
  }
}

// 监听卡片切换
watch(
  () => props.card.id,
  async () => {
    stopAllAudio()
    isSpeaking.value = false
    isPlayingBaby.value = false
    await loadRecording()

    if (props.autoPlay) {
      setTimeout(() => {
        playStandardAudio()
      }, 350)
    }
  },
  { immediate: true }
)

onMounted(async () => {
  await loadRecording()
})

const cardTheme = computed(() => {
  switch (props.card.category) {
    case 'english': return 'from-sky-50 to-blue-50 border-sky-200'
    case 'poetry': return 'from-emerald-50 to-teal-50 border-emerald-200'
    case 'idiom': return 'from-amber-50 to-orange-50 border-amber-200'
    case 'culture': return 'from-rose-50 to-red-50 border-rose-200'
  }
})
</script>

<template>
  <main class="flex-1 flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden relative max-w-2xl mx-auto w-full">

    <!-- 顶部卡片计数器与已完成徽标 -->
    <div class="w-full flex items-center justify-between px-2 text-slate-500 font-fun text-sm sm:text-base">
      <div class="flex items-center gap-1.5">
        <span class="bg-white/80 px-3 py-1 rounded-full shadow-xs border border-slate-200">
          {{ currentIndex + 1 }} / {{ totalCards }}
        </span>
        <span v-if="card.audioSource === 'local_blob'" class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-sans">
          爸爸原声 👨‍👧
        </span>
      </div>

      <div v-if="isCompleted" class="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full font-fun animate-star-pop">
        <Sparkles class="w-4 h-4" />
        <span>已掌握 ⭐</span>
      </div>
    </div>

    <!-- 核心大卡片 -->
    <div
      :class="[
        'w-full flex-1 my-2 bg-gradient-to-b rounded-3xl p-5 sm:p-8 flex flex-col items-center justify-center border-4 shadow-xl shadow-amber-900/5 relative overflow-hidden transition-all duration-300',
        cardTheme
      ]"
    >
      <!-- 大插画 / 大 Emoji -->
      <div class="my-2 select-none cursor-pointer transform hover:scale-105 transition-transform" @click="playStandardAudio">
        <span class="text-7xl sm:text-9xl animate-float block drop-shadow-md">
          {{ card.imageData }}
        </span>
      </div>

      <!-- 拼音/注音 -->
      <div v-if="card.phonetic" class="text-slate-400 font-mono text-base sm:text-xl font-bold tracking-wider mb-1">
        {{ card.phonetic }}
      </div>

      <!-- 核心大字标题 -->
      <div class="flex items-baseline gap-3 text-center">
        <h1 class="font-fun text-4xl sm:text-6xl text-slate-800 tracking-wide font-extrabold">
          {{ card.title }}
        </h1>
        <span v-if="card.subtitle" class="font-fun text-2xl sm:text-3xl text-amber-600">
          {{ card.subtitle }}
        </span>
      </div>

      <!-- 诗词专用分行展示 -->
      <div v-if="card.contentLines && card.contentLines.length > 0" class="my-3 text-center space-y-1 sm:space-y-2">
        <p
          v-for="(line, idx) in card.contentLines"
          :key="idx"
          class="font-fun text-xl sm:text-3xl text-slate-700 tracking-widest leading-relaxed"
        >
          {{ line }}
        </p>
      </div>

      <!-- 适合3岁半的一句话微释义 -->
      <p class="mt-3 text-center text-slate-600 text-sm sm:text-lg max-w-md px-2 leading-snug font-medium bg-white/60 py-2 rounded-2xl border border-white/80">
        {{ card.simpleExplain }}
      </p>

      <!-- 麦克风权限友好提示 -->
      <div v-if="permissionError" class="absolute bottom-2 inset-x-4 bg-red-500 text-white p-2 rounded-xl text-center text-xs font-bold shadow-lg animate-bounce">
        🎙️ 爸爸请帮忙：在浏览器或系统设置中允许开启麦克风权限哦！
      </div>
    </div>

    <!-- 底部互动交互区（大喇叭 + 超大录音麦克风 + 回放） -->
    <div class="w-full flex items-center justify-between gap-3 px-2 pt-1 pb-2">
      <!-- ⬅️ 上一个按钮 -->
      <button
        @click="emit('prev')"
        :disabled="currentIndex === 0"
        class="jelly-btn w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-slate-200 text-slate-600 shadow-md flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        title="上一个"
      >
        <ChevronLeft class="w-8 h-8 sm:w-10 sm:h-10 -ml-0.5" />
      </button>

      <!-- 中间核心操作：听标准音 + 录音跟读 -->
      <div class="flex items-center gap-3 sm:gap-6">
        <!-- 🔊 听标准示范音 -->
        <button
          @click="playStandardAudio"
          :class="[
            'jelly-btn flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full font-fun text-lg sm:text-2xl shadow-md border-2 transition-all cursor-pointer',
            isSpeaking
              ? 'bg-amber-400 text-white border-amber-500 scale-105 ring-4 ring-amber-200'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
          ]"
        >
          <Volume2 :class="['w-6 h-6 sm:w-8 sm:h-8', isSpeaking ? 'animate-pulse text-white' : 'text-amber-500']" />
          <span class="hidden sm:inline">{{ isSpeaking ? '播放中...' : '听发音' }}</span>
        </button>

        <!-- 🎤 3秒极简录音跟读大按键 (核心视觉) -->
        <div class="relative">
          <!-- 录音时的水波纹涟漪动效 -->
          <div
            v-if="isRecording"
            class="absolute inset-0 rounded-full bg-rose-400 animate-ripple pointer-events-none"
          ></div>

          <button
            @click="handleRecord"
            :class="[
              'jelly-btn relative z-10 flex items-center gap-2 px-5 sm:px-8 py-3.5 rounded-full font-fun text-xl sm:text-2xl text-white shadow-lg transition-all cursor-pointer select-none',
              isRecording
                ? 'bg-rose-500 scale-110 shadow-rose-300 ring-4 ring-rose-200'
                : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-rose-200'
            ]"
          >
            <Mic :class="['w-7 h-7 sm:w-9 sm:h-9', isRecording ? 'animate-bounce' : '']" />
            <span v-if="isRecording" class="font-extrabold tracking-widest text-yellow-200 text-2xl">
              {{ countdown }}s
            </span>
            <span v-else>跟读录音</span>
          </button>
        </div>

        <!-- 🔁 听宝宝自己的回放按钮 (有录音时显示) -->
        <button
          v-if="babyAudio"
          @click="playBabyVoice"
          :class="[
            'jelly-btn flex items-center gap-1.5 px-3.5 sm:px-5 py-3 rounded-full font-fun text-sm sm:text-lg border-2 shadow-sm transition-all cursor-pointer',
            isPlayingBaby
              ? 'bg-emerald-500 text-white border-emerald-600 scale-105 ring-4 ring-emerald-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          ]"
          title="听听宝宝的声音"
        >
          <RotateCcw :class="['w-5 h-5', isPlayingBaby ? 'animate-spin' : '']" />
          <span class="hidden sm:inline">听自己的</span>
        </button>
      </div>

      <!-- ➡️ 下一个按钮 -->
      <button
        @click="emit('next')"
        :disabled="currentIndex === totalCards - 1"
        class="jelly-btn w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-white border-2 border-slate-200 text-slate-600 shadow-md flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        title="下一个"
      >
        <ChevronRight class="w-8 h-8 sm:w-10 sm:h-10 -mr-0.5" />
      </button>
    </div>
  </main>
</template>
