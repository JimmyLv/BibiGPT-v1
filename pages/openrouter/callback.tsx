import type { NextPage } from 'next'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const OPENROUTER_EXCHANGE_URL = 'https://openrouter.ai/api/v1/auth/keys'
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

type CallbackStatus = {
  loading: boolean
  message: string
  isError: boolean
}

function parseErrorMessage(errorBody: string) {
  if (!errorBody) {
    return 'OpenRouter 返回了未知错误'
  }
  try {
    const json = JSON.parse(errorBody)
    return json?.error?.message || json?.message || errorBody
  } catch {
    return errorBody
  }
}

const OpenRouterCallbackPage: NextPage = () => {
  const [status, setStatus] = useState<CallbackStatus>({
    loading: true,
    message: '正在处理 OpenRouter 授权...',
    isError: false,
  })

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const state = url.searchParams.get('state')
        const oauthError = url.searchParams.get('error')
        const oauthErrorDescription = url.searchParams.get('error_description')

        if (oauthError) {
          throw new Error(oauthErrorDescription || oauthError)
        }
        if (!code || !state) {
          throw new Error('缺少 OAuth 返回参数 code/state')
        }

        const savedState = sessionStorage.getItem('openrouter_oauth_state')
        const codeVerifier = sessionStorage.getItem('openrouter_oauth_code_verifier')
        if (!savedState || !codeVerifier) {
          throw new Error('授权上下文已丢失，请重新发起授权')
        }
        if (savedState !== state) {
          throw new Error('OAuth state 校验失败，请重新授权')
        }

        const response = await fetch(OPENROUTER_EXCHANGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-OpenRouter-Title': 'BibiGPT',
            'X-OpenRouter-Categories': 'web-app',
          },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            code_challenge_method: 'S256',
          }),
        })

        if (!response.ok) {
          const errorBody = await response.text()
          throw new Error(parseErrorMessage(errorBody))
        }

        const data = (await response.json()) as { key?: string }
        if (!data.key) {
          throw new Error('OpenRouter 未返回 API Key')
        }

        window.localStorage.setItem('user-openai-apikey', JSON.stringify(data.key))
        window.localStorage.setItem('user-openai-base-url', JSON.stringify(OPENROUTER_BASE_URL))
        sessionStorage.removeItem('openrouter_oauth_state')
        sessionStorage.removeItem('openrouter_oauth_code_verifier')

        setStatus({
          loading: false,
          isError: false,
          message: '授权成功，正在返回首页...',
        })

        setTimeout(() => {
          window.location.replace('/')
        }, 800)
      } catch (error: any) {
        setStatus({
          loading: false,
          isError: true,
          message: `OpenRouter 授权失败：${error?.message || '未知错误'}`,
        })
      }
    }

    run().catch((error) => {
      setStatus({
        loading: false,
        isError: true,
        message: `OpenRouter 授权失败：${error?.message || '未知错误'}`,
      })
    })
  }, [])

  return (
    <main className="mx-auto mt-24 max-w-2xl px-4 text-center">
      <h1 className="text-2xl font-semibold">OpenRouter OAuth 回调</h1>
      <p className={`mt-4 text-base ${status.isError ? 'text-red-500' : 'text-slate-600'}`}>{status.message}</p>
      {!status.loading && status.isError ? (
        <div className="mt-8">
          <Link href="/" className="font-semibold text-sky-500 hover:underline">
            返回首页重新授权
          </Link>
        </div>
      ) : null}
    </main>
  )
}

export default OpenRouterCallbackPage
