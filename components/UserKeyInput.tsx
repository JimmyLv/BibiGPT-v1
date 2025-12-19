import React from 'react'
import { useAnalytics } from '~/components/context/analytics'
import { CHECKOUT_URL, RATE_LIMIT_COUNT } from '~/utils/constants'

type UserKeyInputProps = {
  value: string | undefined
  onChange: (e: any) => void
  baseUrl: string | undefined
  onBaseUrlChange: (e: any) => void
  oauthLoading: boolean
  onStartOpenRouterOAuth: () => void
}

export function UserKeyInput(props: UserKeyInputProps) {
  const { analytics } = useAnalytics()

  return (
    <details>
      <summary className="mt-10 flex cursor-pointer items-center space-x-3	">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-left font-medium">
          <span className="text-sky-400 hover:text-sky-600">请使用自己的 API Key</span>
          （每天免费 {RATE_LIMIT_COUNT} 次哦，支持
          <a
            className="text-pink-400 hover:underline"
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.track('ShopLink Clicked')}
          >
            「购买次数」
          </a>
          啦！
          <a href="/wechat.jpg" target="_blank" rel="noopener noreferrer">
            也可以真的
            <span className="text-pink-400 hover:underline">「给我打赏」</span>哦 🤣）
          </a>
        </p>
      </summary>
      <div className="text-lg text-slate-700 dark:text-slate-400">
        <input
          value={props.value}
          onChange={props.onChange}
          className="mx-auto my-4 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={'填你的 API Key（OpenAI 或兼容 OpenAI Provider）或 License Key: xxx-CCDE-xxx'}
        />
        <input
          value={props.baseUrl}
          onChange={props.onBaseUrlChange}
          className="mx-auto my-2 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={'可选：自定义 Base URL，如 https://api.openai.com/v1'}
        />
        <button
          type="button"
          onClick={props.onStartOpenRouterOAuth}
          disabled={props.oauthLoading}
          className="my-2 inline-flex items-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {props.oauthLoading ? '正在跳转 OpenRouter 授权...' : '使用 OpenRouter OAuth 获取 API Key'}
        </button>
        <p className="text-sm text-slate-500">授权成功后会自动填入 API Key 和 OpenRouter Base URL。</p>
        <div className="relin-paragraph-target mt-1 text-base text-slate-500">
          <div>
            如何获取你自己的 License Key
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 mb-6 pl-2 font-semibold text-sky-500 dark:text-sky-400"
            >
              https://shop.jimmylv.cn
            </a>
          </div>
        </div>
      </div>
    </details>
  )
}
