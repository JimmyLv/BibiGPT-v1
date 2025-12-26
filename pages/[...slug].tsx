import { zodResolver } from '@hookform/resolvers/zod'
import getVideoId from 'get-video-id'
import type { NextPage } from 'next'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import useFormPersist from 'react-hook-form-persist'
import { useAnalytics } from '~/components/context/analytics'
import { PromptOptions } from '~/components/PromptOptions'
import { SubmitButton } from '~/components/SubmitButton'
import { SummaryResult } from '~/components/SummaryResult'
import { TypingSlogan } from '~/components/TypingSlogan'
import { UsageAction } from '~/components/UsageAction'
import { UsageDescription } from '~/components/UsageDescription'
import { UserKeyInput } from '~/components/UserKeyInput'
import { useOpenRouterModels } from '~/hooks/useOpenRouterModels'
import { useToast } from '~/hooks/use-toast'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import { useSummarize } from '~/hooks/useSummarize'
import { VideoService } from '~/lib/types'
import { DEFAULT_LANGUAGE } from '~/utils/constants/language'
import { extractPage, extractUrl } from '~/utils/extractUrl'
import { getVideoIdFromUrl } from '~/utils/getVideoIdFromUrl'
import { VideoConfigSchema, videoConfigSchema } from '~/utils/schemas/video'

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/auth'

function toBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function generatePkceVerifier(length = 64) {
  const randomBytes = new Uint8Array(length)
  window.crypto.getRandomValues(randomBytes)
  return toBase64Url(randomBytes)
}

async function generatePkceChallenge(verifier: string) {
  const encoded = new TextEncoder().encode(verifier)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded)
  return toBase64Url(new Uint8Array(hashBuffer))
}

export const Home: NextPage<{
  showSingIn: (show: boolean) => void
}> = ({ showSingIn }) => {
  const router = useRouter()
  const urlState = router.query.slug
  const searchParams = useSearchParams()
  const licenseKey = searchParams.get('license_key')

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VideoConfigSchema>({
    defaultValues: {
      enableStream: true,
      model: '',
      showTimestamp: false,
      showEmoji: true,
      detailLevel: 600,
      sentenceNumber: 5,
      outlineLevel: 1,
      outputLanguage: DEFAULT_LANGUAGE,
    },
    resolver: zodResolver(videoConfigSchema),
  })

  // TODO: add mobx or state manager
  const [currentVideoId, setCurrentVideoId] = useState<string>('')
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('')
  const [userKey, setUserKey] = useLocalStorage<string>('user-openai-apikey')
  const [userBaseUrl, setUserBaseUrl] = useLocalStorage<string>('user-openai-base-url')
  const [oauthLoading, setOauthLoading] = useState(false)
  const { models: openRouterModels, latestModel, loading: modelLoading } = useOpenRouterModels()
  const { loading, summary, resetSummary, summarize } = useSummarize(showSingIn, getValues('enableStream'))
  const { toast } = useToast()
  const { analytics } = useAnalytics()

  useFormPersist('video-summary-config-storage', {
    watch,
    setValue,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined, // default window.sessionStorage
    // exclude: ['baz']
  })
  const shouldShowTimestamp = getValues('showTimestamp')

  useEffect(() => {
    licenseKey && setUserKey(licenseKey)
  }, [licenseKey])

  useEffect(() => {
    if (!openRouterModels.length) {
      return
    }
    const currentModel = getValues('model')
    if (!currentModel) {
      setValue('model', openRouterModels[0].id)
    }
  }, [openRouterModels, getValues, setValue])

  useEffect(() => {
    // https://www.youtube.com/watch?v=DHhOgWPKIKU
    // todo: support redirect from www.youtube.jimmylv.cn/watch?v=DHhOgWPKIKU
    const validatedUrl = getVideoIdFromUrl(router.isReady, currentVideoUrl, urlState, searchParams)

    console.log('getVideoUrlFromUrl', validatedUrl)

    validatedUrl && generateSummary(validatedUrl)
  }, [router.isReady, urlState, searchParams])

  const validateUrlFromAddressBar = (url?: string) => {
    // note: auto refactor by ChatGPT
    const videoUrl = url || currentVideoUrl
    if (
      // https://www.bilibili.com/video/BV1AL4y1j7RY
      // https://www.bilibili.com/video/BV1854y1u7B8/?p=6
      // https://www.bilibili.com/video/av352747000
      // todo: b23.tv url with title
      // todo: any article url
      !(videoUrl.includes('bilibili.com/video') || videoUrl.includes('youtube.com'))
    ) {
      toast({
        title: '暂不支持此视频链接',
        description: '请输入哔哩哔哩或YouTub视频链接，已支持b23.tv短链接',
      })
      return
    }

    // 来自输入框
    if (!url) {
      // -> '/video/BV12Y4y127rj'
      const curUrl = String(videoUrl.split('.com')[1])
      router.replace(curUrl)
    } else {
      setCurrentVideoUrl(videoUrl)
    }
  }
  const generateSummary = async (url?: string) => {
    const formValues = getValues()
    console.log('=======formValues=========', formValues)

    resetSummary()
    validateUrlFromAddressBar(url)

    const videoUrl = url || currentVideoUrl
    const { id, service } = getVideoId(videoUrl)
    if (service === VideoService.Youtube && id) {
      setCurrentVideoId(id)
      await summarize(
        { videoId: id, service: VideoService.Youtube, ...formValues },
        { userKey, baseUrl: userBaseUrl, shouldShowTimestamp: shouldShowTimestamp },
      )
      return
    }

    const videoId = extractUrl(videoUrl)
    if (!videoId) {
      return
    }

    const pageNumber = extractPage(currentVideoUrl, searchParams)
    setCurrentVideoId(videoId)
    await summarize(
      { service: VideoService.Bilibili, videoId, pageNumber, ...formValues },
      { userKey, baseUrl: userBaseUrl, shouldShowTimestamp },
    )
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 10)
  }
  const onFormSubmit: SubmitHandler<VideoConfigSchema> = async (data) => {
    // e.preventDefault();
    await generateSummary(currentVideoUrl)
    analytics.track('GenerateButton Clicked')
  }
  const handleApiKeyChange = (e: any) => {
    setUserKey(e.target.value)
  }
  const handleBaseUrlChange = (e: any) => {
    setUserBaseUrl(e.target.value)
  }

  const handleOpenRouterOAuth = async () => {
    if (typeof window === 'undefined') {
      return
    }

    if (!window.crypto?.subtle) {
      toast({
        variant: 'destructive',
        title: '浏览器不支持 OAuth 授权',
        description: '请升级浏览器后重试。',
      })
      return
    }

    try {
      setOauthLoading(true)
      const codeVerifier = generatePkceVerifier()
      const codeChallenge = await generatePkceChallenge(codeVerifier)
      const state = generatePkceVerifier(32)
      const callbackUrl = `${window.location.origin}/openrouter/callback`
      sessionStorage.setItem('openrouter_oauth_state', state)
      sessionStorage.setItem('openrouter_oauth_code_verifier', codeVerifier)

      const params = new URLSearchParams({
        callback_url: callbackUrl,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state,
      })
      window.location.assign(`${OPENROUTER_AUTH_URL}?${params.toString()}`)
    } catch (error: any) {
      setOauthLoading(false)
      toast({
        variant: 'destructive',
        title: 'OpenRouter OAuth 初始化失败',
        description: error?.message || '请稍后重试',
      })
    }
  }

  const handleInputChange = async (e: any) => {
    const value = e.target.value
    // todo: 兼容?query参数
    const regex = /((?:https?:\/\/|www\.)\S+)/g
    const matches = value.match(regex)
    if (matches && matches[0].includes('b23.tv')) {
      toast({ title: '正在自动转换此视频链接...' })
      const response = await fetch(`/api/b23tv?url=${matches[0]}`)
      const json = await response.json()
      setCurrentVideoUrl(json.url)
    } else {
      setCurrentVideoUrl(value)
    }
  }

  return (
    <div className="mt-10 w-full px-4 sm:mt-40 lg:px-0">
      <UsageDescription />
      <TypingSlogan latestModelName={latestModel?.name} />
      <UsageAction />
      <UserKeyInput
        value={userKey}
        onChange={handleApiKeyChange}
        baseUrl={userBaseUrl}
        onBaseUrlChange={handleBaseUrlChange}
        oauthLoading={oauthLoading}
        onStartOpenRouterOAuth={handleOpenRouterOAuth}
      />
      <form onSubmit={handleSubmit(onFormSubmit)} className="grid place-items-center">
        <input
          type="text"
          value={currentVideoUrl}
          onChange={handleInputChange}
          className="mx-auto mt-10 w-full appearance-none rounded-lg rounded-md border bg-transparent py-2 pl-2 text-sm leading-6 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={'输入 bilibili.com/youtube.com 视频链接，按下「回车」'}
        />
        <SubmitButton loading={loading} />
        <PromptOptions
          getValues={getValues}
          register={register}
          modelOptions={openRouterModels}
          modelLoading={modelLoading}
        />
      </form>
      {summary && (
        <SummaryResult
          summary={summary}
          currentVideoUrl={currentVideoUrl}
          currentVideoId={currentVideoId}
          shouldShowTimestamp={shouldShowTimestamp}
        />
      )}
    </div>
  )
}

export default Home
