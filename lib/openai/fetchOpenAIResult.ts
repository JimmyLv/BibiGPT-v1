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
  return apiKey || process.env.OPENAI_COMPATIBLE_API_KEY || process.env.OPENAI_API_KEY || ''
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

function createProvider(apiKey: string, baseUrl?: string) {
  return createOpenAICompatible({
    baseURL: normalizeBaseUrl(baseUrl) || process.env.OPENAI_COMPATIBLE_BASE_URL || 'https://api.openai.com/v1',
    name: process.env.OPENAI_COMPATIBLE_PROVIDER_NAME || 'openai-compatible',
    apiKey,
  })
}

function toModelMessages(messages: ChatGPTMessage[]): ModelMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
  })) as ModelMessage[]
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
    const result = await generateText({
      model,
      messages,
      maxOutputTokens: payload.max_tokens,
      temperature: payload.temperature,
      topP: payload.top_p,
      frequencyPenalty: payload.frequency_penalty,
      presencePenalty: payload.presence_penalty,
    })
    const betterResult = trimOpenAiResult(result.text)

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
        controller.close()
        const data = await redis.set(cacheId, tempData)
        console.info(`video ${cacheId} cached:`, data)
        isDev && console.log('========betterResult after streamed========', tempData)
      } catch (error) {
        controller.error(error)
      }
    },
  })

  return stream
}
