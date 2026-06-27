import type { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'
import { buildSummarizeOpenAIPayload, SummarizeRequestError } from '~/lib/openai/buildSummarizeRequest'
import { fetchOpenAIResult } from '~/lib/openai/fetchOpenAIResult'
import { selectApiKeyAndActivatedLicenseKey } from '~/lib/openai/selectApiKeyAndActivatedLicenseKey'
import { SummarizeParams } from '~/lib/types'
import { writeWebStreamToNodeResponse } from '~/lib/openai/writeWebStreamToNodeResponse'
import { canUsePegasus, summarizeWithPegasus, TwelveLabsError } from '~/lib/twelvelabs/summarizeWithPegasus'
import { getCacheId } from '~/utils/getCacheId'

if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_COMPATIBLE_API_KEY) {
  throw new Error('Missing env var for OpenAI-compatible provider API key')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ errorMessage: 'Method Not Allowed' })
  }

  const summarizeParams = req.body as Partial<SummarizeParams>
  if (!summarizeParams?.videoConfig || !summarizeParams?.userConfig) {
    return res.status(400).json({ errorMessage: 'Missing videoConfig or userConfig' })
  }

  try {
    const normalizedParams = summarizeParams as SummarizeParams
    const { videoConfig } = normalizedParams

    // Opt-in: when TWELVELABS_API_KEY is set and a direct video URL is supplied, summarise the
    // video natively with Pegasus instead of the transcript -> OpenAI flow. Non-streamed text.
    if (canUsePegasus(videoConfig)) {
      const summary = await summarizeWithPegasus('', videoConfig)
      try {
        const redis = Redis.fromEnv()
        await redis.set(getCacheId(videoConfig), summary)
      } catch (cacheError: any) {
        console.error('Failed to cache Pegasus summary:', cacheError?.message)
      }
      return res.status(200).json(summary)
    }

    const { openAiPayload, userKey, baseUrl, videoId } = await buildSummarizeOpenAIPayload(normalizedParams)
    const openaiApiKey = await selectApiKeyAndActivatedLicenseKey(userKey, videoId)
    const result = await fetchOpenAIResult(openAiPayload, openaiApiKey, videoConfig, baseUrl)

    if (openAiPayload.stream) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache')
      if (result instanceof ReadableStream) {
        await writeWebStreamToNodeResponse(result, res)
        return
      }
      res.status(200).send(result)
      return
    }

    res.status(200).json(result)
  } catch (error: any) {
    if (error instanceof SummarizeRequestError || error instanceof TwelveLabsError) {
      return res.status(error.statusCode).json({ errorMessage: error.message })
    }
    console.error(error?.message)
    return res.status(500).json({
      errorMessage: error?.message || 'Internal Server Error',
    })
  }
}
