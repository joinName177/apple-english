<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { X, PlusCircle, DownloadCloud, HardDrive, Settings, Mic, Play, CheckCircle2 } from 'lucide-vue-next'
import type { CategoryType, Card, AppSettings } from '../types'
import {
  addCustomCard,
  addCardsBatch,
  getStorageStats,
  clearAllRecordings,
  resetTodayProgress,
  factoryReset,
  getSettings,
  saveSettings
} from '../services/db'
import { generatePinyin, fetchEnglishWordInfo, PRESET_EXPANSION_PACKS } from '../services/apiService'
import { recorder, playAudioBlob, stopAllAudio, playPopSound } from '../services/audio'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'dataChanged'): void
}>()

const activeTab = ref<'add' | 'expand' | 'storage' | 'settings'>('add')

// 1. 添加卡片表单状态
const formCategory = ref<CategoryType>('english')
const formTitle = ref('')
const formSubtitle = ref('')
const formPhonetic = ref('')
const formExplain = ref('')
const formEmoji = ref('🍎')
const formAudioSource = ref<'tts' | 'local_blob'>('tts')
const dadAudioBlob = ref<Blob | null>(null)
const isRecordingDad = ref(false)
const isPlayingDad = ref(false)
const saveSuccessMessage = ref('')

const quickEmojis = ['🍎', '🍌', '🐶', '🐱', '🚗', '✈️', '🌸', '🌙', '🥮', '🏮', '🧸', '🌟', '🌈', '🍉', '⚽', '🍦']

// 自动智能补全拼音或英文音标
async function handleAutoFill() {
  if (!formTitle.value) return
  if (formCategory.value === 'english') {
    const info = await fetchEnglishWordInfo(formTitle.value)
    if (info) {
      if (info.phonetic) formPhonetic.value = info.phonetic
      if (!formExplain.value && info.meaning) formExplain.value = info.meaning
    }
  } else {
    formPhonetic.value = generatePinyin(formTitle.value)
  }
}

// 录制爸爸原声
async function handleDadRecord() {
  if (isRecordingDad.value) {
    recorder.stop()
    isRecordingDad.value = false
    return
  }

  stopAllAudio()
  isRecordingDad.value = true
  try {
    const blob = await recorder.startRecording(5) // 家长允许录制长一点（5秒）
    dadAudioBlob.value = blob
    formAudioSource.value = 'local_blob'
  } catch (e) {
    console.error('录制爸爸原声失败', e)
  } finally {
    isRecordingDad.value = false
  }
}

// 试听爸爸录音
async function playDadVoice() {
  if (!dadAudioBlob.value) return
  isPlayingDad.value = true
  try {
    await playAudioBlob(dadAudioBlob.value)
  } finally {
    isPlayingDad.value = false
  }
}

// 提交保存自定义卡片
async function handleSaveCard() {
  if (!formTitle.value.trim()) {
    alert('请输入名称或单词')
    return
  }

  let audioDataUrl = ''
  if (dadAudioBlob.value) {
    // 将录音 Blob 转换为 Base64 方便存入 IndexedDB
    audioDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(dadAudioBlob.value!)
    })
  }

  const newCard: Card = {
    id: 'custom-' + Date.now(),
    category: formCategory.value,
    title: formTitle.value.trim(),
    subtitle: formSubtitle.value.trim() || undefined,
    phonetic: formPhonetic.value.trim() || undefined,
    simpleExplain: formExplain.value.trim() || `${formTitle.value}真有趣！`,
    imageType: 'emoji',
    imageData: formEmoji.value,
    audioSource: formAudioSource.value,
    audioData: audioDataUrl || undefined,
    isPreset: false,
    createdAt: Date.now()
  }

  await addCustomCard(newCard)
  saveSuccessMessage.value = '已成功添加到宝贝书架！🎉'
  emit('dataChanged')

  // 重置表单
  formTitle.value = ''
  formSubtitle.value = ''
  formPhonetic.value = ''
  formExplain.value = ''
  dadAudioBlob.value = null
  formAudioSource.value = 'tts'

  setTimeout(() => {
    saveSuccessMessage.value = ''
  }, 2500)
}

// 2. 扩充题库
const importedPacks = ref<string[]>([])
async function importPack(pack: typeof PRESET_EXPANSION_PACKS[0]) {
  await addCardsBatch(pack.cards)
  importedPacks.value.push(pack.id)
  emit('dataChanged')
  await refreshStorageStats()
}

// 3. 存储统计与清理
const storageInfo = ref({
  totalMB: '0.00',
  recordingCount: 0,
  recordingMB: '0.00',
  customCards: 0
})

async function refreshStorageStats() {
  const stats = await getStorageStats()
  storageInfo.value = {
    totalMB: (stats.totalSizeBytes / (1024 * 1024)).toFixed(2),
    recordingCount: stats.recordingCount,
    recordingMB: (stats.recordingSizeBytes / (1024 * 1024)).toFixed(2),
    customCards: stats.customCardCount
  }
}

// 清理宝宝录音
async function handleClearRecordings() {
  if (confirm(`确定要删除全部 ${storageInfo.value.recordingCount} 条宝宝录音吗？（学习进度和卡片会保留）`)) {
    await clearAllRecordings()
    await refreshStorageStats()
    emit('dataChanged')
    alert('已成功释放录音存储空间！')
  }
}

// 重置今日进度
async function handleResetProgress() {
  if (confirm('确定要清空今天的星星和学习打卡记录吗？')) {
    await resetTodayProgress()
    emit('dataChanged')
    alert('今日进度已重置！')
  }
}

// 恢复出厂设置
async function handleFactoryReset() {
  if (confirm('⚠️ 警告：这将清空所有录音和自定义卡片，恢复最初预装卡片，确定吗？')) {
    await factoryReset()
    await refreshStorageStats()
    emit('dataChanged')
    alert('已恢复出厂状态！')
  }
}

// 4. 系统设置
const currentSettings = ref<AppSettings>({
  eyeProtectionMinutes: 15,
  speechRate: 0.85,
  autoPlayAudioOnSwitch: true
})
const targetStars = ref(3)

onMounted(async () => {
  const s = await getSettings()
  currentSettings.value = s
  await refreshStorageStats()
})

async function updateSettings() {
  await saveSettings(currentSettings.value)
  emit('dataChanged')
}

function handleClose() {
  playPopSound()
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in">
    <div class="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-2 border-slate-200">
      <!-- 抽屉顶部头部 -->
      <div class="bg-slate-800 text-white p-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-2xl">👨‍👧</span>
          <h2 class="font-fun text-xl sm:text-2xl tracking-wide">爸爸妈妈管理中心</h2>
        </div>
        <button
          @click="handleClose"
          class="w-9 h-9 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-slate-300 cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab 切换 -->
      <div class="flex border-b border-slate-200 bg-slate-50 shrink-0 text-sm sm:text-base font-fun">
        <button
          @click="activeTab = 'add'"
          :class="['flex-1 py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2', activeTab === 'add' ? 'border-amber-500 text-amber-600 font-bold bg-white' : 'border-transparent text-slate-500']"
        >
          <PlusCircle class="w-4 h-4" />
          <span>添加卡片</span>
        </button>
        <button
          @click="activeTab = 'expand'"
          :class="['flex-1 py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2', activeTab === 'expand' ? 'border-amber-500 text-amber-600 font-bold bg-white' : 'border-transparent text-slate-500']"
        >
          <DownloadCloud class="w-4 h-4" />
          <span>题库扩充</span>
        </button>
        <button
          @click="activeTab = 'storage'"
          :class="['flex-1 py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2', activeTab === 'storage' ? 'border-amber-500 text-amber-600 font-bold bg-white' : 'border-transparent text-slate-500']"
        >
          <HardDrive class="w-4 h-4" />
          <span>缓存清理</span>
        </button>
        <button
          @click="activeTab = 'settings'"
          :class="['flex-1 py-3 flex items-center justify-center gap-1.5 cursor-pointer border-b-2', activeTab === 'settings' ? 'border-amber-500 text-amber-600 font-bold bg-white' : 'border-transparent text-slate-500']"
        >
          <Settings class="w-4 h-4" />
          <span>偏好设置</span>
        </button>
      </div>

      <!-- 选项卡 1：手动添加卡片 -->
      <div v-if="activeTab === 'add'" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div v-if="saveSuccessMessage" class="p-3 bg-emerald-100 text-emerald-800 rounded-xl font-fun text-center flex items-center justify-center gap-2">
          <CheckCircle2 class="w-5 h-5" />
          <span>{{ saveSuccessMessage }}</span>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">选择分类</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              type="button"
              v-for="(label, key) in { english: '🔤英语', poetry: '📜诗词', idiom: '🦊成语', culture: '🏮文化' }"
              :key="key"
              @click="formCategory = key as CategoryType"
              :class="['py-2 rounded-xl text-sm font-fun border cursor-pointer', formCategory === key ? 'bg-amber-500 text-white border-amber-600 font-bold' : 'bg-slate-100 text-slate-700 border-slate-200']"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs font-bold text-slate-500">名称 / 单词 / 诗名</label>
            <button
              type="button"
              @click="handleAutoFill"
              class="text-xs text-amber-600 font-bold hover:underline cursor-pointer"
            >
              ✨ 智能补齐拼音/释义
            </button>
          </div>
          <input
            v-model="formTitle"
            type="text"
            placeholder="例如: Orange / 咏柳 / 拔苗助长"
            class="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-amber-500 text-slate-800 font-medium"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">副标题 (翻译 / 作者)</label>
            <input
              v-model="formSubtitle"
              type="text"
              placeholder="例如: 橙子 / 唐 · 贺知章"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 mb-1">拼音 / 音标</label>
            <input
              v-model="formPhonetic"
              type="text"
              placeholder="例如: [ˈɔːrɪndʒ] / yǒng liǔ"
              class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">选择图标 Emoji</label>
          <div class="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
            <button
              type="button"
              v-for="em in quickEmojis"
              :key="em"
              @click="formEmoji = em"
              :class="['w-9 h-9 text-2xl flex items-center justify-center rounded-lg cursor-pointer', formEmoji === em ? 'bg-amber-300 scale-110 shadow-sm' : 'hover:bg-slate-200']"
            >
              {{ em }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">适合3岁半的一句话微释义</label>
          <textarea
            v-model="formExplain"
            rows="2"
            placeholder="简短童趣描述，例如：圆圆甜甜的大橙子，剥开皮有很多汁水～"
            class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-700"
          ></textarea>
        </div>

        <!-- 爸爸录制示范音 -->
        <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
          <label class="block text-xs font-bold text-amber-900 mb-2">爸爸原声示范录音 (选填，亲子更有温度)</label>
          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handleDadRecord"
              :class="['jelly-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-fun text-white cursor-pointer', isRecordingDad ? 'bg-rose-500 animate-pulse' : 'bg-amber-600 hover:bg-amber-700']"
            >
              <Mic class="w-4 h-4" />
              <span>{{ isRecordingDad ? '录音中 (点击结束)...' : '录制爸爸原声 (5s)' }}</span>
            </button>

            <button
              v-if="dadAudioBlob"
              type="button"
              @click="playDadVoice"
              class="jelly-btn flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-fun bg-emerald-600 text-white cursor-pointer"
            >
              <Play class="w-3.5 h-3.5" />
              <span>{{ isPlayingDad ? '播放中...' : '试听录音' }}</span>
            </button>

            <span v-if="dadAudioBlob" class="text-xs text-emerald-700 font-bold">✓ 已录好</span>
          </div>
        </div>

        <button
          type="button"
          @click="handleSaveCard"
          class="jelly-btn w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-fun text-xl shadow-md cursor-pointer"
        >
          保存到宝贝书架 📚
        </button>
      </div>

      <!-- 选项卡 2：题库扩充 -->
      <div v-if="activeTab === 'expand'" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <p class="text-xs text-slate-500">点击下方扩展包，一键将精选词汇与诗词导入宝贝的书架：</p>
        <div
          v-for="pack in PRESET_EXPANSION_PACKS"
          :key="pack.id"
          class="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
        >
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs bg-slate-200 px-2 py-0.5 rounded-md font-bold text-slate-700">{{ pack.badge }}</span>
              <h4 class="font-fun text-base text-slate-800">{{ pack.name }}</h4>
            </div>
            <p class="text-xs text-slate-500">{{ pack.description }}</p>
          </div>
          <button
            @click="importPack(pack)"
            :disabled="importedPacks.includes(pack.id)"
            class="jelly-btn px-4 py-2 rounded-xl font-fun text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:bg-slate-300 disabled:pointer-events-none cursor-pointer"
          >
            {{ importedPacks.includes(pack.id) ? '已导入 ✓' : '一键导入' }}
          </button>
        </div>
      </div>

      <!-- 选项卡 3：存储管理与一键清理 -->
      <div v-if="activeTab === 'storage'" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        <!-- 存储空间看板 -->
        <div class="bg-slate-900 text-white p-4 rounded-2xl">
          <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <span class="text-xs text-slate-400">本地存储总占用</span>
            <span class="font-mono text-lg font-bold text-amber-400">{{ storageInfo.totalMB }} MB</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between">
              <span>👶 宝贝录音条数:</span>
              <span class="font-bold">{{ storageInfo.recordingCount }} 条 (约 {{ storageInfo.recordingMB }} MB)</span>
            </div>
            <div class="flex justify-between">
              <span>🖼️ 自定义添加卡片:</span>
              <span class="font-bold">{{ storageInfo.customCards }} 张</span>
            </div>
          </div>
        </div>

        <!-- 细分清理操作按钮 -->
        <div class="space-y-3">
          <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <h5 class="font-fun text-base text-slate-800">🧹 清理宝宝练习录音</h5>
              <p class="text-xs text-slate-500">仅删除录音音频文件，释放90%空间，保留卡片与星星</p>
            </div>
            <button
              @click="handleClearRecordings"
              class="jelly-btn px-3.5 py-2 rounded-xl text-xs font-fun bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
            >
              清空录音
            </button>
          </div>

          <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <h5 class="font-fun text-base text-slate-800">🔄 重置今日学习进度</h5>
              <p class="text-xs text-slate-500">把今天收集的星星和打卡记录归零</p>
            </div>
            <button
              @click="handleResetProgress"
              class="jelly-btn px-3.5 py-2 rounded-xl text-xs font-fun bg-slate-600 hover:bg-slate-700 text-white cursor-pointer"
            >
              重置今日
            </button>
          </div>

          <div class="p-3 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-between">
            <div>
              <h5 class="font-fun text-base text-red-800">⚠️ 恢复出厂设置</h5>
              <p class="text-xs text-red-600">清空所有录音与自定义内容，重新灌入初始知识库</p>
            </div>
            <button
              @click="handleFactoryReset"
              class="jelly-btn px-3.5 py-2 rounded-xl text-xs font-fun bg-red-600 hover:bg-red-700 text-white cursor-pointer"
            >
              恢复出厂
            </button>
          </div>
        </div>
      </div>

      <!-- 选项卡 4：系统设置 -->
      <div v-if="activeTab === 'settings'" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">每日目标星星数</label>
          <div class="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="8"
              v-model.number="targetStars"
              class="flex-1 accent-amber-500"
            />
            <span class="font-fun text-lg text-amber-600 w-12 text-center">{{ targetStars }} 颗⭐</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">推荐3岁半宝宝设定为 3 颗星（约5-8分钟）</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">语音播报语速</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="r in [{ val: 0.7, label: '0.7x 极慢' }, { val: 0.85, label: '0.85x 适合幼儿' }, { val: 1.0, label: '1.0x 正常' }]"
              :key="r.val"
              @click="currentSettings.speechRate = r.val; updateSettings()"
              :class="['py-2 rounded-xl text-xs font-fun border cursor-pointer', currentSettings.speechRate === r.val ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200']"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-500 mb-1">护眼锁屏定时</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="m in [{ val: 10, label: '10分钟' }, { val: 15, label: '15分钟' }, { val: 20, label: '20分钟' }, { val: 0, label: '关闭' }]"
              :key="m.val"
              @click="currentSettings.eyeProtectionMinutes = m.val; updateSettings()"
              :class="['py-2 rounded-xl text-xs font-fun border cursor-pointer', currentSettings.eyeProtectionMinutes === m.val ? 'bg-amber-500 text-white border-amber-600' : 'bg-slate-100 text-slate-700 border-slate-200']"
            >
              {{ m.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
