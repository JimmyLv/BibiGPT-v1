import { useState } from 'react'
import { useAnalytics } from '~/components/context/analytics'
import { useToast } from '~/hooks/use-toast'

export default function useSaveToLark(note: string, webhook: string) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { analytics } = useAnalytics()

  const save = async () => {
    setLoading(true)
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg_type: 'post',
        content: {
          post: {
            zh_cn: {
              title: 'BibiGPT 总结',
              content: [
                [
                  {
                    tag: 'text',
                    text: note,
                  },
                ],
              ],
            },
          },
        },
      }),
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
