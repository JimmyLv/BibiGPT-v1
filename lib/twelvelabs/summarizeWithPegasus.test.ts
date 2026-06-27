import assert from 'node:assert'
import { VideoConfig, VideoService } from '~/lib/types'
import { canUsePegasus, isTwelveLabsEnabled, summarizeWithPegasus } from '~/lib/twelvelabs/summarizeWithPegasus'

// Lightweight, framework-free checks (matching this repo's no-test-runner convention).
// Run with any TS-aware runner once one is configured, e.g.: npx tsx lib/twelvelabs/summarizeWithPegasus.test.ts
//
// The network test is skipped unless TWELVELABS_API_KEY (and PEGASUS_TEST_VIDEO_URL) are set,
// so it never runs in CI/local without an explicit opt-in.

function makeConfig(overrides: Partial<VideoConfig> = {}): VideoConfig {
  return {
    videoId: 'test',
    service: VideoService.Youtube,
    ...overrides,
  }
}

async function run() {
  // --- no-network unit checks ---
  const original = process.env.TWELVELABS_API_KEY
  delete process.env.TWELVELABS_API_KEY

  assert.strictEqual(isTwelveLabsEnabled(), false, 'disabled when no key')
  assert.strictEqual(canUsePegasus(makeConfig({ videoUrl: 'https://x/v.mp4' })), false, 'needs key even with url')

  process.env.TWELVELABS_API_KEY = 'test-key'
  assert.strictEqual(isTwelveLabsEnabled(), true, 'enabled with key')
  assert.strictEqual(canUsePegasus(makeConfig()), false, 'needs a videoUrl, not just a key')
  assert.strictEqual(canUsePegasus(makeConfig({ videoUrl: 'https://x/v.mp4' })), true, 'enabled with key + url')

  // Guards: missing url should throw with a 400, not call the network.
  await assert.rejects(() => summarizeWithPegasus('t', makeConfig()), /No videoUrl/)

  if (original === undefined) delete process.env.TWELVELABS_API_KEY
  else process.env.TWELVELABS_API_KEY = original

  console.log('unit checks passed')

  // --- live contract check (opt-in) ---
  const liveUrl = process.env.PEGASUS_TEST_VIDEO_URL
  if (process.env.TWELVELABS_API_KEY && liveUrl) {
    const summary = await summarizeWithPegasus('Test Video', makeConfig({ videoUrl: liveUrl, outputLanguage: 'en-US' }))
    assert.ok(summary.length > 0, 'Pegasus returned a non-empty summary')
    console.log('live Pegasus check passed:', summary.slice(0, 80))
  } else {
    console.log('live Pegasus check skipped (set TWELVELABS_API_KEY and PEGASUS_TEST_VIDEO_URL to run)')
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
