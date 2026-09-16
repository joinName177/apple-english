const MIN_AUDIBLE_TTS_DURATION_MS = 150

interface NativeTtsResult {
  isAndroid: boolean
  elapsedMs: number
  reportedProgress: boolean
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
