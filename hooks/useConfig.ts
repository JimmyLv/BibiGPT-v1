import { useLocalStorage } from './useLocalStorage'

export const useWriteKey = () =>
  useLocalStorage(
    'segment_playground_write_key',
    process.env.NEXT_PUBLIC_WRITEKEY
  )

export const useCDNUrl = () =>
  useLocalStorage('segment_playground_cdn_url', 'https://cdn.segment.com')
