import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FREE_LIMIT_COUNT } from "~/utils/constants";

export const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_RATE_REDIS_REST_URL,
    token: process.env.UPSTASH_RATE_REDIS_REST_TOKEN,
  }),
  // 速率限制算法 https://github.com/upstash/ratelimit#ratelimiting-algorithms
  limiter: Ratelimit.fixedWindow(FREE_LIMIT_COUNT, "1 d"),
  analytics: true, // <- Enable analytics
});
