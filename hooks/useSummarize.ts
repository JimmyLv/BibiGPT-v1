import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import { useEffect, useMemo } from 'react'
import { useToast } from '~/hooks/use-toast'
import { UserConfig, VideoConfig } from '~/lib/types'
import { RATE_LIMIT_COUNT } from '~/utils/constants'

function parseBackendErrorMessage(message: string) {
  const matcher = message.match(/^(\d{3})::([\s\S]*)$/)
  if (!matcher) {
    return { statusCode: 0, detail: message }
  }

  return {
    statusCode: Number(matcher[1]),
    detail: matcher[2].trim(),
  }
}

function extractLatestAssistantText(messages: Array<{ role: string; parts: Array<{ type: string; text?: string }> }>) {
  const assistantMessage = [...messages].reverse().find((message) => message.role === 'assistant')
  if (!assistantMessage) {
    return ''
  }

  return assistantMessage.parts
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('')
}

export function useSummarize(showSingIn: (show: boolean) => void, _enableStream: boolean = true) {
  const { toast } = useToast()
  const transport = useMemo(() => new TextStreamChatTransport({ api: '/api/chat' }), [])
  const { messages, status, error, sendMessage, setMessages } = useChat({
    transport,
  })

  const loading = status === 'submitted' || status === 'streaming'
  const summary = useMemo(() => extractLatestAssistantText(messages), [messages])

  useEffect(() => {
    if (!error) {
      return
    }

    const { statusCode, detail } = parseBackendErrorMessage(error.message || 'Unknown error')
    if (statusCode === 501) {
      toast({
        title: '啊叻？视频字幕不见了？！',
        description: `\n（这个视频太短了...\n或者还没有字幕哦！）`,
      })
      return
    }

    if (statusCode === 504) {
      toast({
        variant: 'destructive',
        title: `网站访问量过大`,
        description: `每日限额使用 ${RATE_LIMIT_COUNT} 次哦！`,
      })
      return
    }

    if (statusCode === 401) {
      toast({
        variant: 'destructive',
        title: `${statusCode} 请登录哦！`,
        description: '每天的免费次数已经用完啦，🆓',
      })
      showSingIn(true)
      return
    }

    toast({
      variant: 'destructive',
      title: 'API 请求出错，请重试。',
      description: detail || error.message,
    })
  }, [error, showSingIn, toast])

  const resetSummary = () => {
    setMessages([])
  }

  const summarize = async (videoConfig: VideoConfig, userConfig: UserConfig) => {
    setMessages([])
    try {
      await sendMessage(
        {
          text: `Summarize video ${videoConfig.videoId}`,
        },
        {
          body: {
            videoConfig,
            userConfig,
          },
        },
      )
    } catch (e) {
      // error state is handled by useChat and the effect above.
    }
  }

  return { loading, summary, resetSummary, summarize }
}
