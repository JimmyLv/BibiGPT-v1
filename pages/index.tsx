import { AnalyticsBrowser } from '@segment/analytics-next'
import { Analytics as AnalyticsType } from '@segment/analytics-next/dist/types/core/analytics'
import { NextPage } from 'next'
import React, { useEffect, useState } from 'react'
import { useAnalytics } from '~/components/context/analytics'
import SlugPage from './[...slug]'

const Home: NextPage<{
  showSingIn: (show: boolean) => void
}> = ({ showSingIn }) => {
  const [analytics, setAnalytics] = useState<AnalyticsType | undefined>(undefined)

  const { analytics: analyticsBrowser } = useAnalytics()
  useEffect(() => {
    async function handleAnalyticsLoading(browser: AnalyticsBrowser) {
      try {
        const [response, ctx] = await browser
        setAnalytics(response)
        // @ts-ignore
        window.analytics = response
        window.analytics?.page()
      } catch (err) {
        console.error(err)
        setAnalytics(undefined)
      }
    }
    handleAnalyticsLoading(analyticsBrowser).catch(console.error)
  }, [analyticsBrowser])
  return <SlugPage showSingIn={showSingIn} />
}
export default Home
