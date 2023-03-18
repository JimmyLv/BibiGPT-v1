import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { FREE_LIMIT_COUNT, LOGIN_LIMIT_COUNT } from '~/utils/constants'

const redis = new Redis({
  url: process.env.UPSTASH_RATE_REDIS_REST_URL,
  token: process.env.UPSTASH_RATE_REDIS_REST_TOKEN,
})

export const ratelimitForIps = new Ratelimit({
  redis,
  // 速率限制算法 https://github.com/upstash/ratelimit#ratelimiting-algorithms
  limiter: Ratelimit.fixedWindow(FREE_LIMIT_COUNT, '1 d'),
  analytics: true, // <- Enable analytics
})
export const ratelimitForApiKeyIps = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(FREE_LIMIT_COUNT * 2, '1 d'),
  analytics: true,
})
export const ratelimitForFreeAccounts = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(LOGIN_LIMIT_COUNT, '1 d'),
  analytics: true,
})
