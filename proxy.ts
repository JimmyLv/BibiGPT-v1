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

function isChatRequest(req: NextRequest) {
  return req.nextUrl.pathname === '/api/chat'
}

function textError(status: number, message: string): NextResponse {
  return new NextResponse(`${status}::${message}`, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
}

/**
 * Respond with JSON indicating an error message
 */
function redirectAuth(req: NextRequest): NextResponse {
  console.error('Authentication Failed')
  if (isChatRequest(req)) {
    return textError(401, 'Authentication Failed')
  }
  return new NextResponse(JSON.stringify({ success: false, message: 'Authentication Failed' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  })
}

/**
 * Redirects the user to the page where the number of uses is purchased
 */
function redirectShop(req: NextRequest): NextResponse {
  console.error('Account Limited')
  if (isChatRequest(req)) {
    return textError(504, 'Account Limited')
  }
  return NextResponse.redirect(new URL('/shop', req.url))
}

export async function proxy(req: NextRequest, context: NextFetchEvent) {
  if (req.method !== 'POST') {
    return NextResponse.next()
  }

  const contentType = req.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return NextResponse.next()
  }

  try {
    let body: Partial<SummarizeParams>
    try {
      body = (await req.json()) as Partial<SummarizeParams>
    } catch (parseError) {
      console.warn('proxy skipped non-json/empty body request', parseError)
      return NextResponse.next()
    }

    const { userConfig = {}, videoConfig } = body
    const { userKey } = userConfig

    if (!videoConfig) {
      return NextResponse.next()
    }

    const cacheId = getCacheId(videoConfig)
    const ipIdentifier =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.11'

    // licenseKeys
    if (userKey) {
      if (checkOpenaiApiKeys(userKey)) {
        const { success, remaining } = await ratelimitForApiKeyIps.limit(ipIdentifier)
        console.log(`use user apiKey ${ipIdentifier}, remaining: ${remaining}`)
        if (!success) {
          return redirectShop(req)
        }

        return NextResponse.next()
      }

      // 3. something-invalid-sdalkjfasncs-key
      const isValidatedLicense = await validateLicenseKey(userKey, cacheId)
      if (!isValidatedLicense) {
        return redirectShop(req)
      }
    }

    if (isDev) {
      return NextResponse.next()
    }
    //  👇 below only works for production

    if (!userKey) {
      const { success, remaining } = await ratelimitForIps.limit(ipIdentifier)
      console.log(`ip free user ${ipIdentifier}, remaining: ${remaining}`)
      if (!success) {
        // We need to create a response and hand it to the supabase client to be able to modify the response headers.
        const res = NextResponse.next()
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
        return redirectAuth(req)
      }
    }

    const result = await redis.get<string>(cacheId)
    if (result) {
      console.log('hit cache for ', cacheId)
      if (isChatRequest(req)) {
        return new NextResponse(result, {
          status: 200,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        })
      }
      return NextResponse.json(result)
    }
  } catch (e) {
    console.error(e)
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const proxyConfig = {
  matcher: ['/api/sumup', '/api/chat'],
}
