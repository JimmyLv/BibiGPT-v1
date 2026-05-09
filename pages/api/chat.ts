import type { NextApiRequest, NextApiResponse } from 'next'
import { buildSummarizeOpenAIPayload, SummarizeRequestError } from '~/lib/openai/buildSummarizeRequest'
import { fetchOpenAIResult } from '~/lib/openai/fetchOpenAIResult'
import { selectApiKeyAndActivatedLicenseKey } from '~/lib/openai/selectApiKeyAndActivatedLicenseKey'
import { SummarizeParams } from '~/lib/types'
import { writeWebStreamToNodeResponse } from '~/lib/openai/writeWebStreamToNodeResponse'

if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_COMPATIBLE_API_KEY && !process.env.MINIMAX_API_KEY) {
  throw new Error('Missing env var for LLM provider API key (OPENAI_API_KEY, OPENAI_COMPATIBLE_API_KEY, or MINIMAX_API_KEY)')
}

type ChatBody = Partial<SummarizeParams> & {
  messages?: Array<{ role: string; content?: string }>
}

function toHttpErrorMessage(statusCode: number, message: string) {
  return `${statusCode}::${message}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).send(toHttpErrorMessage(405, 'Method Not Allowed'))
  }

  const { videoConfig, userConfig } = req.body as ChatBody
  if (!videoConfig || !userConfig) {
    return res.status(400).send(toHttpErrorMessage(400, 'Missing videoConfig or userConfig'))
  }

  try {
    const { openAiPayload, userKey, baseUrl, videoId } = await buildSummarizeOpenAIPayload({ videoConfig, userConfig })
    const openaiApiKey = await selectApiKeyAndActivatedLicenseKey(userKey, videoId)
    const streamResult = await fetchOpenAIResult({ ...openAiPayload, stream: true }, openaiApiKey, videoConfig, baseUrl)

    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache')

    if (streamResult instanceof ReadableStream) {
      await writeWebStreamToNodeResponse(streamResult, res)
      return
    }

    res.status(200).send(streamResult)
  } catch (error: any) {
    const statusCode = error instanceof SummarizeRequestError ? error.statusCode : 500
    const message = error?.message || 'Internal Server Error'
    console.error(message)
    res.status(statusCode).send(toHttpErrorMessage(statusCode, message))
  }
}
