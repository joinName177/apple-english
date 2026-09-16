import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildOnlineTtsUrls,
  measureNativeTtsPlayback,
  shouldFallbackFromNativeTts,
} from '../src/services/ttsPlayback.ts'

test('splits long Chinese text into playable online TTS segments', () => {
  assert.deepEqual(
    buildOnlineTtsUrls('静夜思。床前明月光，疑是地上霜。', 'zh'),
    [
      'https://dict.youdao.com/dictvoice?audio=%E9%9D%99%E5%A4%9C%E6%80%9D&le=zh',
      'https://dict.youdao.com/dictvoice?audio=%E5%BA%8A%E5%89%8D%E6%98%8E%E6%9C%88%E5%85%89&le=zh',
      'https://dict.youdao.com/dictvoice?audio=%E7%96%91%E6%98%AF%E5%9C%B0%E4%B8%8A%E9%9C%9C&le=zh',
    ]
  )
})

test('chunks Chinese text without punctuation at six characters', () => {
  assert.deepEqual(
    buildOnlineTtsUrls('这是一个很长的中文解释', 'zh'),
    [
      'https://dict.youdao.com/dictvoice?audio=%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E5%BE%88%E9%95%BF&le=zh',
      'https://dict.youdao.com/dictvoice?audio=%E7%9A%84%E4%B8%AD%E6%96%87%E8%A7%A3%E9%87%8A&le=zh',
    ]
  )
})

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
