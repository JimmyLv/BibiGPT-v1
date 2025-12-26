import { VideoConfig } from '~/lib/types'

function normalizeModelId(model?: string) {
  return (model || 'default').replace(/[^\w.-]/g, '_')
}

export function getCacheId({ showTimestamp, videoId, outputLanguage, detailLevel, model }: VideoConfig) {
  const prefix = showTimestamp ? 'timestamp-' : ''
  return `${prefix}${videoId}-${outputLanguage}-${detailLevel}-${normalizeModelId(model)}`
}
