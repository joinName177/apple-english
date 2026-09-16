// 音频服务：包含TTS标准发音、Web Audio API合成趣味音效、MediaRecorder 3秒跟读录音
import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { Capacitor } from '@capacitor/core'
import { measureNativeTtsPlayback, shouldFallbackFromNativeTts } from './ttsPlayback'

let currentAudio: HTMLAudioElement | null = null

// 1. 停止当前正在播放的任何声音
export async function stopAllAudio(): Promise<void> {
  try {
    await TextToSpeech.stop()
  } catch (e) {
    // 忽略原生插件未就绪或非移动端环境错误
  }
  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel()
  }
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

// 2. 语音合成播报 (TTS - 原生系统小艺TTS优先 + 在线真人发音 + 浏览器语音三重保障)
export async function speakText(text: string, lang: 'zh' | 'en' = 'zh', rate = 0.85): Promise<void> {
  const cleanText = text.trim()
  if (!cleanText) return

  // 第一层：优先调用 Capacitor 原生 Android 系统 TextToSpeech (直接调用华为小艺系统级引擎，零延迟，免流量)
  try {
    const targetLang = lang === 'en' ? 'en-US' : 'zh-CN'
    let reportedProgress = false
    const progressListener = await TextToSpeech.addListener('onRangeStart', () => {
      reportedProgress = true
    })
    const elapsedMs = await measureNativeTtsPlayback(
      () => TextToSpeech.speak({
        text: cleanText,
        lang: targetLang,
        rate: rate,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient',
      }),
      () => progressListener.remove()
    )

    if (shouldFallbackFromNativeTts({
      isAndroid: Capacitor.getPlatform() === 'android',
      elapsedMs,
      reportedProgress,
    })) {
      throw new Error('Native TTS completed without producing audible speech')
    }
    return
  } catch (nativeErr) {
    console.warn('Native TextToSpeech 调用未就绪或处于纯Web端，尝试网络发音流:', nativeErr)
  }

  // 第二层：高音质真人网络发音流 (支持英文美音与中文常见词汇)
  try {
    let url = ''
    if (lang === 'en') {
      const enOnly = cleanText.replace(/[^a-zA-Z\s'-]/g, '').trim() || cleanText
      url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(enOnly)}&type=2`
      await playAudioUrl(url)
      return
    } else if (cleanText.length <= 6) {
      url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=zh`
      await playAudioUrl(url)
      return
    }
  } catch (netErr) {
    console.warn('在线发音流播放失败，转入浏览器原生 Web Speech:', netErr)
  }

  // 第三层：浏览器原生 Web Speech API 兜底
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('当前浏览器不支持语音合成 speechSynthesis')
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.lang = lang === 'en' ? 'en-US' : 'zh-CN'

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      if (lang === 'zh') {
        const zhVoice = voices.find(v => (v.lang.includes('zh') || v.lang.includes('cmn')))
        if (zhVoice) utterance.voice = zhVoice
      } else {
        const enVoice = voices.find(v => v.lang.startsWith('en'))
        if (enVoice) utterance.voice = enVoice
      }
    }

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    window.speechSynthesis.speak(utterance)
  })
}


// 3. 播放录制的 Blob 音频
export async function playAudioBlob(blob: Blob): Promise<void> {
  await stopAllAudio()

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    audio.onended = () => {
      URL.revokeObjectURL(url)
      if (currentAudio === audio) currentAudio = null
      resolve()
    }
    audio.onerror = (e) => {
      URL.revokeObjectURL(url)
      if (currentAudio === audio) currentAudio = null
      reject(e)
    }

    audio.play().catch(reject)
  })
}

// 4. 播放远端或本地音频 URL
export async function playAudioUrl(url: string): Promise<void> {
  await stopAllAudio()

  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    currentAudio = audio

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null
      resolve()
    }
    audio.onerror = (e) => {
      if (currentAudio === audio) currentAudio = null
      reject(e)
    }

    audio.play().catch(reject)
  })
}

// 5. 使用 Web Audio API 动态合成萌趣音效（零外部音频体积、免加载、即按即响）
let audioCtx: AudioContext | null = null
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// 5.1 泡泡按键音
export function playPopSound(): void {
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch (e) {
    console.error('playPopSound error', e)
  }
}

// 5.2 获得星星清脆欢呼声
export function playStarSuccessSound(): void {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.09)

      gain.gain.setValueAtTime(0, now + i * 0.09)
      gain.gain.linearRampToValueAtTime(0.35, now + i * 0.09 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.09)
      osc.stop(now + i * 0.09 + 0.3)
    })
  } catch (e) {
    console.error('playStarSuccessSound error', e)
  }
}

// 5.3 达成每日目标大奖杯欢呼旋律
export function playTrophyVictorySound(): void {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    // 经典胜利凯旋号角旋律
    const notes = [
      { f: 523.25, t: 0.0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.35 },
      { f: 587.33, t: 0.85, d: 0.2 },
      { f: 783.99, t: 1.1, d: 0.6 }
    ]

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, now + t)

      gain.gain.setValueAtTime(0.3, now + t)
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + t)
      osc.stop(now + t + d)
    })
  } catch (e) {
    console.error('playTrophyVictorySound error', e)
  }
}

// 6. 3秒跟读录音控制器
export class BabyVoiceRecorder {
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private isRecording = false

  async requestPermission(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      return true
    } catch (e) {
      console.warn('麦克风权限未授予或不可用', e)
      return false
    }
  }

  // 启动固定时长（默认3秒）倒计时录音
  async startRecording(
    durationSeconds = 3,
    onCountdownTick?: (remainSeconds: number) => void
  ): Promise<Blob> {
    stopAllAudio()

    if (!this.mediaStream) {
      const ok = await this.requestPermission()
      if (!ok) {
        throw new Error('PERMISSION_DENIED')
      }
    }

    return new Promise((resolve, reject) => {
      try {
        this.chunks = []
        let mimeType = 'audio/webm'
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4'
        }

        this.mediaRecorder = new MediaRecorder(this.mediaStream!, { mimeType })
        this.isRecording = true

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.chunks.push(e.data)
          }
        }

        this.mediaRecorder.onstop = () => {
          this.isRecording = false
          const blob = new Blob(this.chunks, { type: mimeType })
          resolve(blob)
        }

        this.mediaRecorder.onerror = (e) => {
          this.isRecording = false
          reject(e)
        }

        this.mediaRecorder.start()

        // 倒计时管理
        let remaining = durationSeconds
        if (onCountdownTick) onCountdownTick(remaining)

        const interval = setInterval(() => {
          remaining -= 1
          if (onCountdownTick) onCountdownTick(remaining)

          if (remaining <= 0) {
            clearInterval(interval)
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
              this.mediaRecorder.stop()
            }
          }
        }, 1000)

      } catch (err) {
        this.isRecording = false
        reject(err)
      }
    })
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop()
    }
    this.isRecording = false
  }

  get recordingState(): boolean {
    return this.isRecording
  }
}

export const recorder = new BabyVoiceRecorder()
