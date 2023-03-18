import { Redis } from '@upstash/redis'
import { createParser, ParsedEvent, ReconnectInterval } from 'eventsource-parser'
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

export async function fetchOpenAIResult(payload: OpenAIStreamPayload, apiKey: string, videoConfig: VideoConfig) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  isDev && console.log({ apiKey })
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey ?? ''}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  })

  if (res.status !== 200) {
    const errorJson = await res.json()
    throw new Error(`OpenAI API Error [${res.statusText}]: ${errorJson.error?.message}`)
  }

  const redis = Redis.fromEnv()
  const cacheId = getCacheId(videoConfig)

  if (!payload.stream) {
    const result = await res.json()
    const betterResult = trimOpenAiResult(result)

    const data = await redis.set(cacheId, betterResult)
    console.info(`video ${cacheId} cached:`, data)
    isDev && console.log('========betterResult========', betterResult)

    return betterResult
  }

  let counter = 0
  let tempData = ''
  const stream = new ReadableStream({
    async start(controller) {
      // callback
      async function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            // active
            controller.close()
            const data = await redis.set(cacheId, tempData)
            console.info(`video ${cacheId} cached:`, data)
            isDev && console.log('========betterResult after streamed========', tempData)
            return
          }
          try {
            const json = JSON.parse(data)
            const text = json.choices[0].delta?.content || ''
            // todo: add redis cache
            tempData += text
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return
            }
            const queue = encoder.encode(text)
            controller.enqueue(queue)
            counter++
          } catch (e) {
            // maybe parse error
            controller.error(e)
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse)
      // https://web.dev/streams/#asynchronous-iteration
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}
