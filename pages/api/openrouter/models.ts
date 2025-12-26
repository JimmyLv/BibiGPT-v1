import type { NextApiRequest, NextApiResponse } from 'next'

type OpenRouterModel = {
  id: string
  name: string
  created?: number
  context_length?: number
  pricing?: {
    prompt?: string
    completion?: string
  }
}

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[]
}

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'
const MODELS_LIMIT = Number(process.env.OPENROUTER_MODELS_LIMIT || 120)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-OpenRouter-Title': 'BibiGPT',
      },
    })

    if (!response.ok) {
      const detail = await response.text()
      return res.status(response.status).json({
        error: 'Failed to fetch models from OpenRouter',
        detail: detail.slice(0, 500),
      })
    }

    const payload = (await response.json()) as OpenRouterModelsResponse
    const models = (payload.data || [])
      .filter((model) => Boolean(model?.id && model?.name))
      .sort((a, b) => (b.created || 0) - (a.created || 0))
      .slice(0, MODELS_LIMIT)
      .map((model) => ({
        id: model.id,
        name: model.name,
        created: model.created || 0,
        contextLength: model.context_length || 0,
        promptPrice: model.pricing?.prompt || '',
        completionPrice: model.pricing?.completion || '',
      }))

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900')
    return res.status(200).json({
      updatedAt: new Date().toISOString(),
      latestModel: models[0] || null,
      models,
    })
  } catch (error: any) {
    return res.status(500).json({
      error: 'Failed to fetch OpenRouter models',
      message: error?.message || 'Unknown error',
    })
  }
}
