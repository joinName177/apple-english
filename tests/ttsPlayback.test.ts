import test from 'node:test'
import assert from 'node:assert/strict'

import {
  measureNativeTtsPlayback,
  shouldFallbackFromNativeTts,
} from '../src/services/ttsPlayback.ts'

test('measures native playback before slow listener cleanup', async () => {
  const timestamps = [1000, 1080]
  let cleanedUp = false

  const elapsedMs = await measureNativeTtsPlayback(
    async () => {},
    async () => {
      await new Promise(resolve => setTimeout(resolve, 200))
      cleanedUp = true
    },
    () => timestamps.shift() ?? 1080
  )

  assert.equal(elapsedMs, 80)
  assert.equal(cleanedUp, true)
})

test('listener cleanup failure does not turn successful playback into failure', async () => {
  const originalWarn = console.warn
  console.warn = () => {}

  try {
    const elapsedMs = await measureNativeTtsPlayback(
      async () => {},
      async () => { throw new Error('cleanup failed') },
      (() => {
        const timestamps = [2000, 2100]
        return () => timestamps.shift() ?? 2100
      })()
    )

    assert.equal(elapsedMs, 100)
  } finally {
    console.warn = originalWarn
  }
})

test('falls back when native TTS finishes immediately without reporting speech progress', () => {
  assert.equal(
    shouldFallbackFromNativeTts({ isAndroid: true, elapsedMs: 80, reportedProgress: false }),
    true
  )
})

test('keeps native TTS when the engine reports speech progress', () => {
  assert.equal(
    shouldFallbackFromNativeTts({ isAndroid: true, elapsedMs: 80, reportedProgress: true }),
    false
  )
})

test('keeps native TTS when playback lasts long enough for audible speech', () => {
  assert.equal(
    shouldFallbackFromNativeTts({ isAndroid: true, elapsedMs: 150, reportedProgress: false }),
    false
  )
})

test('does not apply the Android silent-playback heuristic on other platforms', () => {
  assert.equal(
    shouldFallbackFromNativeTts({ isAndroid: false, elapsedMs: 80, reportedProgress: false }),
    false
  )
})
