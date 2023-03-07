import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { Redis } from "@upstash/redis";
import type { NextFetchEvent, NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SummarizeParams } from "~/lib/types";
import { validateLicenseKey } from "./lib/lemon";
import { checkOpenaiApiKeys } from "./lib/openai/openai";
import { ratelimit } from "./lib/upstash";
import { isDev } from "./utils/env";

const redis = Redis.fromEnv();

export async function middleware(req: NextRequest, context: NextFetchEvent) {
  const { userConfig, videoConfig } = (await req.json()) as SummarizeParams;
  const { userKey } = userConfig || {};
  const { videoId: bvId } = videoConfig || {};

  function redirectAuth() {
    // return NextResponse.redirect(new URL("/shop", req.url));
    // Respond with JSON indicating an error message
    console.error("Authentication Failed");
    return new NextResponse(
      JSON.stringify({ success: false, message: "Authentication Failed" }),
      { status: 401, headers: { "content-type": "application/json" } }
    );
  }

  // licenseKeys
  if (userKey) {
    if (checkOpenaiApiKeys(userKey)) {
      return NextResponse.next();
    }

    // 3. something-invalid-sdalkjfasncs-key
    if (!(await validateLicenseKey(userKey, bvId))) {
      return redirectAuth();
    }
  }

  if (!userKey) {
    const identifier = req.ip ?? "127.0.0.7";
    const { success, remaining } = await ratelimit.limit(identifier);
    console.log(`======== ip ${identifier}, remaining: ${remaining} ========`);
    if (!success) {
      // We need to create a response and hand it to the supabase client to be able to modify the response headers.
      const res = NextResponse.next();
      // TODO: unique to a user (userid, email etc) instead of IP
      // Create authenticated Supabase Client.
      const supabase = createMiddlewareSupabaseClient({ req, res });
      // Check if we have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Check auth condition
      const userEmail = session?.user.email;
      if (userEmail) {
        // Authentication successful, forward request to protected route.
        const { success, remaining } = await ratelimit.limit(userEmail);
        console.log(
          `======== user ${userEmail}, remaining: ${remaining} ========`
        );
        if (!success) {
          return redirectAuth();
        }

        return res;
      }

      // todo: throw error to trigger a modal, rather than redirect a page
      return redirectAuth();
    }

    return redirectAuth();
  }

  const result = await redis.get<string>(bvId);
  if (!isDev && result) {
    console.log("hit cache for ", bvId);
    return NextResponse.json(result);
  }
}

export const config = {
  matcher: "/api/summarize",
};
