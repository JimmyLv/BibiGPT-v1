import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { ModelMessage, generateText, streamText } from 'ai'
import { Redis } from '@upstash/redis'
import { trimOpenAiResult } from '~/lib/openai/trimOpenAiResult'
import { VideoConfig } from '~/lib/types'
import { isDev } from '~/utils/env'
import { getCacheId } from '~/utils/getCacheId'

export enum ChatGPTAgent {
  user = 'user',
  system = 'system',
  assistant = 'assistant',
}

export interface ChatGPTMessage {
  role: ChatGPTAgent
  content: string
}
export interface OpenAIStreamPayload {
  api_key?: string
  model: string
  messages: ChatGPTMessage[]
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  max_tokens: number
  stream: boolean
  n?: number
}

function resolveProviderApiKey(apiKey?: string) {
  return apiKey || process.env.OPENAI_COMPATIBLE_API_KEY || process.env.MINIMAX_API_KEY || process.env.OPENAI_API_KEY || ''
}

function normalizeBaseUrl(baseUrl?: string) {
  const value = baseUrl?.trim()
  if (!value) {
    return ''
  }
  if (!/^https?:\/\//.test(value)) {
    throw new Error('baseUrl must start with http:// or https://')
  }
  return value.replace(/\/+$/, '')
}

function resolveDefaultBaseUrl(): string {
  if (process.env.OPENAI_COMPATIBLE_BASE_URL) {
    return process.env.OPENAI_COMPATIBLE_BASE_URL
  }
  // When only MINIMAX_API_KEY is set, default to the MiniMax endpoint.
  if (process.env.MINIMAX_API_KEY && !process.env.OPENAI_API_KEY) {
    return 'https://api.minimax.io/v1'
  }
  return 'https://api.openai.com/v1'
}

function isMiniMaxUrl(baseUrl: string): boolean {
  return baseUrl.includes('minimax.io') || baseUrl.includes('minimax.chat')
}

function resolveProviderName(baseUrl: string): string {
  if (process.env.OPENAI_COMPATIBLE_PROVIDER_NAME) {
    return process.env.OPENAI_COMPATIBLE_PROVIDER_NAME
  }
  if (isMiniMaxUrl(baseUrl)) {
    return 'minimax'
  }
  return 'openai-compatible'
}

function createProvider(apiKey: string, baseUrl?: string) {
  const resolvedBaseUrl = normalizeBaseUrl(baseUrl) || resolveDefaultBaseUrl()
  return createOpenAICompatible({
    baseURL: resolvedBaseUrl,
    name: resolveProviderName(resolvedBaseUrl),
    apiKey,
  })
}

function toModelMessages(messages: ChatGPTMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as ModelMessage[]
}

async function generateTextFallback(params: {
  model: ReturnType<ReturnType<typeof createProvider>['chatModel']>
  messages: ModelMessage[]
  payload: OpenAIStreamPayload
}) {
  const result = await generateText({
    model: params.model,
    messages: params.messages,
    maxOutputTokens: params.payload.max_tokens,
    temperature: params.payload.temperature,
    topP: params.payload.top_p,
    frequencyPenalty: params.payload.frequency_penalty,
    presencePenalty: params.payload.presence_penalty,
  })

  return trimOpenAiResult(result.text)
}

export async function fetchOpenAIResult(
  payload: OpenAIStreamPayload,
  apiKey: string,
  videoConfig: VideoConfig,
  baseUrl?: string,
) {
  const resolvedApiKey = resolveProviderApiKey(apiKey)
  if (!resolvedApiKey) {
    throw new Error('Missing API key for OpenAI-compatible provider')
  }
  const model = createProvider(resolvedApiKey, baseUrl).chatModel(payload.model)
  const messages = toModelMessages(payload.messages)

  isDev && console.log({ apiKey: resolvedApiKey })

  const redis = Redis.fromEnv()
  const cacheId = getCacheId(videoConfig)

  if (!payload.stream) {
    const betterResult = await generateTextFallback({ model, messages, payload })

    const data = await redis.set(cacheId, betterResult)
    console.info(`video ${cacheId} cached:`, data)
    isDev && console.log('========betterResult========', betterResult)

    return betterResult
  }

  const result = streamText({
    model,
    messages,
    maxOutputTokens: payload.max_tokens,
    temperature: payload.temperature,
    topP: payload.top_p,
    frequencyPenalty: payload.frequency_penalty,
    presencePenalty: payload.presence_penalty,
  })

  const encoder = new TextEncoder()
  let tempData = ''
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const textPart of result.textStream) {
          tempData += textPart
          controller.enqueue(encoder.encode(textPart))
        }

        // Edge runtime can fail to decode provider stream in some environments.
        // If stream finished but emitted no usable content, fallback to non-stream.
        if (!tempData.trim()) {
          const fallbackText = await generateTextFallback({ model, messages, payload })
          if (fallbackText) {
            tempData = fallbackText
            controller.enqueue(encoder.encode(fallbackText))
          }
        }

        controller.close()
        const data = await redis.set(cacheId, tempData)
        console.info(`video ${cacheId} cached:`, data)
        isDev && console.log('========betterResult after streamed========', tempData)
      } catch (streamError) {
        // Degrade gracefully: return full text instead of failing the whole request.
        try {
          const fallbackText = await generateTextFallback({ model, messages, payload })
          tempData = fallbackText
          controller.enqueue(encoder.encode(fallbackText))
          controller.close()
          const data = await redis.set(cacheId, tempData)
          console.info(`video ${cacheId} cached by fallback:`, data)
          isDev && console.warn('stream failed, used fallback generateText', streamError)
        } catch (fallbackError) {
          controller.error(fallbackError)
        }
      }
    },
  })

  return stream
}
