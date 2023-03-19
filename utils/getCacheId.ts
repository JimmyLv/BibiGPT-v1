import { VideoConfig } from '~/lib/types'

export function getCacheId({ showTimestamp, videoId, outputLanguage, detailLevel }: VideoConfig) {
  const prefix = showTimestamp ? 'timestamp-' : ''
  return `${prefix}${videoId}-${outputLanguage}-${detailLevel}`
}
