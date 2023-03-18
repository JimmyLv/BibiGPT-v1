import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { Redis } from '@upstash/redis'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { SummarizeParams } from '~/lib/types'
import { getCacheId } from '~/utils/getCacheId'
import { validateLicenseKey } from './lib/lemon'
import { checkOpenaiApiKeys } from './lib/openai/checkOpenaiApiKey'
import { ratelimitForApiKeyIps, ratelimitForFreeAccounts, ratelimitForIps } from './lib/upstash'
import { isDev } from './utils/env'

const redis = Redis.fromEnv()

/**
 *
 * Respond with JSON indicating an error message
 * @return {*}  {NextResponse}
 */
function redirectAuth(): NextResponse {
  // return NextResponse.redirect(new URL("/shop", req.url));
  console.error('Authentication Failed')
  return new NextResponse(JSON.stringify({ success: false, message: 'Authentication Failed' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * Redirects the user to the page where the number of uses is purchased
 *
 * @param {NextRequest} req
 * @return {*}  {NextResponse}
 */
function redirectShop(req: NextRequest): NextResponse {
  console.error('Account Limited')
  return NextResponse.redirect(new URL('/shop', req.url))
}
function btoa(str: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  return globalThis.btoa(String.fromCharCode(...new Uint8Array(data)))
}
function rewrite(request: NextRequest) {
  const apiUrl = process.env.INTERNAL_API_HOSTNAME
  const username = process.env.INTERNAL_API_ACCOUNT
  const password = process.env.INTERNAL_API_PASSWORD

  // Clone the request headers and set a new auth header
  const authHeaders = new Headers(request.headers)
  const auth = btoa(`${username}:${password}`)
  authHeaders.set('Authorization', `Basic ${auth}`)
  const path = request.nextUrl.pathname
  request.nextUrl.href = `${apiUrl}${path}`

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: authHeaders,
    },
  })
}

export async function middleware(req: NextRequest, context: NextFetchEvent) {
  try {
    const { userConfig, videoConfig } = (await req.json()) as SummarizeParams
    // TODO: update shouldShowTimestamp to use videoConfig
    const { userKey } = userConfig || {}
    const cacheId = getCacheId(videoConfig)
    const ipIdentifier = req.ip ?? '127.0.0.12'

    // licenseKeys
    if (userKey) {
      if (checkOpenaiApiKeys(userKey)) {
        const { success, remaining } = await ratelimitForApiKeyIps.limit(ipIdentifier)
        console.log(`use user apiKey ${ipIdentifier}, remaining: ${remaining}`)
        if (!success) {
          return redirectShop(req)
        }

        return rewrite(req)
      }

      // 3. something-invalid-sdalkjfasncs-key
      const isValidatedLicense = await validateLicenseKey(userKey, cacheId)
      if (!isValidatedLicense) {
        return redirectShop(req)
      }
    }

    if (isDev) {
      return rewrite(req)
    }
    //  👇 below only works for production

    if (!userKey) {
      const { success, remaining } = await ratelimitForIps.limit(ipIdentifier)
      console.log(`ip free user ${ipIdentifier}, remaining: ${remaining}`)
      if (!success) {
        // We need to create a response and hand it to the supabase client to be able to modify the response headers.
        const res = rewrite(req)
        // TODO: unique to a user (userid, email etc) instead of IP
        // Create authenticated Supabase Client.
        const supabase = createMiddlewareSupabaseClient({ req, res })
        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession()
        // Check auth condition
        const userEmail = session?.user.email
        if (userEmail) {
          // Authentication successful, forward request to protected route.
          const { success, remaining } = await ratelimitForFreeAccounts.limit(userEmail)
          // TODO: only reduce the count after summarized successfully
          console.log(`login user ${userEmail}, remaining: ${remaining}`)
          if (!success) {
            return redirectShop(req)
          }

          return res
        }

        // todo: throw error to trigger a modal, rather than redirect a page
        return redirectAuth()
      }
    }

    const result = await redis.get<string>(cacheId)
    if (result) {
      console.log('hit cache for ', cacheId)
      return NextResponse.json(result)
    }
  } catch (error: any) {
    console.error('catch middleware error: ', error)
    return new Response(
      JSON.stringify({
        errorMessage: 'Middleware Error: ' + error.message,
      }),
      {
        status: 500,
      },
    )
  }
}

export const config = {
  matcher: '/api/:path*',
}
