import { z } from 'zod'

export const videoConfigSchema = z.object({
  // videoId: z.string(),
  // Optional direct, publicly fetchable video URL. When set together with
  // TWELVELABS_API_KEY, the opt-in TwelveLabs Pegasus video-native summarizer is used.
  videoUrl: z.string().url().optional(),
  enableStream: z.boolean().optional(),
  model: z.string().optional(),
  showTimestamp: z.boolean().optional(),
  showEmoji: z.boolean().optional(),
  outputLanguage: z.string().optional(),
  detailLevel: z.number().optional(),
  sentenceNumber: z.number().optional(),
  outlineLevel: z.number().optional(),
})

export type VideoConfigSchema = z.infer<typeof videoConfigSchema>
