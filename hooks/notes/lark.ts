import { useState } from 'react'
import { useAnalytics } from '~/components/context/analytics'
import { useToast } from '~/hooks/use-toast'

export default function useSaveToLark(note: string, video: string, webhook: string) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { analytics } = useAnalytics()

  const save = async () => {
    const larkCardData = {
      msg_type: 'interactive',
      card: {
        elements: [
          {
            tag: 'div',
            text: {
              content: note,
              tag: 'plain_text',
            },
          },
          {
            tag: 'note',
            elements: [
              {
                tag: 'plain_text',
                content: `原视频：${video}`,
              },
            ],
          },
          {
            tag: 'action',
            actions: [
              {
                tag: 'button',
                text: {
                  tag: 'plain_text',
                  content: '观看视频',
                },
                type: 'primary',
                multi_url: {
                  url: video,
                },
              },
            ],
          },
        ],
        header: {
          template: 'blue',
          title: {
            content: 'BibiGPT 视频摘要',
            tag: 'plain_text',
          },
        },
      },
    }
    setLoading(true)
    console.log(note)
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(larkCardData),
    })
    const json = await response.json()
    console.log('========response========', json)
    if (!response.ok || json.code !== 0) {
      console.log('error', response)
      toast({
        variant: 'destructive',
        title: response.status.toString(),
        description: json.msg,
      })
    } else {
      toast({
        title: response.status.toString(),
        description: '成功推送到 飞书/Lark Webhook',
      })
    }
    setLoading(false)
    analytics.track('SaveLarkButton Clicked')
  }
  return { save, loading }
}
