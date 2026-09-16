const MIN_AUDIBLE_TTS_DURATION_MS = 150
const MAX_CHINESE_TTS_SEGMENT_LENGTH = 6

interface NativeTtsResult {
  isAndroid: boolean
  elapsedMs: number
  reportedProgress: boolean
}

export function buildOnlineTtsUrls(text: string, lang: 'zh' | 'en'): string[] {
  if (lang === 'en') {
    const englishText = text.replace(/[^a-zA-Z\s'-]/g, '').trim() || text
    return [`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(englishText)}&type=2`]
  }

  const segments = text
    .split(/[，。！？；、,.!?;\s]+/u)
    .flatMap(part => {
      const characters = Array.from(part)
      const chunks: string[] = []
      for (let index = 0; index < characters.length; index += MAX_CHINESE_TTS_SEGMENT_LENGTH) {
        chunks.push(characters.slice(index, index + MAX_CHINESE_TTS_SEGMENT_LENGTH).join(''))
      }
      return chunks
    })
    .filter(Boolean)

  return segments.map(segment =>
    `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(segment)}&le=zh`
  )
}

export async function measureNativeTtsPlayback(
  speak: () => Promise<void>,
  cleanup: () => Promise<void>,
  now: () => number = () => performance.now()
): Promise<number> {
  const startedAt = now()
  let elapsedMs = 0

  try {
    await speak()
    elapsedMs = now() - startedAt
  } finally {
    try {
      await cleanup()
    } catch (error) {
      console.warn('Native TTS listener cleanup failed:', error)
    }
  }

  return elapsedMs
}

export function shouldFallbackFromNativeTts(result: NativeTtsResult): boolean {
  return result.isAndroid && !result.reportedProgress && result.elapsedMs < MIN_AUDIBLE_TTS_DURATION_MS
}
