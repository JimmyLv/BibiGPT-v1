import { z } from 'zod'

export const videoConfigSchema = z.object({
  // videoId: z.string(),
  enableStream: z.boolean().optional(),
  showTimestamp: z.boolean().optional(),
  showEmoji: z.boolean().optional(),
  outputLanguage: z.string().optional(),
  detailLevel: z.number().optional(),
  sentenceNumber: z.number().optional(),
  outlineLevel: z.number().optional(),
})

export type VideoConfigSchema = z.infer<typeof videoConfigSchema>
