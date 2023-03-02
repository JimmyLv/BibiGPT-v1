import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 d"),
});

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { bvId, apiKey } = await req.json();
  // TODO: unique to a user (userid, email etc) instead of IP
  const identifier = req.ip ?? "127.0.0.5";
  const { success, remaining } = await ratelimit.limit(identifier);
  console.log(`======== ip ${identifier}, remaining: ${remaining} ========`);
  if (!apiKey && !success) {
    return NextResponse.redirect(new URL("/blocked", req.url));
  }

  const result = await redis.get<string>(bvId);
  if (result) {
    console.log("hit cache for ", bvId);
    return NextResponse.json(result);
  }
}

export const config = {
  matcher: "/api/summarize",
};
