import test from 'node:test'
import assert from 'node:assert/strict'

import { TextToSpeech } from '@capacitor-community/text-to-speech'
import { playAudioUrl } from '../src/services/audio.ts'

test('waits for previous audio cleanup before starting fallback URL playback', async () => {
  const originalStop = TextToSpeech.stop
  const originalAudio = globalThis.Audio
  const originalWindow = globalThis.window
  let pauseCount = 0
  let playCount = 0

  class FakeAudio {
    currentTime = 0
    onended: (() => void) | null = null
    onerror: (() => void) | null = null

    pause() {
      pauseCount += 1
    }

    async play() {
      playCount += 1
    }
  }

  TextToSpeech.stop = async () => {
    await Promise.resolve()
  }
  Object.defineProperty(globalThis, 'Audio', { configurable: true, value: FakeAudio })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { speechSynthesis: { speaking: false, cancel() {} } },
  })

  try {
    void playAudioUrl('https://example.test/speech.mp3')
    await new Promise(resolve => setTimeout(resolve, 0))

    assert.equal(playCount, 1)
    assert.equal(pauseCount, 0)
  } finally {
    TextToSpeech.stop = originalStop
    Object.defineProperty(globalThis, 'Audio', { configurable: true, value: originalAudio })
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow })
  }
})
