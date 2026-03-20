import { fetchSubtitle } from '~/lib/fetchSubtitle'
import { ChatGPTAgent, OpenAIStreamPayload } from '~/lib/openai/fetchOpenAIResult'
import { getSmallSizeTranscripts } from '~/lib/openai/getSmallSizeTranscripts'
import { getUserSubtitlePrompt, getUserSubtitleWithTimestampPrompt } from '~/lib/openai/prompt'
import { SummarizeParams } from '~/lib/types'
import { isDev } from '~/utils/env'

function resolveDefaultModel(): string {
  if (process.env.OPENAI_COMPATIBLE_MODEL) {
    return process.env.OPENAI_COMPATIBLE_MODEL
  }
  // When only MINIMAX_API_KEY is configured, default to a MiniMax model.
  if (process.env.MINIMAX_API_KEY && !process.env.OPENAI_API_KEY) {
    return 'MiniMax-M2.7'
  }
  return 'gpt-3.5-turbo'
}

const DEFAULT_MODEL = resolveDefaultModel()

export class SummarizeRequestError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = 'SummarizeRequestError'
    this.statusCode = statusCode
  }
}

export async function buildSummarizeOpenAIPayload({ videoConfig, userConfig }: SummarizeParams): Promise<{
  openAiPayload: OpenAIStreamPayload
  userKey?: string
  baseUrl?: string
  videoId: string
}> {
  const { userKey, baseUrl, shouldShowTimestamp } = userConfig || {}
  const { videoId } = videoConfig

  if (!videoId) {
    throw new SummarizeRequestError(500, 'No videoId in the request')
  }

  const { title, subtitlesArray, descriptionText } = await fetchSubtitle(videoConfig, shouldShowTimestamp)
  if (!subtitlesArray && !descriptionText) {
    console.error('No subtitle in the video: ', videoId)
    throw new SummarizeRequestError(501, 'No subtitle in the video')
  }

  const inputText = subtitlesArray ? getSmallSizeTranscripts(subtitlesArray, subtitlesArray) : descriptionText

  const userPrompt = shouldShowTimestamp
    ? getUserSubtitleWithTimestampPrompt(title, inputText, videoConfig)
    : getUserSubtitlePrompt(title, inputText, videoConfig)

  if (isDev) {
    console.log('final user prompt: ', userPrompt)
  }

  const openAiPayload: OpenAIStreamPayload = {
    model: videoConfig.model || DEFAULT_MODEL,
    messages: [{ role: ChatGPTAgent.user, content: userPrompt }],
    max_tokens: Number(videoConfig.detailLevel) || (userKey ? 800 : 600),
    stream: Boolean(videoConfig.enableStream ?? true),
  }

  return { openAiPayload, userKey, baseUrl, videoId }
}
