import { VideoConfig } from '~/lib/types'
import { DEFAULT_LANGUAGE, LANGUAGE_CODE_TO_ENGLISH_NAME } from '~/utils/constants/language'
import { isDev } from '~/utils/env'

// Opt-in, video-native summarizer backed by TwelveLabs Pegasus.
//
// Unlike the default transcript -> OpenAI-compatible flow, Pegasus "watches" the
// video itself, so it works even when a video has no subtitles and can describe
// on-screen actions, scenes, and visuals that a transcript misses.
//
// This path only activates when TWELVELABS_API_KEY is set AND the request supplies
// a direct, publicly fetchable video URL (videoConfig.videoUrl). Otherwise behaviour
// is unchanged. Get a free key at https://twelvelabs.io.

const TWELVELABS_BASE_URL = process.env.TWELVELABS_BASE_URL || 'https://api.twelvelabs.io/v1.3'
// pegasus1.5 accepts a video URL/asset; pegasus1.2 only accepts an indexed videoId.
const PEGASUS_MODEL = process.env.TWELVELABS_PEGASUS_MODEL || 'pegasus1.5'
// pegasus1.5 requires max_tokens >= 512.
const MIN_MAX_TOKENS = 512

export function isTwelveLabsEnabled(): boolean {
  return Boolean(process.env.TWELVELABS_API_KEY)
}

// Pegasus is opt-in per request: enabled only when a direct video URL is available.
export function canUsePegasus(videoConfig: VideoConfig): boolean {
  return isTwelveLabsEnabled() && Boolean(videoConfig.videoUrl)
}

function buildPegasusPrompt(title: string, videoConfig: VideoConfig): string {
  const language = videoConfig.outputLanguage || DEFAULT_LANGUAGE
  const languageName = LANGUAGE_CODE_TO_ENGLISH_NAME[language] || language
  const sentenceCount = videoConfig.sentenceNumber || 7
  const emojiText = videoConfig.showEmoji ? 'Choose an appropriate emoji for each bullet point. ' : ''
  const timestampText = videoConfig.showTimestamp
    ? 'Prefix each bullet point with its start timestamp in seconds using the template "- seconds - [point]". '
    : ''
  const titleText = title ? `The video is titled "${title}". ` : ''

  return (
    `${titleText}Watch the video and summarise it. ` +
    `Your output should use the following template:\n## Summary\n## Highlights\n- Bulletpoint\n\n` +
    `Write a short one-sentence summary, then up to ${sentenceCount} concise highlight bullet points ` +
    `describing what actually happens in the video (actions, scenes, and spoken content). ` +
    `${timestampText}${emojiText}` +
    `Reply in ${languageName} Language.`
  )
}

class TwelveLabsError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'TwelveLabsError'
    this.statusCode = statusCode
  }
}

// Calls the synchronous Pegasus analyze endpoint and returns the generated summary text.
// The integration reads its own key from TWELVELABS_API_KEY; it never hardcodes one.
export async function summarizeWithPegasus(title: string, videoConfig: VideoConfig): Promise<string> {
  const apiKey = process.env.TWELVELABS_API_KEY
  if (!apiKey) {
    throw new TwelveLabsError(500, 'Missing TWELVELABS_API_KEY for the Pegasus summarizer')
  }
  const videoUrl = videoConfig.videoUrl
  if (!videoUrl) {
    throw new TwelveLabsError(400, 'No videoUrl provided for the Pegasus summarizer')
  }

  const prompt = buildPegasusPrompt(title, videoConfig)
  // detailLevel maps to response length in the transcript path; reuse it, but respect the model floor.
  const maxTokens = Math.max(Number(videoConfig.detailLevel) || 0, MIN_MAX_TOKENS)

  const response = await fetch(`${TWELVELABS_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model_name: PEGASUS_MODEL,
      video: { type: 'url', url: videoUrl },
      prompt,
      max_tokens: maxTokens,
      stream: false,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    let message = detail
    try {
      message = (JSON.parse(detail) as { message?: string }).message || detail
    } catch {
      // keep raw text
    }
    throw new TwelveLabsError(response.status, `TwelveLabs Pegasus request failed: ${message || response.statusText}`)
  }

  const result = (await response.json()) as { data?: string; message?: string }
  isDev && console.log('========pegasus result========', result?.data)

  const summary = result?.data?.trim()
  if (!summary) {
    throw new TwelveLabsError(502, `TwelveLabs Pegasus returned no summary: ${result?.message || 'empty response'}`)
  }
  return summary
}

export { TwelveLabsError }
