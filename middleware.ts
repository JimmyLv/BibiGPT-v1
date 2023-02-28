import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { bvId } = await req.json();
  const redis = Redis.fromEnv();

  const result = await redis.get<string>(bvId);
  if (result) {
    console.log("hit cache for ", bvId);
    return NextResponse.json(result);
  }
}

export const config = {
  matcher: "/api/summarize",
};
