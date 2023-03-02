import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { isDev } from "./utils/env";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis: new Redis({
    url: process.env.UPSTASH_RATE_REDIS_REST_URL,
    token: process.env.UPSTASH_RATE_REDIS_REST_TOKEN,
  }),
  // 速率限制算法 https://github.com/upstash/ratelimit#ratelimiting-algorithms
  limiter: Ratelimit.fixedWindow(5, "1 d"),
  analytics: true, // <- Enable analytics
});

export async function middleware(req: NextRequest, context: NextFetchEvent) {
  // if (isDev) {
  //   return NextResponse.next();
  // }

  const { bvId, apiKey } = await req.json();
  const result = await redis.get<string>(bvId);
  if (result) {
    console.log("hit cache for ", bvId);
    return NextResponse.json(result);
  }

  const response = await fetch(`https://api.lemonsqueezy.com/v1/license-keys`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.LEMON_API_KEY ?? ""}`,
    },
  });
  const keysData = await response.json();
  const licenseKeys = keysData.data?.map((i: any) => i.attributes.key);

  // licenseKeys
  if (
    apiKey &&
    !apiKey.startsWith(`sk-`) &&
    licenseKeys?.includes(apiKey.toLowerCase())
  ) {
    const { remaining } = await ratelimit.limit(apiKey.toLowerCase());
    // TODO: log to hit licenseKey
    console.log(`!!!!!!!!! {short-xxxx-licenseKey}, remaining: ${remaining} ========`);
    if (remaining === 0) {
      return NextResponse.redirect(new URL("/shop", req.url));
    }
  }

  // TODO: unique to a user (userid, email etc) instead of IP
  const identifier = req.ip ?? "127.0.0.3";
  const { success, remaining } = await ratelimit.limit(identifier);
  console.log(`======== ip ${identifier}, remaining: ${remaining} ========`);
  if (!apiKey && !success) {
    return NextResponse.redirect(new URL("/shop", req.url));
  }
}

export const config = {
  matcher: "/api/summarize",
};
